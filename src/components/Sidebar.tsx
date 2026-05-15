import React from 'react'; // GVP Navigation v3.5.2 Build
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Database, 
  Zap,
  ChevronRight,
  LogOut,
  User as UserIcon,
  BarChart2
} from 'lucide-react';
import { supabase } from '../lib/supabase';

interface SidebarProps {
  className?: string;
  userRole?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ className = "" }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { name: 'Início', path: '/dashboard', icon: Home },
    { name: 'Central de Dados', path: '/medicos', icon: Database },
    { name: 'Esteira de Abordagem', path: '/recem-encontrados', icon: Zap },
    { name: 'Relatórios', path: '/relatorios', icon: BarChart2 },
  ];

  const handleLogout = async () => {
    try {
      // 1. Deslogar do Supabase (Servidor)
      await supabase.auth.signOut();
      
      // 2. Limpar papéis "fantasmas" (LocalStorage/Cookies Local)
      localStorage.clear(); 
      sessionStorage.clear();
      
      // 3. Empurrar para o Login e Recarregar a Aplicação (Full Shield)
      navigate('/login');
      window.location.reload(); 
    } catch (err) {
      console.error('Erro ao desconectar GVP:', err);
    }
  };

  return (
    <aside className={`w-80 h-full bg-slate-950 text-white flex flex-col p-8 border-r border-white/5 relative overflow-hidden group ${className}`}>
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
         <div className="absolute top-[-100px] left-[-100px] w-64 h-64 bg-blue-600 rounded-full blur-[120px]"></div>
      </div>

      <div className="flex items-center gap-5 mb-14 px-2 relative z-10">
        <div className="w-14 h-14 bg-blue-600 rounded-[22px] flex items-center justify-center shadow-2xl flex-shrink-0 animate-in zoom-in duration-700">
           <Zap className="w-7 h-7 text-white fill-white" />
        </div>
        <div className="flex flex-col">
           <h2 className="text-2xl font-bold tracking-tight leading-none text-white">Sistema GVP</h2>
           <span className="text-blue-400 font-medium text-xs mt-1">Bem-vindo</span>
        </div>
      </div>

      <nav className="flex-1 space-y-3 relative z-10 overflow-y-auto">
        <p className="text-xs font-semibold text-slate-500 px-4 mb-4">Navegação Principal</p>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path || 
                          (item.path !== '/' && location.pathname.startsWith(item.path));
          
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex items-center justify-between p-5 rounded-[26px] transition-all border-2 ${
                isActive 
                ? 'bg-white border-white text-slate-950 shadow-2xl shadow-blue-500/20 translate-x-2' 
                : 'text-slate-400 border-transparent hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-5">
                <item.icon className={`w-5 h-5 ${isActive ? 'scale-110 text-blue-600' : ''}`} />
                <span className="text-[11px] font-black uppercase tracking-widest italic">{item.name}</span>
              </div>
              {isActive && <ChevronRight className="w-4 h-4 text-slate-950 animate-in slide-in-from-left-2" />}
            </NavLink>
          );
        })}
      </nav>

      <div className="mt-auto pt-10 border-t border-white/5 space-y-6 relative z-10">
         <div className="flex items-center gap-4 px-4 py-3 bg-white/5 rounded-[22px] border border-transparent">
            <div className="w-10 h-10 bg-slate-900 border border-white/10 rounded-xl flex items-center justify-center">
               <UserIcon className="w-4 h-4 text-blue-500" />
            </div>
            <div className="flex flex-col">
               <span className="text-[10px] font-black text-white uppercase tracking-widest leading-none">Gestor GVP</span>
               <div className="flex items-center gap-1.5 mt-1.5">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50"></div>
                  <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Online</span>
               </div>
            </div>
         </div>
        
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-5 p-5 bg-red-600/5 text-red-500/60 hover:text-white hover:bg-red-600 rounded-[26px] transition-all border-2 border-transparent hover:border-red-400 group/out"
        >
          <LogOut className="w-5 h-5 group-hover/out:translate-x-1 transition-transform" />
          <span className="text-[11px] font-black uppercase tracking-[0.2em] italic">DESCONECTAR GVP</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
