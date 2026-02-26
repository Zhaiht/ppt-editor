import { SlideElement } from '../types';

const HANDLE_SIZE = 8;

export function hitTestElement(el: SlideElement, px: number, py: number): boolean {
  return px >= el.x && px <= el.x + el.width && py >= el.y && py <= el.y + el.height;
}

export function hitTestHandle(el: SlideElement, px: number, py: number): string | null {
  const handles = getHandles(el);
  for (const [name, hx, hy] of handles) {
    if (Math.abs(px - hx) <= HANDLE_SIZE && Math.abs(py - hy) <= HANDLE_SIZE) {
      return name;
    }
  }
  return null;
}

export function getHandles(el: SlideElement): [string, number, number][] {
  const { x, y, width: w, height: h } = el;
  return [
    ['nw', x, y],
    ['ne', x + w, y],
    ['sw', x, y + h],
    ['se', x + w, y + h],
    ['n', x + w / 2, y],
    ['s', x + w / 2, y + h],
    ['w', x, y + h / 2],
    ['e', x + w, y + h / 2],
  ];
}
