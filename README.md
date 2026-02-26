# PPT 编辑器

基于 React + Canvas + Zustand 的网页版 PPT 编辑器。

## 功能

- **幻灯片管理** — 新增、复制、删除、切换幻灯片
- **元素类型** — 文本、矩形、椭圆、图片
- **拖拽与缩放** — 选中元素可拖动，八个控制点缩放
- **文本编辑** — 双击进入编辑，支持加粗、斜体、字号、颜色
- **形状样式** — 填充色、边框色、边框宽度
- **属性面板** — 精确数值调整位置与大小
- **背景设置** — 自定义幻灯片背景色
- **快捷键** — `Delete` 删除元素，`Escape` 取消选择

## 技术栈

| 工具 | 用途 |
|------|------|
| React 18 | UI 框架 |
| Canvas API | 幻灯片渲染 |
| Zustand | 状态管理 |
| TypeScript | 类型安全 |
| Vite | 构建工具 |

## 快速开始

```bash
cd ppt-editor
npm install
npm run dev
```

浏览器打开 `http://localhost:5173` 即可使用。

## 项目结构

```
src/
├── index.tsx              # 入口
├── App.tsx                # 布局
├── types.ts               # 类型定义
├── store.ts               # Zustand 状态管理
├── components/
│   ├── Toolbar.tsx        # 顶部工具栏
│   ├── SlidePanel.tsx     # 左侧幻灯片列表
│   ├── Canvas.tsx         # 中央画布
│   └── PropertyPanel.tsx  # 右侧属性面板
└── utils/
    ├── draw.ts            # Canvas 绘制逻辑
    └── hitTest.ts         # 元素点击检测
```
