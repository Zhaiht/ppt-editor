export interface SlideElement {
  id: string;
  type: 'text' | 'rect' | 'ellipse' | 'image' | 'table';
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  content?: string;
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  imageSrc?: string;
  bold?: boolean;
  italic?: boolean;

  // table specific
  rows?: number;
  cols?: number;
}

export interface Slide {
  id: string;
  elements: SlideElement[];
  background: string;
}

export type Tool = 'select' | 'text' | 'rect' | 'ellipse' | 'image' | 'table';

export interface DragState {
  type: 'move' | 'resize';
  handle?: string;
  startX: number;
  startY: number;
  origX: number;
  origY: number;
  origW: number;
  origH: number;
}
