import React, { useRef, useState } from 'react';
import { v4 as uuid } from 'uuid';
import { useEditorStore } from '../store';
import { Tool, Slide, SlideElement } from '../types';

const themes: { name: string; background: string; titleColor: string; accent: string }[] = [
  { name: '空白', background: '#ffffff', titleColor: '#333333', accent: '#4A90D9' },
  { name: '深邃蓝', background: '#1a2a4a', titleColor: '#ffffff', accent: '#5b9bd5' },
  { name: '暗夜黑', background: '#1e1e1e', titleColor: '#e0e0e0', accent: '#bb86fc' },
  { name: '清新绿', background: '#e8f5e9', titleColor: '#2e7d32', accent: '#66bb6a' },
  { name: '暖阳橙', background: '#fff3e0', titleColor: '#e65100', accent: '#ffa726' },
  { name: '优雅紫', background: '#f3e5f5', titleColor: '#6a1b9a', accent: '#ab47bc' },
  { name: '商务灰', background: '#f5f5f5', titleColor: '#424242', accent: '#78909c' },
  { name: '渐变蓝', background: '#e3f2fd', titleColor: '#0d47a1', accent: '#42a5f5' },
];

function createThemedSlide(theme: typeof themes[0]): Slide {
  const elements: SlideElement[] = [];
  if (theme.name !== '空白') {
    elements.push({
      id: uuid(), type: 'text', x: 80, y: 180, width: 800, height: 80,
      rotation: 0, content: '点击输入标题', fontSize: 36, fontFamily: 'Microsoft YaHei',
      color: theme.titleColor, bold: true,
    });
    elements.push({
      id: uuid(), type: 'text', x: 80, y: 280, width: 800, height: 50,
      rotation: 0, content: '点击输入副标题', fontSize: 20, fontFamily: 'Microsoft YaHei',
      color: theme.titleColor,
    });
    elements.push({
      id: uuid(), type: 'rect', x: 80, y: 270, width: 120, height: 4,
      rotation: 0, fill: theme.accent, stroke: theme.accent, strokeWidth: 0,
    });
  }
  return { id: uuid(), elements, background: theme.background };
}


const insertTools: { key: Tool; label: string; svgPath: string }[] = [
  { key: 'text', label: '文本框', svgPath: 'M4 7V4h16v3M9 20h6M12 4v16' },
  { key: 'rect', label: '矩形', svgPath: 'M3 3h18v18H3z' },
  { key: 'ellipse', label: '椭圆', svgPath: 'M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z' },
];

export const EditorToolbar: React.FC = () => {
  const { activeTool, setActiveTool, addElement, deleteElement, selectedElementId, slides, currentSlideIndex, addSlide } = useEditorStore();
  const fileRef = useRef<HTMLInputElement>(null);
  const [showThemes, setShowThemes] = useState(false);
  const slide = slides[currentSlideIndex];
  const selectedEl = slide.elements.find((e) => e.id === selectedElementId);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        addElement({
          id: uuid(), type: 'image', x: 100, y: 100,
          width: Math.min(img.width, 400), height: Math.min(img.height, 300),
          rotation: 0, imageSrc: reader.result as string,
        });
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleThemeSelect = (theme: typeof themes[0]) => {
    addSlide(createThemedSlide(theme));
    setShowThemes(false);
  };

  return (
    <div style={s.bar}>
      <div style={s.group}>
        <div style={{ position: 'relative' }}>
          <ToolBtn
            label="新建PPT"
            active={showThemes}
            onClick={() => setShowThemes(!showThemes)}
            svgPath="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zM14 2v6h6M12 18v-6M9 15h6"
          />
          {showThemes && (
            <div style={s.themePicker} onMouseLeave={() => setShowThemes(false)}>
              <div style={s.themeTitle}>选择主题</div>
              <div style={s.themeGrid}>
                {themes.map((t) => (
                  <button key={t.name} style={s.themeCard} onClick={() => handleThemeSelect(t)}>
                    <div style={{ ...s.themePreview, background: t.background, border: t.background === '#ffffff' ? '1px solid #ddd' : 'none' }}>
                      {t.name !== '空白' && (
                        <>
                          <div style={{ width: 40, height: 3, background: t.accent, borderRadius: 2, marginBottom: 3 }} />
                          <div style={{ width: 50, height: 4, background: t.titleColor, borderRadius: 2, opacity: 0.7 }} />
                          <div style={{ width: 35, height: 3, background: t.titleColor, borderRadius: 2, opacity: 0.4, marginTop: 2 }} />
                        </>
                      )}
                    </div>
                    <span style={s.themeName}>{t.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        <div style={s.sep} />
        {insertTools.map((t) => (
          <ToolBtn
            key={t.key}
            label={t.label}
            active={activeTool === t.key}
            onClick={() => setActiveTool(t.key)}
            svgPath={t.svgPath}
          />
        ))}
        <ToolBtn
          label="图片"
          active={false}
          onClick={() => fileRef.current?.click()}
          svgPath="M21 19V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2zM8.5 13.5l2.5 3 3.5-4.5 4.5 6H5l3.5-4.5z"
        />
      </div>

      <div style={s.group}>
        {selectedEl && (
          <>
            <div style={s.sep} />
            <span style={s.info}>
              {selectedEl.type === 'text' ? '文本' : selectedEl.type === 'rect' ? '矩形' : selectedEl.type === 'ellipse' ? '椭圆' : '图片'}
              {' '}已选中
            </span>
            <ToolBtn
              label="删除"
              active={false}
              onClick={() => deleteElement(selectedElementId!)}
              svgPath="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"
              danger
            />
          </>
        )}
      </div>

      <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} />
    </div>
  );
};


function ToolBtn({ label, active, onClick, svgPath, danger }: {
  label: string; active: boolean; onClick: () => void; svgPath: string; danger?: boolean;
}) {
  return (
    <button
      title={label}
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 5,
        padding: '4px 10px', border: 'none', borderRadius: 4,
        background: active ? '#e8f0fe' : 'transparent',
        color: danger ? '#e53935' : active ? '#1a73e8' : '#444',
        cursor: 'pointer', fontSize: 12, transition: 'all 0.12s',
        height: 30,
      }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d={svgPath} />
      </svg>
      <span>{label}</span>
    </button>
  );
}

const s: Record<string, React.CSSProperties> = {
  bar: {
    height: 40, background: '#fff', borderBottom: '1px solid #e2e2e2',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0 16px', flexShrink: 0, gap: 8,
  },
  group: { display: 'flex', alignItems: 'center', gap: 2 },
  sep: { width: 1, height: 20, background: '#e0e0e0', margin: '0 6px' },
  info: { fontSize: 12, color: '#888', marginRight: 4 },
  themePicker: {
    position: 'absolute', top: '100%', left: 0, marginTop: 4,
    background: '#fff', borderRadius: 8, padding: '12px',
    boxShadow: '0 4px 24px rgba(0,0,0,0.15)', border: '1px solid #e5e5e5',
    zIndex: 1000, width: 320,
  },
  themeTitle: { fontSize: 13, fontWeight: 600, color: '#333', marginBottom: 10 },
  themeGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8,
  },
  themeCard: {
    display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: 4,
    padding: 4, border: '1px solid #eee', borderRadius: 6, background: 'none',
    cursor: 'pointer', transition: 'all 0.15s',
  },
  themePreview: {
    width: 60, height: 38, borderRadius: 4,
    display: 'flex', flexDirection: 'column' as const,
    alignItems: 'center', justifyContent: 'center',
  },
  themeName: { fontSize: 11, color: '#666' },
};
