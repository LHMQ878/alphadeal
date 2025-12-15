export enum ModuleId {
  Dashboard = 'dashboard',
  Discovery = 'discovery',
  Analysis = 'analysis',
  Execution = 'execution',
}

export interface ToolConfig {
  id: string;
  name: string;
  description: string;
  icon: string;
  keywords: string[];
}

export interface ModuleConfig {
  id: ModuleId;
  name: string;
  description: string;
  icon: string;
  color: string;
  tools: ToolConfig[];
}

export enum Sender {
  User = 'user',
  System = 'system',
}

export type ModelProvider = 'gemini' | 'deepseek';

export interface Message {
  id: string;
  text: string;
  sender: Sender;
  timestamp: number;
  moduleId?: ModuleId;
  chartData?: any; // Optional JSON data for visualization
}

export interface ChatSession {
  id: string;
  moduleId: ModuleId;
  messages: Message[];
  title: string;
  lastUpdated: number;
}