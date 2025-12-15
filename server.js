import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from "@google/genai";

// Load environment variables from .env
dotenv.config();

const app = express();
const PORT = 3001; // Backend runs on 3001

app.use(cors()); // Allow Cross-Origin requests from Frontend
app.use(express.json());

// --- Shared Constants (Copied here to avoid TS compilation issues in raw Node.js) ---
const SYSTEM_PROMPT_TEMPLATE = `
**系统身份与人设**
你是“AlphaDeal”智能投行系统的核心AI引擎，一位拥有20年顶级投行（如高盛、摩根士丹利）经验的**资深合伙人(Managing Director)**。
你的沟通风格：**直接、犀利、结构化、专业**。拒绝一切AI味的客套话。

**核心指令：自动意图识别与隐形调用 (Invisible Execution)**
你拥有多种后台能力引擎（如行业研究、标的挖掘、财务估值等），但**严禁**向用户展示这些工具的名称。
用户不需要知道“系统”的存在，他们只需要结果。

**规则一：严禁功能选择 (No Feature Selection)**
- **禁止**询问：“您想使用哪个功能？”、“请选择行业研究还是产业猎手”。
- **禁止**出现：“正在为您调用xx工具”、“已启动xx引擎”。
- **禁止**列出工具菜单。
- **直接执行**：根据用户输入，自动在后台调用最适合的逻辑。

**规则二：自动判断任务类型 (Auto-Detection)**
根据用户的自然语言输入，自动匹配逻辑：
1. **行业/赛道洞察**：若用户问“分析低空经济”，自动执行【行业研究】（分析规模、格局、驱动力）。
2. **标的挖掘/寻找**：若用户问“找几家做人形机器人的公司”，自动执行【产业猎手】（列出名单、亮点）。
3. **个股/公司分析**：若用户问“分析特斯拉”，自动执行【智能尽调】+【财务审计】（背景、风险、财务）。
4. **估值/价格**：若用户问“它值多少钱”，自动执行【对标估值】+【DCF建模】逻辑。
5. **文档生成**：若用户问“写份报告”，自动执行【文书生成】。

**规则三：模糊指令的专业澄清 (Professional Clarification)**
如果用户输入太模糊（例如仅输入“半导体”），**不要**列出功能列表。
**必须**以投行专家的角度，主动确认业务关注点：
- ❌ 错误：“您想使用行业研究功能还是寻找标的功能？”
- ✅ 正确：“收到。关于半导体领域，为了提供VP级质量的分析，我需要确认一下：您目前更关注**卡脖子环节的国产化率（行业分析）**，还是正在寻找**具体的设备端投资标的（标的挖掘）**？”

**输出风格规范 (Professional IB Output)**
1. **结论先行 (Bottom Line Up Front)**：第一句话必须直接给出核心判断。
2. **框架化分析**：使用 Markdown 的 H2/H3 标题，结构清晰（现状 -> 逻辑 -> 结论）。
3. **真实性协议**：
   - 必须基于真实数据，**严禁编造**。如果数据不可得，请说明并给出估算逻辑。
   - 关键数据（如CAGR、PE倍数、营收）必须**加粗**。
4. **下一步建议 (Actionable Next Steps)**：结尾必须给出 2-3 条具体的执行建议（如“建议重点核查X公司的存货周转率”）。

**纯文本输出协议**
本系统暂不生成图表。请通过高密度、结构化的文本和数据列表来呈现分析结果。
`;

// Helper: Normalize history to ensure strict User <-> Model alternation for Gemini
const normalizeGeminiContent = (history, currentMessage) => {
  const contents = [];
  const rawMessages = history.map((m) => ({
    role: m.sender === 'user' ? 'user' : 'model',
    text: m.text ? m.text.trim() : " "
  }));

  rawMessages.push({ role: 'user', text: currentMessage.trim() });

  if (rawMessages.length > 0) {
    let currentRole = rawMessages[0].role;
    let combinedText = rawMessages[0].text;

    for (let i = 1; i < rawMessages.length; i++) {
      const msg = rawMessages[i];
      if (msg.role === currentRole) {
        combinedText += `\n\n${msg.text}`;
      } else {
        contents.push({ role: currentRole, parts: [{ text: combinedText }] });
        currentRole = msg.role;
        combinedText = msg.text;
      }
    }
    contents.push({ role: currentRole, parts: [{ text: combinedText }] });
  }
  return contents;
};

// --- API Route ---
app.post('/api/chat', async (req, res) => {
  try {
    const { 
      history, 
      currentMessage, 
      contextModule, 
      globalContext, 
      toolsContext, 
      modelProvider 
    } = req.body;

    const systemInstruction = `${SYSTEM_PROMPT_TEMPLATE}

**当前系统环境 (Current Context)**
- 运行模块: ${contextModule}
- 可用工具:
${toolsContext || "（通用模式）"}

**全局记忆 (Global Memory)**
${globalContext || "（暂无跨模块历史）"}

**执行指令**:
1. 扮演该模块的资深专家。
2. 自动判断是否需要调用工具逻辑。
3. 若需输出图表，必须使用 json:chart 格式。
`;

    let rawText = "";

    // --- DEEPSEEK ---
    if (modelProvider === 'deepseek') {
      const apiKey = process.env.DEEPSEEK_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ text: "**Config Error**: Server missing DEEPSEEK_API_KEY." });
      }

      const apiMessages = history.slice(-10).map((m) => ({
        role: m.sender === 'user' ? "user" : "assistant",
        content: m.text
      }));
      apiMessages.push({ role: "user", content: currentMessage });

      const dsResponse = await fetch("https://api.deepseek.com/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [
            { role: "system", content: systemInstruction },
            ...apiMessages
          ],
          temperature: 1.3,
          stream: false
        })
      });

      if (!dsResponse.ok) {
        const err = await dsResponse.text();
        throw new Error(`DeepSeek API Error: ${dsResponse.statusText} ${err}`);
      }
      const data = await dsResponse.json();
      rawText = data.choices?.[0]?.message?.content || "";
    } 
    
    // --- GEMINI ---
    else {
      const apiKey = process.env.API_KEY;
      if (!apiKey) {
        return res.status(500).json({ text: "**Config Error**: Server missing API_KEY (Gemini)." });
      }

      const ai = new GoogleGenAI({ apiKey });
      const contents = normalizeGeminiContent(history.slice(-10), currentMessage);

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: contents,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.7,
          safetySettings: [
            { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
            { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
            { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
            { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE }
          ]
        }
      });

      rawText = response.text || "";
    }

    // --- Chart Extraction ---
    let cleanText = rawText;
    let chartData = null;
    const jsonBlockRegex = /```json:chart\s*([\s\S]*?)\s*```/;
    const match = rawText.match(jsonBlockRegex);

    if (match && match[1]) {
      try {
        chartData = JSON.parse(match[1]);
        cleanText = rawText.replace(jsonBlockRegex, '');
      } catch (e) {
        console.error("JSON Parse Error", e);
      }
    }

    res.json({ text: cleanText, chartData });

  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ text: `**Server Error**: ${error.message}` });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Backend server running on http://localhost:${PORT}`);
});
