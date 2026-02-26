import React, { useState, useRef } from 'react';
import { useEditorStore } from '../store';
import { exportToPptx } from '../utils/exportPptx';

export const HeaderBar: React.FC = () => {
  const { slides, addSlide } = useEditorStore();
  const [exporting, setExporting] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const menuTimeout = useRef<ReturnType<typeof setTimeout>>();

  const handleExport = async () => {
    setExporting(true);
    setOpenMenu(null);
    try {
      await exportToPptx(slides);
    } catch {
      alert('导出失败，请重试');
    } finally {
      setExporting(false);
    }
  };

  const handleMenuEnter = (menu: string) => {
    clearTimeout(menuTimeout.current);
    setOpenMenu(menu);
  };

  const handleMenuLeave = () => {
    menuTimeout.current = setTimeout(() => setOpenMenu(null), 150);
  };

  const menus: { key: string; label: string; items: { label: string; onClick: () => void; disabled?: boolean }[] }[] = [
    {
      key: 'file', label: '文件', items: [
        { label: '新建幻灯片', onClick: () => { addSlide(); setOpenMenu(null); } },
        { label: exporting ? '导出中...' : '导出 PPTX', onClick: handleExport, disabled: exporting },
      ],
    },
    {
      key: 'edit', label: '编辑', items: [
        { label: '撤销 (Ctrl+Z)', onClick: () => {}, disabled: true },
        { label: '重做 (Ctrl+Y)', onClick: () => {}, disabled: true },
      ],
    },
    {
      key: 'view', label: '视图', items: [
        { label: '适应窗口', onClick: () => {}, disabled: true },
      ],
    },
  ];

  return (
    <div style={s.header}>
      <div style={s.left}>
        <div style={s.logo}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#d4a0ff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="3" width="20" height="14" rx="2" />
            <path d="M8 21h8M12 17v4" />
          </svg>
          <span style={s.logoText}>PPT 编辑器</span>
        </div>
        <div style={s.menuBar}>
          {menus.map((menu) => (
            <div
              key={menu.key}
              style={s.menuItem}
              onMouseEnter={() => handleMenuEnter(menu.key)}
              onMouseLeave={handleMenuLeave}
            >
              <span style={{
                ...s.menuLabel,
                background: openMenu === menu.key ? 'rgba(255,255,255,0.1)' : 'transparent',
              }}>{menu.label}</span>
              {openMenu === menu.key && (
                <div style={s.dropdown}>
                  {menu.items.map((item, i) => (
                    <button
                      key={i}
                      style={{ ...s.dropdownItem, opacity: item.disabled ? 0.4 : 1 }}
                      onClick={item.onClick}
                      disabled={item.disabled}
                    >{item.label}</button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
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
  left: { display: 'flex', alignItems: 'center', gap: 4 },
  right: { display: 'flex', alignItems: 'center', gap: 8 },
  logo: { display: 'flex', alignItems: 'center', gap: 8, marginRight: 12 },
  logoText: { color: '#e0e0e0', fontSize: 14, fontWeight: 600, letterSpacing: 0.5 },
  menuBar: { display: 'flex', alignItems: 'center', gap: 0 },
  menuItem: { position: 'relative' as const },
  menuLabel: {
    color: '#ccc',
    fontSize: 13,
    padding: '4px 12px',
    borderRadius: 4,
    cursor: 'pointer',
    transition: 'background 0.15s',
  },
  dropdown: {
    position: 'absolute' as const,
    top: '100%',
    left: 0,
    marginTop: 4,
    background: '#fff',
    borderRadius: 6,
    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
    border: '1px solid #e5e5e5',
    padding: '4px 0',
    minWidth: 180,
    zIndex: 1000,
  },
  dropdownItem: {
    display: 'block',
    width: '100%',
    padding: '8px 16px',
    border: 'none',
    background: 'none',
    textAlign: 'left' as const,
    fontSize: 13,
    color: '#333',
    cursor: 'pointer',
    transition: 'background 0.1s',
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
