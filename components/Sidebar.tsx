import React from 'react';
import { MODULES } from '../constants';
import { ModuleId } from '../types';
import * as Icons from 'lucide-react';

interface SidebarProps {
  currentModule: ModuleId | null;
  onSelectModule: (id: ModuleId) => void;
  isOpen: boolean;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentModule, onSelectModule, isOpen, toggleSidebar }) => {
  return (
    <div 
      className={`fixed left-0 top-0 h-full bg-ib-900 border-r border-ib-700 transition-all duration-300 z-50 flex flex-col
        ${isOpen ? 'w-64' : 'w-16'}`}
    >
      {/* Header */}
      <div className="h-16 flex items-center justify-center border-b border-ib-700 bg-ib-900 shrink-0">
        <div 
          onClick={toggleSidebar} 
          className="cursor-pointer flex items-center justify-center w-full h-full hover:bg-ib-800 transition-colors"
        >
          {isOpen ? (
            <h1 className="text-xl font-bold tracking-tighter text-ib-accent">
              Alpha<span className="text-white">Deal</span>
            </h1>
          ) : (
             <span className="text-xl font-bold text-ib-accent">A<span className="text-white">D</span></span>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 space-y-2 custom-scrollbar">
        {/* Dashboard Link */}
        <button
          onClick={() => onSelectModule(ModuleId.Dashboard)}
          className={`w-full flex items-center px-4 py-3 transition-colors duration-200 border-l-4
            ${currentModule === ModuleId.Dashboard 
              ? 'bg-ib-800 border-ib-accent text-white' 
              : 'border-transparent text-ib-600 hover:text-gray-200 hover:bg-ib-800'}`}
        >
          <Icons.LayoutDashboard size={20} />
          {isOpen && <span className="ml-3 font-medium text-sm">工作台</span>}
        </button>

        <div className="my-2 border-t border-ib-700 mx-4 opacity-50"></div>

        {/* Core Systems */}
        {MODULES.map((module) => {
          const IconComponent = (Icons as any)[module.icon] || Icons.HelpCircle;
          return (
            <button
              key={module.id}
              onClick={() => onSelectModule(module.id)}
              className={`w-full flex items-center px-4 py-3 transition-colors duration-200 border-l-4 group
                ${currentModule === module.id 
                  ? 'bg-ib-800 border-ib-accent text-white' 
                  : 'border-transparent text-gray-400 hover:text-white hover:bg-ib-800'}`}
              title={!isOpen ? module.name : ''}
            >
              <div className={`${currentModule === module.id ? module.color : 'text-gray-500 group-hover:text-white'} transition-colors`}>
                <IconComponent size={20} />
              </div>
              {isOpen && (
                <div className="ml-3 text-left">
                  <span className="block font-medium text-sm">{module.name}</span>
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-ib-700 bg-ib-900 shrink-0">
         <div className="flex items-center text-xs text-gray-500">
            {isOpen && <span>系统状态: <span className="text-ib-success">在线</span></span>}
            {!isOpen && <div className="w-2 h-2 rounded-full bg-ib-success mx-auto"></div>}
         </div>
      </div>
    </div>
  );
};

export default Sidebar;