import { create } from 'zustand';
import { v4 as uuid } from 'uuid';
import { Slide, SlideElement, Tool } from './types';

function createDefaultSlide(): Slide {
  return { id: uuid(), elements: [], background: '#ffffff' };
}

interface EditorState {
  slides: Slide[];
  currentSlideIndex: number;
  selectedElementId: string | null;
  activeTool: Tool;
  editingTextId: string | null;
  editingTableCell: { elementId: string; row: number; col: number } | null;
  tableSelection: { elementId: string; type: 'row' | 'col'; index: number } | null;
  fileName: string;
  pendingTableSize: { rows: number; cols: number } | null;

  // actions
  setFileName: (name: string) => void;
  setPendingTableSize: (size: { rows: number; cols: number } | null) => void;
  setEditingTableCell: (cell: { elementId: string; row: number; col: number } | null) => void;
  setTableSelection: (sel: { elementId: string; type: 'row' | 'col'; index: number } | null) => void;
  updateTableCell: (elementId: string, row: number, col: number, value: string) => void;
  setActiveTool: (tool: Tool) => void;
  setCurrentSlide: (index: number) => void;
  addSlide: (slide?: Slide) => void;
  deleteSlide: (index: number) => void;
  duplicateSlide: (index: number) => void;
  addElement: (el: SlideElement) => void;
  updateElement: (id: string, patch: Partial<SlideElement>) => void;
  deleteElement: (id: string) => void;
  selectElement: (id: string | null) => void;
  setEditingText: (id: string | null) => void;
  setSlideBackground: (color: string) => void;
  moveSlide: (from: number, to: number) => void;
  newPresentation: () => void;
  getCurrentSlide: () => Slide;
  getSelectedElement: () => SlideElement | undefined;
}

export const useEditorStore = create<EditorState>((set, get) => ({
  slides: [createDefaultSlide()],
  currentSlideIndex: 0,
  selectedElementId: null,
  activeTool: 'select',
  editingTextId: null,
  editingTableCell: null,
  tableSelection: null,
  fileName: '演示文档',
  pendingTableSize: null,

  setFileName: (name) => set({ fileName: name }),
  setPendingTableSize: (size) => set({ pendingTableSize: size }),
  setEditingTableCell: (cell) => set({ editingTableCell: cell, tableSelection: null }),
  setTableSelection: (sel) => set({ tableSelection: sel, editingTableCell: null }),
  updateTableCell: (elementId, row, col, value) => set((s) => {
    const slides = [...s.slides];
    const slide = { ...slides[s.currentSlideIndex] };
    slide.elements = slide.elements.map((el) => {
      if (el.id !== elementId || !el.tableData) return el;
      const tableData = el.tableData.map((r) => [...r]);
      tableData[row][col] = value;
      return { ...el, tableData };
    });
    slides[s.currentSlideIndex] = slide;
    return { slides };
  }),
  setActiveTool: (tool) => set({ activeTool: tool }),
  setCurrentSlide: (index) => set({ currentSlideIndex: index, selectedElementId: null, editingTextId: null }),

  addSlide: (slide?) => set((s) => {
    const newSlide = slide || createDefaultSlide();
    const slides = [...s.slides];
    slides.splice(s.currentSlideIndex + 1, 0, newSlide);
    return { slides, currentSlideIndex: s.currentSlideIndex + 1, selectedElementId: null, editingTextId: null };
  }),

  deleteSlide: (index) => set((s) => {
    if (s.slides.length <= 1) return s;
    const slides = s.slides.filter((_, i) => i !== index);
    const newIndex = Math.min(index, slides.length - 1);
    return { slides, currentSlideIndex: newIndex, selectedElementId: null, editingTextId: null };
  }),

  duplicateSlide: (index) => set((s) => {
    const source = s.slides[index];
    const dup: Slide = {
      id: uuid(),
      background: source.background,
      elements: source.elements.map((el) => ({ ...el, id: uuid() })),
    };
    const slides = [...s.slides];
    slides.splice(index + 1, 0, dup);
    return { slides, currentSlideIndex: index + 1 };
  }),

  addElement: (el) => set((s) => {
    const slides = [...s.slides];
    const slide = { ...slides[s.currentSlideIndex] };
    slide.elements = [...slide.elements, el];
    slides[s.currentSlideIndex] = slide;
    return { slides, selectedElementId: el.id, activeTool: 'select' };
  }),

  updateElement: (id, patch) => set((s) => {
    const slides = [...s.slides];
    const slide = { ...slides[s.currentSlideIndex] };
    slide.elements = slide.elements.map((el) => (el.id === id ? { ...el, ...patch } : el));
    slides[s.currentSlideIndex] = slide;
    return { slides };
  }),

  deleteElement: (id) => set((s) => {
    const slides = [...s.slides];
    const slide = { ...slides[s.currentSlideIndex] };
    slide.elements = slide.elements.filter((el) => el.id !== id);
    slides[s.currentSlideIndex] = slide;
    return { slides, selectedElementId: null, editingTextId: null };
  }),

  selectElement: (id) => set({ selectedElementId: id, editingTextId: null, editingTableCell: null, tableSelection: null }),
  setEditingText: (id) => set({ editingTextId: id }),
  setSlideBackground: (color) => set((s) => {
    const slides = [...s.slides];
    slides[s.currentSlideIndex] = { ...slides[s.currentSlideIndex], background: color };
    return { slides };
  }),

  moveSlide: (from, to) => set((s) => {
    const slides = [...s.slides];
    const [moved] = slides.splice(from, 1);
    slides.splice(to, 0, moved);
    return { slides, currentSlideIndex: to };
  }),

  newPresentation: () => set({
    slides: [createDefaultSlide()],
    currentSlideIndex: 0,
    selectedElementId: null,
    activeTool: 'select',
    editingTextId: null,
  }),

  getCurrentSlide: () => {
    const s = get();
    return s.slides[s.currentSlideIndex];
  },

  getSelectedElement: () => {
    const s = get();
    const slide = s.slides[s.currentSlideIndex];
    return slide.elements.find((el) => el.id === s.selectedElementId);
  },
}));
