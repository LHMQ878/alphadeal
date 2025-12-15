import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import ChatMessage from './components/ChatMessage';
import { ModuleId, Message, Sender, ModelProvider } from './types';
import { MODULES } from './constants';
import { sendMessageToAI } from './services/geminiService';
import { Send, Activity, Globe, ArrowRight, Sparkles, Zap, BrainCircuit } from 'lucide-react';
import * as Icons from 'lucide-react';

const App: React.FC = () => {
  const [currentModuleId, setCurrentModuleId] = useState<ModuleId>(ModuleId.Dashboard);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentModel, setCurrentModel] = useState<ModelProvider>('gemini');
  
  // Ref for auto-scrolling
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentModuleConfig = MODULES.find(m => m.id === currentModuleId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Simple Keyword-based Routing Logic
  const determineTargetModule = (text: string): ModuleId => {
    let maxScore = 0;
    let targetId = ModuleId.Discovery; // Default fallback

    MODULES.forEach(module => {
      let score = 0;
      module.tools.forEach(tool => {
        tool.keywords.forEach(keyword => {
          if (text.toLowerCase().includes(keyword.toLowerCase())) {
            score += 10; // High weight for exact tool keyword match
          }
        });
      });
      // Also match module name/desc words lightly if needed, but tool keywords are strong.
      
      if (score > maxScore) {
        maxScore = score;
        targetId = module.id;
      }
    });

    return targetId;
  };

  const handleSendMessage = async () => {
    const text = inputText.trim();
    if (!text) return;

    let targetModuleId = currentModuleId;
    let routingMsg: Message | null = null;
    let isRouting = false;

    // 1. Intelligent Routing from Dashboard
    if (currentModuleId === ModuleId.Dashboard) {
      const routedId = determineTargetModule(text);
      targetModuleId = routedId;
      setCurrentModuleId(routedId);
      isRouting = true;

      const targetName = MODULES.find(m => m.id === routedId)?.name;
      routingMsg = {
        id: (Date.now() + 1).toString(),
        text: `**⚡ 智能路由激活：** 已识别您的意图，自动跳转至【${targetName}】为您服务。`,
        sender: Sender.System,
        timestamp: Date.now(),
        moduleId: routedId
      };
    }

    // 2. Add User Message
    const userMsg: Message = {
      id: Date.now().toString(),
      text: text,
      sender: Sender.User,
      timestamp: Date.now(),
      moduleId: targetModuleId
    };

    setMessages(prev => {
      const newMsgs = [...prev, userMsg];
      if (routingMsg) newMsgs.push(routingMsg);
      return newMsgs;
    });
    
    setInputText('');
    setIsLoading(true);

    // 3. Prepare Context for AI
    // Get history for the TARGET module (including the new user message we just added logicallly)
    const currentModuleMessages = messages.filter(m => m.moduleId === targetModuleId);
    const historyForAi = [...currentModuleMessages, userMsg];
    if (routingMsg) historyForAi.push(routingMsg);

    const globalHistory = messages
      .filter(m => m.moduleId !== targetModuleId) // Exclude current module history to avoid dupes in prompt
      .slice(-10);

    const globalContext = globalHistory.map(m => {
        const modName = MODULES.find(mod => mod.id === m.moduleId)?.name || "未知系统";
        const role = m.sender === Sender.User ? "用户" : "系统";
        const content = m.text.length > 150 ? m.text.substring(0, 150) + "..." : m.text; 
        return `[系统:${modName}] ${role}: ${content}`;
    }).join('\n');

    const targetConfig = MODULES.find(m => m.id === targetModuleId);
    const toolsContext = targetConfig?.tools.map(t => `- ${t.name}: ${t.description}`).join('\n') || "";

    // 4. Call API (Switchable)
    const response = await sendMessageToAI(
      historyForAi,
      text,
      targetConfig?.name || "通用助手",
      globalContext,
      toolsContext,
      currentModel
    );

    const systemMsg: Message = {
      id: (Date.now() + 2).toString(),
      text: response.text,
      sender: Sender.System,
      timestamp: Date.now(),
      moduleId: targetModuleId,
      chartData: response.chartData
    };

    setMessages(prev => [...prev, systemMsg]);
    setIsLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Model Selector Component
  const ModelSelector = () => (
    <div className="flex bg-ib-900 rounded-lg p-1 border border-ib-700">
      <button
        onClick={() => setCurrentModel('gemini')}
        className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
          currentModel === 'gemini' 
            ? 'bg-ib-800 text-white shadow-sm border border-ib-600' 
            : 'text-gray-500 hover:text-gray-300'
        }`}
      >
        <Zap size={12} className={currentModel === 'gemini' ? 'text-blue-400' : ''} />
        <span>Gemini 2.5</span>
      </button>
      <button
        onClick={() => setCurrentModel('deepseek')}
        className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
          currentModel === 'deepseek' 
            ? 'bg-ib-800 text-white shadow-sm border border-ib-600' 
            : 'text-gray-500 hover:text-gray-300'
        }`}
      >
        <BrainCircuit size={12} className={currentModel === 'deepseek' ? 'text-purple-400' : ''} />
        <span>DeepSeek V3</span>
      </button>
    </div>
  );

  // Dashboard View Component
  const DashboardView = () => {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-10 pb-32">
        <div className="flex justify-end mb-4">
           <ModelSelector />
        </div>
        <header className="text-center mb-12 animate-fade-in-down">
          <h2 className="text-4xl font-bold text-white mb-4">AlphaDeal <span className="text-ib-accent">Terminal</span></h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            全域智能路由已就绪。无需选择模块，请直接输入您的业务需求。
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {MODULES.map(module => {
            const IconComponent = (Icons as any)[module.icon] || Icons.HelpCircle;
            return (
              <div 
                key={module.id}
                onClick={() => setCurrentModuleId(module.id)}
                className="bg-ib-800 border border-ib-700 p-8 rounded-xl hover:bg-ib-700 hover:border-ib-accent cursor-pointer transition-all duration-200 group relative overflow-hidden flex flex-col h-full transform hover:-translate-y-1"
              >
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <IconComponent size={120} />
                </div>
                
                <div className={`mb-6 ${module.color} flex items-center`}>
                  <div className="p-3 bg-ib-900 rounded-lg border border-ib-700 group-hover:border-current transition-colors">
                    <IconComponent size={32} />
                  </div>
                </div>

                <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-ib-accent transition-colors">
                  {module.name}
                </h3>
                <p className="text-gray-400 mb-6 leading-relaxed">
                  {module.description}
                </p>

                <div className="mt-auto space-y-3">
                  <p className="text-xs font-mono text-gray-500 uppercase tracking-wider">包含能力 (Capabilities):</p>
                  <div className="flex flex-wrap gap-2">
                    {module.tools.slice(0, 4).map(t => (
                      <span key={t.id} className="text-xs bg-ib-900 text-gray-400 px-2 py-1.5 rounded border border-ib-700 flex items-center">
                        {t.name}
                      </span>
                    ))}
                    {module.tools.length > 4 && <span className="text-xs text-gray-500 px-1">...</span>}
                  </div>
                </div>
                
                <div className="mt-6 flex items-center text-ib-accent text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-[-10px] group-hover:translate-x-0 duration-300">
                  进入系统 <ArrowRight size={16} className="ml-1" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-ib-900 overflow-hidden font-sans text-gray-100">
      <Sidebar 
        currentModule={currentModuleId} 
        onSelectModule={setCurrentModuleId}
        isOpen={sidebarOpen}
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />

      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
        {/* Top Bar (Module Info) */}
        {currentModuleId !== ModuleId.Dashboard && (
          <div className="h-16 border-b border-ib-700 bg-ib-900/95 backdrop-blur flex items-center px-6 justify-between shrink-0 z-10 shadow-sm">
             <div className="flex items-center">
                <span className={`mr-3 p-2 rounded-lg bg-ib-800 border border-ib-700 ${currentModuleConfig?.color}`}>
                  {(() => {
                    const I = (Icons as any)[currentModuleConfig?.icon || 'HelpCircle'];
                    return <I size={20} />;
                  })()}
                </span>
                <div>
                  <h2 className="text-lg font-bold text-white tracking-tight">{currentModuleConfig?.name}</h2>
                  <div className="flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-ib-success animate-pulse"></span>
                    <p className="text-[10px] text-gray-400 font-mono uppercase">System Active</p>
                  </div>
                </div>
             </div>
             
             <div className="flex items-center space-x-6">
               <div className="hidden md:flex text-xs text-gray-500 font-mono">
                  <div className="flex items-center"><Globe size={14} className="mr-2 text-ib-600"/> GLOBAL CONTEXT ON</div>
               </div>
               <div className="h-6 w-px bg-ib-700 hidden md:block"></div>
               <ModelSelector />
             </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto bg-gradient-to-br from-ib-900 to-[#0B1120] relative custom-scrollbar">
          {currentModuleId === ModuleId.Dashboard ? (
            <DashboardView />
          ) : (
            <div className="max-w-4xl mx-auto min-h-full flex flex-col p-6">
              {/* Welcome Message for System */}
              {messages.filter(m => m.moduleId === currentModuleId).length === 0 && (
                <div className="flex flex-col items-center justify-center flex-1 opacity-100 mb-10 mt-10 animate-fade-in-up">
                  <div className={`mb-6 p-4 rounded-full bg-ib-800 border border-ib-700 ${currentModuleConfig?.color}`}>
                    {(() => {
                      const I = (Icons as any)[currentModuleConfig?.icon || 'HelpCircle'];
                      return <I size={48} />;
                    })()}
                  </div>
                  
                  {/* Clean Title Only */}
                  <h3 className="text-3xl font-bold mb-8 text-white">{currentModuleConfig?.name}</h3>
                  
                  {/* Tool Cards Grid - Static Display */}
                  <div className="w-full max-w-3xl mb-4 flex items-center justify-center">
                    <Sparkles size={14} className="text-ib-accent mr-2" />
                    <span className="text-xs font-mono text-gray-500 uppercase tracking-wider">系统搭载能力 (System Capabilities)</span>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-3xl">
                    {currentModuleConfig?.tools.map(tool => {
                      const ToolIcon = (Icons as any)[tool.icon] || Icons.Box;
                      return (
                        <div 
                          key={tool.id}
                          className="bg-ib-800/20 border border-ib-700/50 p-5 rounded-lg cursor-default transition-all"
                        >
                          <div className="flex items-center mb-2">
                            <div className={`p-1.5 rounded bg-ib-900/50 mr-3 text-gray-400`}>
                              <ToolIcon size={16} />
                            </div>
                            <h4 className="text-sm font-semibold text-gray-200">{tool.name}</h4>
                          </div>
                          <p className="text-xs text-gray-500 leading-relaxed mb-3">
                            {tool.description}
                          </p>
                          <div className="flex flex-wrap gap-1.5 opacity-70">
                            {tool.keywords.slice(0, 3).map(k => (
                              <span key={k} className="text-[10px] bg-ib-900/30 text-gray-500 px-1.5 py-0.5 rounded border border-ib-700/30">
                                {k}
                              </span>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Chat History */}
              <div className="space-y-6 pb-4">
                {messages.filter(m => m.moduleId === currentModuleId).map((msg) => (
                  <ChatMessage key={msg.id} message={msg} />
                ))}
                
                {isLoading && (
                  <div className="flex items-center space-x-3 p-4 bg-ib-800/50 rounded-lg border border-ib-700/50 max-w-xs animate-pulse">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-ib-accent rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-ib-accent rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-ib-accent rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                    <span className="text-xs font-mono text-gray-400">
                       {currentModel === 'deepseek' ? 'DeepSeek V3 深度思考中...' : 'Gemini 智能引擎运算中...'}
                    </span>
                  </div>
                )}
              </div>
              <div ref={messagesEndRef} className="h-4"/>
            </div>
          )}
        </div>

        {/* Input Area - Always Visible now */}
        <div className="bg-ib-900 border-t border-ib-700 p-6 shrink-0 z-20">
          <div className="max-w-4xl mx-auto relative">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={currentModuleId === ModuleId.Dashboard ? "全域智能路由：请输入任意指令 (如：找新能源标的、分析这家公司、写一份BP)..." : `请输入业务需求，${currentModel === 'deepseek' ? 'DeepSeek' : 'Gemini'} 将自动匹配分析逻辑...`}
              className="w-full bg-ib-800 text-white placeholder-gray-500 border border-ib-700 rounded-xl pl-5 pr-14 py-4 focus:outline-none focus:border-ib-accent focus:ring-1 focus:ring-ib-accent resize-none h-[64px] shadow-lg transition-all"
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputText.trim() || isLoading}
              className="absolute right-3 top-3 p-2.5 bg-ib-accent hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;