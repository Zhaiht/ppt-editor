import PptxGenJS from 'pptxgenjs';
import { Slide, SlideElement } from '../types';

// 画布尺寸 960x540，PPT 标准 10x5.625 英寸
const SLIDE_W = 960;
const SLIDE_H = 540;
const PPT_W = 10;
const PPT_H = 5.625;

function px2inch(px: number, axis: 'x' | 'y'): number {
  return axis === 'x' ? (px / SLIDE_W) * PPT_W : (px / SLIDE_H) * PPT_H;
}

function hexToRgb(hex: string): string {
  return hex.replace('#', '');
}

function addTextElement(pptSlide: PptxGenJS.Slide, el: SlideElement) {
  const opts: PptxGenJS.TextPropsOptions = {
    x: px2inch(el.x, 'x'),
    y: px2inch(el.y, 'y'),
    w: px2inch(el.width, 'x'),
    h: px2inch(el.height, 'y'),
    fontSize: el.fontSize ? el.fontSize * 0.75 : 18,
    fontFace: el.fontFamily || 'Microsoft YaHei',
    color: hexToRgb(el.color || '#333333'),
    bold: el.bold || false,
    italic: el.italic || false,
    valign: 'top',
    wrap: true,
  };
  pptSlide.addText(el.content || '', opts);
}

function addRectElement(pptSlide: PptxGenJS.Slide, el: SlideElement) {
  pptSlide.addShape('rect' as PptxGenJS.ShapeType, {
    x: px2inch(el.x, 'x'),
    y: px2inch(el.y, 'y'),
    w: px2inch(el.width, 'x'),
    h: px2inch(el.height, 'y'),
    fill: { color: hexToRgb(el.fill || '#4A90D9') },
    line: {
      color: hexToRgb(el.stroke || '#2C5F8A'),
      width: el.strokeWidth || 2,
    },
  });
}

function addEllipseElement(pptSlide: PptxGenJS.Slide, el: SlideElement) {
  pptSlide.addShape('ellipse' as PptxGenJS.ShapeType, {
    x: px2inch(el.x, 'x'),
    y: px2inch(el.y, 'y'),
    w: px2inch(el.width, 'x'),
    h: px2inch(el.height, 'y'),
    fill: { color: hexToRgb(el.fill || '#D94A4A') },
    line: {
      color: hexToRgb(el.stroke || '#8A2C2C'),
      width: el.strokeWidth || 2,
    },
  });
}

function addImageElement(pptSlide: PptxGenJS.Slide, el: SlideElement) {
  if (!el.imageSrc) return;
  pptSlide.addImage({
    data: el.imageSrc,
    x: px2inch(el.x, 'x'),
    y: px2inch(el.y, 'y'),
    w: px2inch(el.width, 'x'),
    h: px2inch(el.height, 'y'),
  });
}

export async function exportToPptx(slides: Slide[], filename: string = '演示文稿') {
  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_WIDE';

  for (const slide of slides) {
    const pptSlide = pptx.addSlide();

    // 设置背景
    if (slide.background && slide.background !== '#ffffff') {
      pptSlide.background = { fill: hexToRgb(slide.background) };
    }

    // 添加元素
    for (const el of slide.elements) {
      switch (el.type) {
        case 'text':
          addTextElement(pptSlide, el);
          break;
        case 'rect':
          addRectElement(pptSlide, el);
          break;
        case 'ellipse':
          addEllipseElement(pptSlide, el);
          break;
        case 'image':
          addImageElement(pptSlide, el);
          break;
      }
    }
  }

  await pptx.writeFile({ fileName: `${filename}.pptx` });
}
