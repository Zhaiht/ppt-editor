import { SlideElement } from '../types';
import { getHandles } from './hitTest';

const HANDLE_SIZE = 8;

export function drawElement(ctx: CanvasRenderingContext2D, el: SlideElement, isSelected: boolean, isEditing: boolean) {
  ctx.save();

  switch (el.type) {
    case 'rect':
      ctx.fillStyle = el.fill || '#4A90D9';
      ctx.strokeStyle = el.stroke || '#2C5F8A';
      ctx.lineWidth = el.strokeWidth || 2;
      ctx.fillRect(el.x, el.y, el.width, el.height);
      ctx.strokeRect(el.x, el.y, el.width, el.height);
      break;

    case 'ellipse':
      ctx.fillStyle = el.fill || '#D94A4A';
      ctx.strokeStyle = el.stroke || '#8A2C2C';
      ctx.lineWidth = el.strokeWidth || 2;
      ctx.beginPath();
      ctx.ellipse(el.x + el.width / 2, el.y + el.height / 2, el.width / 2, el.height / 2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      break;

    case 'table': {
      const rows = el.rows || 3;
      const cols = el.cols || 4;
      const strokeColor = el.stroke || '#666666';
      const strokeWidth = el.strokeWidth ?? 1;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(el.x, el.y, el.width, el.height);
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = strokeWidth;
      ctx.strokeRect(el.x, el.y, el.width, el.height);

      const rowHeight = el.height / rows;
      const colWidth = el.width / cols;

      // 横线
      for (let r = 1; r < rows; r++) {
        const y = el.y + r * rowHeight;
        ctx.beginPath();
        ctx.moveTo(el.x, y);
        ctx.lineTo(el.x + el.width, y);
        ctx.stroke();
      }

      // 竖线
      for (let c = 1; c < cols; c++) {
        const x = el.x + c * colWidth;
        ctx.beginPath();
        ctx.moveTo(x, el.y);
        ctx.lineTo(x, el.y + el.height);
        ctx.stroke();
      }

      // 绘制单元格文字
      if (el.tableData) {
        ctx.fillStyle = '#333333';
        const fontSize = Math.min(14, rowHeight * 0.5);
        ctx.font = `${fontSize}px sans-serif`;
        ctx.textBaseline = 'middle';
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const text = el.tableData[r]?.[c];
            if (text) {
              const cx = el.x + c * colWidth + 4;
              const cy = el.y + r * rowHeight + rowHeight / 2;
              ctx.fillText(text, cx, cy, colWidth - 8);
            }
          }
        }
      }
      break;
    }

    case 'text':
      drawText(ctx, el, isEditing);
      break;

    case 'image':
      // image drawn separately via cached Image objects
      break;
  }

  if (isSelected && !isEditing) {
    drawSelectionBox(ctx, el);
  }

  ctx.restore();
}

function drawText(ctx: CanvasRenderingContext2D, el: SlideElement, isEditing: boolean) {
  // editing state: textarea overlay handles display, skip canvas text
  if (isEditing) return;

  const fontSize = el.fontSize || 24;
  const fontFamily = el.fontFamily || 'sans-serif';
  const bold = el.bold ? 'bold ' : '';
  const italic = el.italic ? 'italic ' : '';
  ctx.font = `${italic}${bold}${fontSize}px ${fontFamily}`;
  ctx.fillStyle = el.color || '#333333';
  ctx.textBaseline = 'top';

  const text = el.content || '';
  const lines = text.split('\n');
  const lineHeight = fontSize * 1.3;

  lines.forEach((line, i) => {
    ctx.fillText(line, el.x + 4, el.y + 4 + i * lineHeight, el.width - 8);
  });
}

function drawSelectionBox(ctx: CanvasRenderingContext2D, el: SlideElement) {
  ctx.strokeStyle = '#4a86e8';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([]);
  ctx.strokeRect(el.x - 1, el.y - 1, el.width + 2, el.height + 2);

  // draw handles (round)
  const handles = getHandles(el);
  for (const [, hx, hy] of handles) {
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#4a86e8';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(hx, hy, HANDLE_SIZE / 2 + 1, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
}

export function drawSlide(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  elements: SlideElement[],
  background: string,
  selectedId: string | null,
  editingId: string | null,
  imageCache: Map<string, HTMLImageElement>,
  scale: number,
  offsetX: number,
  offsetY: number,
) {
  const SLIDE_W = 960;
  const SLIDE_H = 540;

  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  // dark background
  ctx.fillStyle = '#3b3b3b';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  ctx.save();
  ctx.translate(offsetX, offsetY);
  ctx.scale(scale, scale);

  // slide shadow
  ctx.shadowColor = 'rgba(0,0,0,0.3)';
  ctx.shadowBlur = 20;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 4;
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, SLIDE_W, SLIDE_H);
  ctx.shadowColor = 'transparent';

  // slide border
  ctx.strokeStyle = '#ccc';
  ctx.lineWidth = 1;
  ctx.strokeRect(0, 0, SLIDE_W, SLIDE_H);

  // clip to slide
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, SLIDE_W, SLIDE_H);
  ctx.clip();

  for (const el of elements) {
    if (el.type === 'image' && el.imageSrc) {
      const img = imageCache.get(el.id);
      if (img && img.complete) {
        ctx.drawImage(img, el.x, el.y, el.width, el.height);
        if (el.id === selectedId) {
          drawSelectionBox(ctx, el);
        }
      }
    } else {
      drawElement(ctx, el, el.id === selectedId, el.id === editingId);
    }
  }

  ctx.restore();
  ctx.restore();
}

export function drawThumbnail(
  ctx: CanvasRenderingContext2D,
  thumbW: number,
  thumbH: number,
  elements: SlideElement[],
  background: string,
  imageCache: Map<string, HTMLImageElement>,
) {
  const SLIDE_W = 960;
  const SLIDE_H = 540;
  const scale = Math.min(thumbW / SLIDE_W, thumbH / SLIDE_H);
  const ox = (thumbW - SLIDE_W * scale) / 2;
  const oy = (thumbH - SLIDE_H * scale) / 2;

  ctx.clearRect(0, 0, thumbW, thumbH);
  ctx.save();
  ctx.translate(ox, oy);
  ctx.scale(scale, scale);

  // slide background
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, SLIDE_W, SLIDE_H);

  // clip
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, SLIDE_W, SLIDE_H);
  ctx.clip();

  for (const el of elements) {
    if (el.type === 'image' && el.imageSrc) {
      const img = imageCache.get(el.id);
      if (img && img.complete) {
        ctx.drawImage(img, el.x, el.y, el.width, el.height);
      }
    } else {
      drawElement(ctx, el, false, false);
    }
  }

  ctx.restore();
  ctx.restore();
}
