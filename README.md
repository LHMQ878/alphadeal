# AlphaDeal - 智能投行助手 (Intelligent Investment Banking System)

AlphaDeal 是一个高度专业化的 AI 投行工作台，旨在通过大语言模型（LLM）模拟“顶级投行 VP”的工作流。本项目采用**前后端分离架构**，通过独立后端服务保护 API Key，确保系统的安全性与稳定性。

## 核心特性 (Key Features)

- **🧠 双引擎驱动 (Dual-Core AI)**
  - **Gemini 2.5 Flash**: 谷歌最新模型，处理速度快，适合实时交互。
  - **DeepSeek V3**: 国产最强推理模型，擅长深度逻辑思考与复杂文本生成。
  - 支持一键无缝切换模型。

- **🔒 企业级安全架构 (Secure Architecture)**
  - 采用 **Node.js (Express)** 独立后端服务中转 API 请求。
  - API Key 仅在服务端内存中存储与调用，彻底杜绝前端泄漏风险。

- **⚡ 全域智能路由 (Intelligent Routing)**
  - 这是一个“无菜单”系统。用户只需输入业务需求（如“找新能源标的”或“分析特斯拉”），系统会自动识别意图，并跳转至对应的专业模块（发现/分析/执行）。

- **🕵️ 隐形工具协议 (Invisible Tool Execution)**
  - 系统内置 10+ 种专业投行工具（如产业猎手、股权穿透、DCF建模等）。
  - AI 会根据对话上下文自动在后台组合调用这些工具，而无需用户手动选择。
  - 输出风格严格遵循投行标准：结论先行 (BLUF)、数据支撑、风险提示。

## 技术栈 (Tech Stack)

- **Frontend**: React 19, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express
- **AI Integration**: Google GenAI SDK, DeepSeek REST API
- **Visualization**: Recharts

## 本地开发指南 (Local Development)

### 1. 克隆项目
```bash
git clone https://github.com/your-repo/alphadeal.git
cd alphadeal
```

### 2. 安装依赖
本项目包含前端与后端依赖，请确保全部安装：
```bash
npm install
# 安装后端核心依赖 (如果 package.json 未自动包含)
npm install express cors dotenv @google/genai
```

### 3. 配置环境变量
在项目根目录创建一个 `.env` 文件，该文件仅由后端服务读取：

```env
# Google Gemini API Key (必须)
# 获取地址: https://aistudio.google.com/
API_KEY=your_gemini_api_key_here

# DeepSeek API Key (可选，用于开启深度思考模式)
# 获取地址: https://platform.deepseek.com/
DEEPSEEK_API_KEY=your_deepseek_api_key_here
```

### 4. 启动服务 (需开启两个终端)

由于采用了前后端分离架构，您需要同时启动后端 API 服务和前端 React 应用。

**终端 1: 启动后端 API 服务**
```bash
node server.js
# 服务将运行在 http://localhost:3001
# 如果看到 "Backend server running on http://localhost:3001" 即表示成功
```

**终端 2: 启动前端页面**
```bash
npm run dev
# 页面将运行在 http://localhost:5173 (或类似端口)
```

## 部署架构说明

本项目逻辑分为两部分：
1. **Frontend (`services/geminiService.ts`)**: 负责 UI 渲染与用户交互，将请求发送至 `http://localhost:3001/api/chat`。
2. **Backend (`server.js`)**: 负责持有 API Key，处理 Prompt 拼接、上下文清洗与 AI 接口调用。

**注意**: 若部署到公网，请确保后端服务（`server.js`）正常运行，并根据实际服务器域名修改前端的 API 请求地址。

---
© 2025 AlphaDeal System. Designed for Professional Investors.
