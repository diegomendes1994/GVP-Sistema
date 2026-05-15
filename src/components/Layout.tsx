import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { Menu, X } from 'lucide-react';
import { ToastContainer } from './Toast';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex bg-slate-50 min-h-screen relative overflow-hidden">
      
      {/* Mobile Toggle Button */}
      <button 
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed top-6 right-6 z-50 p-4 bg-slate-950 text-white rounded-3xl shadow-2xl border border-white/10 active:scale-90 transition-all"
      >
        {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Overlay for Mobile */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          className="lg:hidden fixed inset-0 bg-slate-950/60 backdrop-blur-md z-40 animate-in fade-in duration-300"
        ></div>
      )}

      {/* Sidebar Component with responsiveness */}
      <div className={`fixed inset-y-0 left-0 z-40 transform transition-transform duration-500 lg:relative lg:translate-x-0 ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <Sidebar className="w-80 h-full shadow-2xl lg:shadow-none" />
      </div>

      <main className="flex-1 w-full min-h-screen p-4 md:p-8 lg:p-12 overflow-x-hidden bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-50/20 via-slate-50 to-slate-50">
        <div className="max-w-7xl mx-auto space-y-8 lg:space-y-12 animate-in rotate-in-from-top-1 fade-in duration-1000">
          {children}
        </div>
      </main>
      <ToastContainer />
    </div>
  );
};

export default Layout;
