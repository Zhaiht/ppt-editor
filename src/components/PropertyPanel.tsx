import React from 'react';
import { useEditorStore } from '../store';

interface Props {
  activeTab: 'style' | 'design' | 'animate';
  onTabChange: (tab: 'style' | 'design' | 'animate') => void;
}

const tabs: { key: Props['activeTab']; label: string }[] = [
  { key: 'style', label: '元素样式' },
  { key: 'design', label: '幻灯片设计' },
  { key: 'animate', label: '动画' },
];

export const PropertyPanel: React.FC<Props> = ({ activeTab, onTabChange }) => {
  const { slides, currentSlideIndex, selectedElementId, updateElement, setSlideBackground } = useEditorStore();
  const slide = slides[currentSlideIndex];
  const el = slide.elements.find((e) => e.id === selectedElementId);

  return (
    <div style={s.panel}>
      <div style={s.tabs}>
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => onTabChange(t.key)}
            style={{
              ...s.tab,
              color: activeTab === t.key ? '#4a86e8' : '#888',
              borderBottom: activeTab === t.key ? '2px solid #4a86e8' : '2px solid transparent',
            }}
          >{t.label}</button>
        ))}
      </div>
      <div style={s.body}>
        {activeTab === 'style' && <StyleTab el={el} updateElement={updateElement} />}
        {activeTab === 'design' && <DesignTab background={slide.background} setBackground={setSlideBackground} />}
        {activeTab === 'animate' && <AnimateTab />}
      </div>
    </div>
  );
};

function StyleTab({ el, updateElement }: { el: any; updateElement: any }) {
  if (!el) return <div style={s.empty}>
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5"><path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z"/></svg>
    <span style={{ color: '#aaa', fontSize: 12, marginTop: 8 }}>选择元素以编辑样式</span>
  </div>;

  return (
    <div>
      <Section title="位置与大小">
        <div style={s.grid2}>
          <LabelInput label="X" value={el.x} onChange={(v: number) => updateElement(el.id, { x: v })} />
          <LabelInput label="Y" value={el.y} onChange={(v: number) => updateElement(el.id, { y: v })} />
          <LabelInput label="W" value={el.width} onChange={(v: number) => updateElement(el.id, { width: Math.max(10, v) })} />
          <LabelInput label="H" value={el.height} onChange={(v: number) => updateElement(el.id, { height: Math.max(10, v) })} />
        </div>
      </Section>

      {el.type === 'text' && (
        <Section title="文本">
          <Row label="字号">
            <input type="number" value={el.fontSize || 24} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateElement(el.id, { fontSize: Number(e.target.value) })} style={s.input} />
          </Row>
          <Row label="颜色">
            <input type="color" value={el.color || '#333333'} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateElement(el.id, { color: e.target.value })} style={s.colorPick} />
          </Row>
          <Row label="样式">
            <div style={{ display: 'flex', gap: 4 }}>
              <ToggleBtn label="B" active={!!el.bold} onClick={() => updateElement(el.id, { bold: !el.bold })} bold />
              <ToggleBtn label="I" active={!!el.italic} onClick={() => updateElement(el.id, { italic: !el.italic })} italic />
            </div>
          </Row>
        </Section>
      )}

      {(el.type === 'rect' || el.type === 'ellipse') && (
        <Section title="形状">
          <Row label="填充">
            <input type="color" value={el.fill || '#4A90D9'} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateElement(el.id, { fill: e.target.value })} style={s.colorPick} />
          </Row>
          <Row label="边框色">
            <input type="color" value={el.stroke || '#333'} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateElement(el.id, { stroke: e.target.value })} style={s.colorPick} />
          </Row>
          <Row label="边框宽">
            <input type="number" value={el.strokeWidth || 2} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateElement(el.id, { strokeWidth: Number(e.target.value) })} style={s.input} />
          </Row>
        </Section>
      )}
    </div>
  );
}

const presetColors = ['#ffffff', '#000000', '#e53935', '#fb8c00', '#fdd835', '#43a047', '#1e88e5', '#8e24aa', '#546e7a', '#d4a373'];

function DesignTab({ background, setBackground }: { background: string; setBackground: (c: string) => void }) {
  return (
    <div>
      <Section title="背景">
        <Row label="颜色">
          <input type="color" value={background} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBackground(e.target.value)} style={s.colorPick} />
        </Row>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
          {presetColors.map((c) => (
            <div
              key={c}
              onClick={() => setBackground(c)}
              style={{
                width: 24, height: 24, borderRadius: 4, background: c, cursor: 'pointer',
                border: background === c ? '2px solid #4a86e8' : '1px solid #ddd',
              }}
            />
          ))}
        </div>
      </Section>
    </div>
  );
}

function AnimateTab() {
  return (
    <div style={s.empty}>
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5"><path d="M5 3l14 9-14 9V3z"/></svg>
      <span style={{ color: '#aaa', fontSize: 12, marginTop: 8 }}>动画功能开发中</span>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 10, paddingBottom: 6, borderBottom: '1px solid #f0f0f0' }}>{title}</div>
      {children}
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
      <span style={{ fontSize: 12, color: '#777' }}>{label}</span>
      {children}
    </div>
  );
}

function LabelInput({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <span style={{ fontSize: 11, color: '#999', width: 14 }}>{label}</span>
      <input type="number" value={Math.round(value)} onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(Number(e.target.value))} style={{ ...s.input, flex: 1 }} />
    </div>
  );
}

function ToggleBtn({ label, active, onClick, bold, italic }: { label: string; active: boolean; onClick: () => void; bold?: boolean; italic?: boolean }) {
  return (
    <button onClick={onClick} style={{
      width: 30, height: 28, border: '1px solid #ddd', borderRadius: 4,
      background: active ? '#e8f0fe' : '#fafafa', color: active ? '#4a86e8' : '#666',
      cursor: 'pointer', fontSize: 13, fontWeight: bold ? 700 : 400, fontStyle: italic ? 'italic' : 'normal',
    }}>{label}</button>
  );
}

const s: Record<string, React.CSSProperties> = {
  panel: {
    width: 260,
    background: '#fff',
    borderLeft: '1px solid #e2e2e2',
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
    overflow: 'hidden',
  },
  tabs: {
    display: 'flex',
    borderBottom: '1px solid #e8e8e8',
    flexShrink: 0,
  },
  tab: {
    flex: 1,
    padding: '10px 0',
    border: 'none',
    background: 'none',
    fontSize: 12,
    cursor: 'pointer',
    transition: 'all 0.15s',
    fontWeight: 500,
  },
  body: {
    flex: 1,
    overflowY: 'auto',
    padding: 16,
  },
  empty: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  grid2: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 8,
  },
  input: {
    width: 64,
    padding: '5px 8px',
    border: '1px solid #e0e0e0',
    borderRadius: 4,
    fontSize: 12,
    textAlign: 'right' as const,
    outline: 'none',
    transition: 'border-color 0.15s',
  },
  colorPick: {
    width: 32,
    height: 26,
    border: '1px solid #e0e0e0',
    borderRadius: 4,
    cursor: 'pointer',
    padding: 1,
  },
};
