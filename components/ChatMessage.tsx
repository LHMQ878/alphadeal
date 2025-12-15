import React from 'react';
import { Message, Sender } from '../types';
import { Bot, User } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';

interface ChatMessageProps {
  message: Message;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

// Made children optional to fix TypeScript error "Property 'children' is missing"
const ChartContainer = ({ title, children }: { title: string; children?: React.ReactNode }) => (
  <div className="mt-4 mb-4 p-4 bg-ib-800 rounded-lg border border-ib-700 h-[300px] w-full max-w-2xl">
    <h4 className="text-sm font-semibold text-gray-300 mb-2 text-center">{title}</h4>
    <ResponsiveContainer width="100%" height="100%">
      {children as React.ReactElement}
    </ResponsiveContainer>
  </div>
);

const RenderChart = ({ data }: { data: any }) => {
  if (!data || !data.type || !data.data) return null;

  if (data.type === 'bar') {
    return (
      <ChartContainer title={data.title}>
        <BarChart data={data.data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
          <YAxis stroke="#94a3b8" fontSize={12} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
          />
          <Legend />
          <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ChartContainer>
    );
  }

  if (data.type === 'radar') {
    return (
      <ChartContainer title={data.title}>
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data.data}>
          <PolarGrid stroke="#334155" />
          <PolarAngleAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
          <PolarRadiusAxis stroke="#334155" />
          <Radar name="Value" dataKey="value" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
          <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }} />
        </RadarChart>
      </ChartContainer>
    );
  }

   if (data.type === 'line') {
    return (
      <ChartContainer title={data.title}>
        <LineChart data={data.data}>
           <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
          <YAxis stroke="#94a3b8" fontSize={12} />
           <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }} />
           <Legend />
          <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} />
        </LineChart>
      </ChartContainer>
    );
  }

  return (
    <div className="p-2 text-xs text-red-400 border border-red-900 bg-red-900/10 rounded">
      Unsupported chart type: {data.type}
    </div>
  );
};

// Simple formatter to handle basic markdown-like syntax
const formatText = (text: string) => {
  // Split by code blocks first if necessary, but here we do simple processing
  // Handle bold (**text**)
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index} className="text-white font-bold">{part.slice(2, -2)}</strong>;
    }
    // Handle new lines
    return part.split('\n').map((line, i) => (
      <React.Fragment key={`${index}-${i}`}>
        {line}
        {i < part.split('\n').length - 1 && <br />}
      </React.Fragment>
    ));
  });
};

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.sender === Sender.User;

  return (
    <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[85%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center 
          ${isUser ? 'bg-ib-accent ml-3' : 'bg-ib-700 mr-3'}`}>
          {isUser ? <User size={20} className="text-white" /> : <Bot size={20} className="text-ib-accent" />}
        </div>

        {/* Bubble */}
        <div 
          className={`flex flex-col p-4 rounded-xl shadow-lg 
            ${isUser 
              ? 'bg-ib-accent text-white rounded-tr-none' 
              : 'bg-ib-800 border border-ib-700 text-gray-200 rounded-tl-none'}`}
        >
          {/* Header for Bot */}
          {!isUser && (
            <div className="flex items-center space-x-2 mb-2 border-b border-gray-600 pb-2">
              <span className="text-xs font-mono text-ib-accent uppercase">AlphaDeal 智能引擎</span>
              <span className="text-[10px] text-gray-500">{new Date(message.timestamp).toLocaleTimeString()}</span>
            </div>
          )}

          {/* Content */}
          <div className={`text-sm leading-relaxed ${!isUser ? 'font-mono' : 'font-sans'}`}>
            {formatText(message.text)}
          </div>

          {/* Chart Visualization */}
          {!isUser && message.chartData && (
            <RenderChart data={message.chartData} />
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
