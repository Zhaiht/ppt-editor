import React, { useRef, useEffect, useCallback, useState } from 'react';
import { useEditorStore } from '../store';
import { DragState } from '../types';
import { drawSlide } from '../utils/draw';
import { hitTestElement, hitTestHandle } from '../utils/hitTest';
import { v4 as uuid } from 'uuid';

const SLIDE_W = 960;
const SLIDE_H = 540;

export const Canvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [canvasSize, setCanvasSize] = useState({ w: 800, h: 600 });
  const [dragState, setDragState] = useState<DragState | null>(null);
  const imageCacheRef = useRef<Map<string, HTMLImageElement>>(new Map());

  const {
    slides, currentSlideIndex, selectedElementId, activeTool, editingTextId, pendingTableSize,
    editingTableCell,
    selectElement, addElement, updateElement, setActiveTool, setEditingText, setPendingTableSize,
    setEditingTableCell, updateTableCell,
  } = useEditorStore();

  const slide = slides[currentSlideIndex];

  // compute scale and offset to center slide
  const scale = Math.min((canvasSize.w - 40) / SLIDE_W, (canvasSize.h - 40) / SLIDE_H, 1.2);
  const offsetX = (canvasSize.w - SLIDE_W * scale) / 2;
  const offsetY = (canvasSize.h - SLIDE_H * scale) / 2;

  // convert canvas coords to slide coords
  const toSlide = useCallback((cx: number, cy: number) => ({
    x: (cx - offsetX) / scale,
    y: (cy - offsetY) / scale,
  }), [offsetX, offsetY, scale]);

  // resize observer
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setCanvasSize({ w: width, h: height });
    });
    ro.observe(container);
    return () => ro.disconnect();
  }, []);

  // redraw
  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvasSize.w * dpr;
    canvas.height = canvasSize.h * dpr;
    canvas.style.width = canvasSize.w + 'px';
    canvas.style.height = canvasSize.h + 'px';
    ctx.scale(dpr, dpr);
    drawSlide(ctx, canvasSize.w, canvasSize.h, slide.elements, slide.background,
      selectedElementId, editingTextId, imageCacheRef.current, scale, offsetX, offsetY);
  }, [canvasSize, slide, selectedElementId, editingTextId, editingTableCell, scale, offsetX, offsetY]);

  // load images into cache
  useEffect(() => {
    let needsRedraw = false;
    for (const el of slide.elements) {
      if (el.type === 'image' && el.imageSrc && !imageCacheRef.current.has(el.id)) {
        const img = new Image();
        img.src = el.imageSrc;
        img.onload = () => redraw();
        imageCacheRef.current.set(el.id, img);
        needsRedraw = true;
      }
    }
    if (needsRedraw) redraw();
  }, [slide.elements, redraw]);

  useEffect(() => { redraw(); }, [redraw]);

  // mouse down
  const handleMouseDown = (e: React.MouseEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;
    const { x: sx, y: sy } = toSlide(cx, cy);

    // creating new elements
  if (activeTool === 'text') {
      const id = uuid();
      addElement({
        id, type: 'text', x: sx, y: sy, width: 200, height: 50, rotation: 0,
        content: '双击编辑文本', fontSize: 24, color: '#333333',
      });
      setActiveTool('select');
      return;
  }
  if (activeTool === 'rect' || activeTool === 'ellipse') {
      const id = uuid();
      addElement({
        id, type: activeTool, x: sx, y: sy, width: 150, height: 100, rotation: 0,
        fill: activeTool === 'rect' ? '#4A90D9' : '#D94A4A',
        stroke: activeTool === 'rect' ? '#2C5F8A' : '#8A2C2C',
        strokeWidth: 2,
      });
      setActiveTool('select');
      return;
    }
    if (activeTool === 'table') {
      if (!pendingTableSize) {
        setActiveTool('select');
        return;
      }
      const { rows, cols } = pendingTableSize;
      const id = uuid();
      const tableData = Array.from({ length: rows }, () => Array.from({ length: cols }, () => ''));
      addElement({
        id,
        type: 'table',
        x: sx,
        y: sy,
        width: cols * 80,
        height: rows * 36,
        rotation: 0,
        stroke: '#666666',
        strokeWidth: 1,
        rows,
        cols,
        tableData,
      });
      setPendingTableSize(null);
      setActiveTool('select');
      return;
    }

    // select mode: check handles first, then elements
    if (selectedElementId) {
      const selEl = slide.elements.find((el) => el.id === selectedElementId);
      if (selEl) {
        const handle = hitTestHandle(selEl, sx, sy);
        if (handle) {
          setDragState({
            type: 'resize', handle, startX: sx, startY: sy,
            origX: selEl.x, origY: selEl.y, origW: selEl.width, origH: selEl.height,
          });
          return;
        }
      }
    }

    // hit test elements (reverse order for top-most)
    for (let i = slide.elements.length - 1; i >= 0; i--) {
      const el = slide.elements[i];
      if (hitTestElement(el, sx, sy)) {
        selectElement(el.id);
        setDragState({
          type: 'move', startX: sx, startY: sy,
          origX: el.x, origY: el.y, origW: el.width, origH: el.height,
        });
        return;
      }
    }

    selectElement(null);
  };

  // mouse move
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragState || !selectedElementId) return;
    const rect = canvasRef.current!.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;
    const { x: sx, y: sy } = toSlide(cx, cy);
    const dx = sx - dragState.startX;
    const dy = sy - dragState.startY;

    if (dragState.type === 'move') {
      updateElement(selectedElementId, {
        x: dragState.origX + dx,
        y: dragState.origY + dy,
      });
    } else if (dragState.type === 'resize' && dragState.handle) {
      const h = dragState.handle;
      let newX = dragState.origX;
      let newY = dragState.origY;
      let newW = dragState.origW;
      let newH = dragState.origH;

      if (h.includes('e')) { newW = Math.max(20, dragState.origW + dx); }
      if (h.includes('w')) { newX = dragState.origX + dx; newW = Math.max(20, dragState.origW - dx); }
      if (h.includes('s')) { newH = Math.max(20, dragState.origH + dy); }
      if (h.includes('n')) { newY = dragState.origY + dy; newH = Math.max(20, dragState.origH - dy); }

      updateElement(selectedElementId, { x: newX, y: newY, width: newW, height: newH });
    }
  };

  const handleMouseUp = () => { setDragState(null); };

  // double click for text editing or table cell editing
  const handleDoubleClick = (e: React.MouseEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const { x: sx, y: sy } = toSlide(e.clientX - rect.left, e.clientY - rect.top);
    for (let i = slide.elements.length - 1; i >= 0; i--) {
      const el = slide.elements[i];
      if (el.type === 'text' && hitTestElement(el, sx, sy)) {
        selectElement(el.id);
        setEditingText(el.id);
        setTimeout(() => textareaRef.current?.focus(), 50);
        return;
      }
      if (el.type === 'table' && hitTestElement(el, sx, sy)) {
        const rows = el.rows || 3;
        const cols = el.cols || 4;
        const colWidth = el.width / cols;
        const rowHeight = el.height / rows;
        const col = Math.min(cols - 1, Math.max(0, Math.floor((sx - el.x) / colWidth)));
        const row = Math.min(rows - 1, Math.max(0, Math.floor((sy - el.y) / rowHeight)));
        selectElement(el.id);
        setEditingTableCell({ elementId: el.id, row, col });
        return;
      }
    }
  };

  // get editing element position for textarea overlay
  const editingEl = editingTextId ? slide.elements.find((el) => el.id === editingTextId) : null;

  // keyboard
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (editingTextId || editingTableCell) return; // don't intercept when editing
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedElementId) {
        useEditorStore.getState().deleteElement(selectedElementId);
      }
      if (e.key === 'Escape') {
        selectElement(null);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [selectedElementId, editingTextId, editingTableCell, selectElement]);

  // cursor style
  let cursor = 'default';
  if (activeTool === 'text') cursor = 'text';
  if (activeTool === 'rect' || activeTool === 'ellipse') cursor = 'crosshair';

  // get editing table cell info
  const editingTableEl = editingTableCell ? slide.elements.find((el) => el.id === editingTableCell.elementId) : null;
  const tableCellOverlay = editingTableCell && editingTableEl ? (() => {
    const rows = editingTableEl.rows || 3;
    const cols = editingTableEl.cols || 4;
    const colWidth = editingTableEl.width / cols;
    const rowHeight = editingTableEl.height / rows;
    const cellX = editingTableEl.x + editingTableCell.col * colWidth;
    const cellY = editingTableEl.y + editingTableCell.row * rowHeight;
    const cellValue = editingTableEl.tableData?.[editingTableCell.row]?.[editingTableCell.col] || '';
    return { cellX, cellY, colWidth, rowHeight, cellValue };
  })() : null;

  return (
    <div ref={containerRef} style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
      <canvas
        ref={canvasRef}
        style={{ cursor, display: 'block', width: '100%', height: '100%' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onDoubleClick={handleDoubleClick}
      />
      {editingEl && (
        <textarea
          ref={textareaRef}
          value={editingEl.content || ''}
          onChange={(e) => updateElement(editingEl.id, { content: e.target.value })}
          onBlur={() => setEditingText(null)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setEditingText(null);
          }}
          style={{
            position: 'absolute',
            left: offsetX + editingEl.x * scale,
            top: offsetY + editingEl.y * scale,
            width: editingEl.width * scale,
            height: editingEl.height * scale,
            fontSize: (editingEl.fontSize || 24) * scale,
            fontFamily: editingEl.fontFamily || 'sans-serif',
            fontWeight: editingEl.bold ? 'bold' : 'normal',
            fontStyle: editingEl.italic ? 'italic' : 'normal',
            color: editingEl.color || '#333',
            background: 'rgba(255,255,255,0.9)',
            border: '2px solid #2196F3',
            borderRadius: 4,
            padding: 4 * scale,
            resize: 'none',
            outline: 'none',
            lineHeight: 1.3,
            overflow: 'hidden',
          }}
        />
      )}
      {tableCellOverlay && editingTableCell && (
        <input
          autoFocus
          value={tableCellOverlay.cellValue}
          onChange={(e) => updateTableCell(editingTableCell.elementId, editingTableCell.row, editingTableCell.col, e.target.value)}
          onBlur={() => setEditingTableCell(null)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setEditingTableCell(null);
            if (e.key === 'Tab') {
              e.preventDefault();
              const el = editingTableEl!;
              const rows = el.rows || 3;
              const cols = el.cols || 4;
              let nextCol = editingTableCell.col + (e.shiftKey ? -1 : 1);
              let nextRow = editingTableCell.row;
              if (nextCol >= cols) { nextCol = 0; nextRow++; }
              if (nextCol < 0) { nextCol = cols - 1; nextRow--; }
              if (nextRow >= 0 && nextRow < rows) {
                setEditingTableCell({ elementId: editingTableCell.elementId, row: nextRow, col: nextCol });
              } else {
                setEditingTableCell(null);
              }
            }
            if (e.key === 'Enter') {
              e.preventDefault();
              const el = editingTableEl!;
              const rows = el.rows || 3;
              const nextRow = editingTableCell.row + 1;
              if (nextRow < rows) {
                setEditingTableCell({ elementId: editingTableCell.elementId, row: nextRow, col: editingTableCell.col });
              } else {
                setEditingTableCell(null);
              }
            }
          }}
          style={{
            position: 'absolute',
            left: offsetX + tableCellOverlay.cellX * scale,
            top: offsetY + tableCellOverlay.cellY * scale,
            width: tableCellOverlay.colWidth * scale,
            height: tableCellOverlay.rowHeight * scale,
            fontSize: 13 * scale,
            fontFamily: 'sans-serif',
            color: '#333',
            background: 'rgba(255,255,255,0.95)',
            border: '2px solid #4a86e8',
            padding: `${2 * scale}px ${4 * scale}px`,
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />
      )}
    </div>
  );
};
