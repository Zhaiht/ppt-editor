import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useEditorStore } from '../store';
import { Slide } from '../types';
import { drawThumbnail } from '../utils/draw';

const THUMB_W = 156;
const THUMB_H = Math.round(THUMB_W * 9 / 16);

function SlideThumbnail({ slide }: { slide: Slide }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageCacheRef = useRef<Map<string, HTMLImageElement>>(new Map());

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = THUMB_W * dpr;
    canvas.height = THUMB_H * dpr;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    drawThumbnail(ctx, THUMB_W, THUMB_H, slide.elements, slide.background, imageCacheRef.current);
  }, [slide.elements, slide.background]);

  // load images
  useEffect(() => {
    let pending = 0;
    for (const el of slide.elements) {
      if (el.type === 'image' && el.imageSrc && !imageCacheRef.current.has(el.id)) {
        pending++;
        const img = new Image();
        img.src = el.imageSrc;
        img.onload = () => {
          pending--;
          if (pending === 0) render();
        };
        imageCacheRef.current.set(el.id, img);
      }
    }
  }, [slide.elements, render]);

  useEffect(() => { render(); }, [render]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: THUMB_W, height: THUMB_H, display: 'block', borderRadius: 2 }}
    />
  );
}

export const SlidePanel: React.FC = () => {
  const { slides, currentSlideIndex, setCurrentSlide, deleteSlide, duplicateSlide, addSlide } = useEditorStore();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div style={s.panel}>
      <div style={s.list}>
        {slides.map((slide, i) => (
          <div
            key={slide.id}
            style={s.row}
            onMouseEnter={() => setHoveredIndex(i)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <span style={s.num}>{i + 1}</span>
            <div
              onClick={() => setCurrentSlide(i)}
              style={{
                ...s.thumb,
                border: i === currentSlideIndex ? '2px solid #4a86e8' : '2px solid transparent',
                boxShadow: i === currentSlideIndex ? '0 0 0 1px #4a86e8' : '0 1px 3px rgba(0,0,0,0.12)',
              }}
            >
              <SlideThumbnail slide={slide} />
              {hoveredIndex === i && (
                <div style={s.actions}>
                  <button style={s.actBtn} onClick={(e) => { e.stopPropagation(); duplicateSlide(i); }} title="复制">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
                  </button>
                  {slides.length > 1 && (
                    <button style={s.actBtn} onClick={(e) => { e.stopPropagation(); deleteSlide(i); }} title="删除">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      <button style={s.addBtn} onClick={addSlide}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
        <span>新建页面</span>
      </button>
    </div>
  );
};

const s: Record<string, React.CSSProperties> = {
  panel: {
    width: 200,
    background: '#f6f6f6',
    borderRight: '1px solid #e2e2e2',
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
    overflow: 'hidden',
  },
  list: {
    flex: 1,
    overflowY: 'auto',
    padding: '12px 8px 12px 4px',
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  num: {
    width: 24,
    textAlign: 'right' as const,
    fontSize: 11,
    color: '#999',
    flexShrink: 0,
  },
  thumb: {
    flex: 1,
    borderRadius: 4,
    overflow: 'hidden',
    cursor: 'pointer',
    position: 'relative' as const,
    transition: 'border-color 0.15s, box-shadow 0.15s',
  },
  actions: {
    position: 'absolute' as const,
    top: 3,
    right: 3,
    display: 'flex',
    gap: 2,
  },
  actBtn: {
    width: 20,
    height: 20,
    border: 'none',
    borderRadius: 3,
    background: 'rgba(0,0,0,0.5)',
    color: '#fff',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
  },
  addBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    margin: '8px 12px 12px',
    padding: '8px 0',
    border: '1px dashed #c0c0c0',
    borderRadius: 4,
    background: 'transparent',
    color: '#666',
    fontSize: 12,
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
};
