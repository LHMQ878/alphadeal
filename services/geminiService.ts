import { Message, ModelProvider } from '../types';

/**
 * Sends chat history to the backend server (Node.js).
 * Frontend does NOT need API Keys anymore.
 */
export const sendMessageToAI = async (
  history: Message[],
  currentMessage: string,
  contextModule: string,
  globalContext: string = "",
  toolsContext: string = "",
  modelProvider: ModelProvider = 'gemini'
): Promise<{ text: string; chartData?: any }> => {
  
  // 3001 is our dedicated backend port
  const API_ENDPOINT = 'http://localhost:3001/api/chat';

  try {
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        history,
        currentMessage,
        contextModule,
        globalContext,
        toolsContext,
        modelProvider
      }),
    });

    if (!response.ok) {
      // Try to get error message from server
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.text || `HTTP Error ${response.status}`);
    }

    const data = await response.json();
    return {
      text: data.text,
      chartData: data.chartData
    };

  } catch (error: any) {
    console.error("Backend Connection Error:", error);
    
    // Friendly error message for the UI
    let userMessage = `**通信失败**: 无法连接到后端服务器。`;
    if (error.message.includes('Failed to fetch')) {
      userMessage += `\n\n请确认您是否已启动后端服务？\n运行命令: \`node server.js\``;
    } else {
      userMessage += `\n\n错误详情: ${error.message}`;
    }

    return {
      text: userMessage
    };
  }
};
