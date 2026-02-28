# PPT 编辑器

基于 React + Canvas + Zustand 的网页版 PPT 编辑器。

## 功能

- **幻灯片管理** — 新增、复制、删除、切换幻灯片
- **主题模板** — 新建幻灯片时可选择 8 种预设主题（深邃蓝、暗夜黑、清新绿等）
- **文档命名** — 顶部栏显示文档名称，双击可编辑，导出时使用自定义名称
- **元素类型** — 文本、矩形、椭圆、图片、表格
- **表格功能** — 网格矩阵选择行列数，支持自定义行列，单元格可编辑内容，支持 Tab/Enter 跳转，可选中整行或整列
- **拖拽与缩放** — 选中元素可拖动，八个控制点缩放
- **文本编辑** — 双击进入编辑，支持加粗、斜体、字号、颜色
- **形状样式** — 填充色、边框色、边框宽度
- **属性面板** — 精确数值调整位置与大小
- **背景设置** — 自定义幻灯片背景色
- **导出 PPTX** — 一键导出为 PowerPoint 文件
- **快捷键** — `Delete` 删除元素，`Escape` 取消选择

## 技术栈

| 工具 | 用途 |
|------|------|
| React 18 | UI 框架 |
| Canvas API | 幻灯片渲染 |
| Zustand | 状态管理 |
| pptxgenjs | PPTX 导出 |
| TypeScript | 类型安全 |
| Vite | 构建工具 |

## 快速开始

```bash
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
│   ├── HeaderBar.tsx      # 顶部标题栏（文档名称、导出）
│   ├── EditorToolbar.tsx  # 工具栏（新建、插入元素、表格）
│   ├── SlidePanel.tsx     # 左侧幻灯片列表
│   ├── Canvas.tsx         # 中央画布
│   └── PropertyPanel.tsx  # 右侧属性面板
└── utils/
    ├── draw.ts            # Canvas 绘制逻辑
    ├── hitTest.ts         # 元素点击检测
    └── exportPptx.ts      # PPTX 导出
```
