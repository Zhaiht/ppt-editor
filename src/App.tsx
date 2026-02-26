import React, { useState } from 'react';
import { HeaderBar } from './components/HeaderBar';
import { EditorToolbar } from './components/EditorToolbar';
import { SlidePanel } from './components/SlidePanel';
import { Canvas } from './components/Canvas';
import { PropertyPanel } from './components/PropertyPanel';

const App: React.FC = () => {
  const [rightTab, setRightTab] = useState<'style' | 'design' | 'animate'>('style');

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#f1f1f1' }}>
      <HeaderBar />
      <EditorToolbar />
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <SlidePanel />
        <Canvas />
        <PropertyPanel activeTab={rightTab} onTabChange={setRightTab} />
      </div>
    </div>
  );
};

export default App;
