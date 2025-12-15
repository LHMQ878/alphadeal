import { ModuleId, ModuleConfig } from './types';

export const MODULES: ModuleConfig[] = [
  {
    id: ModuleId.Discovery,
    name: "发现与洞察系统",
    description: "全网扫描潜在标的，深度剖析行业赛道，捕捉投资先机。",
    icon: "Radar",
    color: "text-emerald-400",
    tools: [
      {
        id: "industry_hunter",
        name: "产业猎手",
        description: "全网扫描潜在标的，分析产业链上下游。",
        icon: "Radar",
        keywords: ["潜在标的", "产业链图谱", "黑马公司", "上下游关系", "寻找", "扫描", "发现", "搜寻"]
      },
      {
        id: "industry_research",
        name: "行业研究",
        description: "深度剖析细分赛道，输出市场规模与竞争格局。",
        icon: "PieChart",
        keywords: ["市场规模", "竞争格局", "细分赛道", "行业壁垒", "TAM/SAM", "研究", "分析", "趋势"]
      }
    ]
  },
  {
    id: ModuleId.Analysis,
    name: "分析与估值系统",
    description: "企业尽调、财务审计与估值建模的中台核心引擎。",
    icon: "BarChart3",
    color: "text-blue-400",
    tools: [
      {
        id: "due_diligence",
        name: "智能尽调",
        description: "企业背景深挖、股权穿透及经营风险扫描。",
        icon: "Search",
        keywords: ["股权结构", "实控人", "历史沿革", "经营风险", "法律诉讼", "尽调", "背景调查", "穿透"]
      },
      {
        id: "financial_audit",
        name: "财务审计",
        description: "财务健康度雷达诊断及异常趋势预警。",
        icon: "Activity",
        keywords: ["财务报表", "盈利能力", "偿债能力", "现金流", "财务造假", "审计", "诊断", "健康度"]
      },
      {
        id: "valuation_comps",
        name: "对标估值",
        description: "自动筛选可比公司，生成估值倍数矩阵。",
        icon: "BarChart3",
        keywords: ["可比公司", "估值矩阵", "PE倍数", "EV/EBITDA", "市值", "对标", "估值", "计算"]
      },
      {
        id: "valuation_model",
        name: "估值建模",
        description: "辅助搭建DCF模型及财务预测推演。",
        icon: "Calculator",
        keywords: ["DCF模型", "WACC", "自由现金流", "财务预测", "敏感性分析", "建模", "折现", "推演"]
      }
    ]
  },
  {
    id: ModuleId.Execution,
    name: "执行与合规系统",
    description: "风险监控、材料预审与文书自动化的交付闭环。",
    icon: "ShieldAlert",
    color: "text-purple-400",
    tools: [
      {
        id: "risk_control",
        name: "合规风控",
        description: "实时监控法律诉讼及监管处罚动态。",
        icon: "ShieldAlert",
        keywords: ["监管处罚", "行政处罚", "合规风险", "舆情监控", "黑名单", "监控", "预警", "扫描"]
      },
      {
        id: "compliance_check",
        name: "合规预审",
        description: "IPO上市规则材料预审与反馈模拟。",
        icon: "FileCheck",
        keywords: ["上市规则", "IPO审核", "反馈意见", "合规性", "问询函", "预审", "检查", "复核"]
      },
      {
        id: "doc_generation",
        name: "文书生成",
        description: "自动起草IC Memo、BP及尽调报告。",
        icon: "FileText",
        keywords: ["IC Memo", "投资建议书", "尽调报告", "商业计划书", "BP", "生成", "撰写", "起草"]
      },
      {
        id: "project_mgmt",
        name: "项目管理",
        description: "全生命周期任务协同与进度追踪。",
        icon: "Briefcase",
        keywords: ["项目进度", "时间表", "任务清单", "工作流", "管理", "追踪", "协同"]
      }
    ]
  }
];

export const SYSTEM_PROMPT_TEMPLATE = `
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