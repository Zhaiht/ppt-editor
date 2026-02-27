import React, { useState } from 'react';
import { useEditorStore } from '../store';
import { exportToPptx } from '../utils/exportPptx';

export const HeaderBar: React.FC = () => {
  const { slides, fileName, setFileName } = useEditorStore();
  const [exporting, setExporting] = useState(false);
  const [editing, setEditing] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportToPptx(slides, fileName);
    } catch {
      alert('导出失败，请重试');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div style={s.header}>
      <div style={s.left}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#d4a0ff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="3" width="20" height="14" rx="2" />
          <path d="M8 21h8M12 17v4" />
        </svg>
        {editing ? (
          <input
            autoFocus
            style={s.nameInput}
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            onBlur={() => { if (!fileName.trim()) setFileName('演示文档'); setEditing(false); }}
            onKeyDown={(e) => { if (e.key === 'Enter') { if (!fileName.trim()) setFileName('演示文档'); setEditing(false); } }}
          />
        ) : (
          <span style={s.nameText} onDoubleClick={() => setEditing(true)}>{fileName}</span>
        )}
      </div>
      <div style={s.right}>
        <button style={s.headerBtn} onClick={handleExport} disabled={exporting} title="导出 PPTX">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
          </svg>
          <span>{exporting ? '导出中' : '导出'}</span>
        </button>
      </div>
    </div>
  );
};


const s: Record<string, React.CSSProperties> = {
  header: {
    height: 40,
    background: '#2b2b2b',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 12px',
    flexShrink: 0,
    zIndex: 100,
    userSelect: 'none',
  },
  left: { display: 'flex', alignItems: 'center', gap: 8 },
  right: { display: 'flex', alignItems: 'center', gap: 8 },
  nameText: {
    color: '#e0e0e0',
    fontSize: 14,
    fontWeight: 600,
    letterSpacing: 0.5,
    cursor: 'default',
  },
  nameInput: {
    background: 'rgba(255,255,255,0.1)',
    border: '1px solid rgba(255,255,255,0.3)',
    borderRadius: 4,
    color: '#e0e0e0',
    fontSize: 14,
    fontWeight: 600,
    padding: '2px 8px',
    outline: 'none',
    width: 200,
  },
  headerBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '5px 14px',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: 4,
    background: 'rgba(255,255,255,0.08)',
    color: '#ddd',
    fontSize: 12,
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
};
