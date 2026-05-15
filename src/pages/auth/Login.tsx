import React, { useState } from 'react'; // GVP Ultra-Premium Login v3.5.4 Build
import { useNavigate, Link } from 'react-router-dom';
import { 
  User, 
  Lock, 
  ShieldCheck, 
  ArrowRight,
  Stethoscope,
  Database,
  Loader2,
  Sparkles
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      // Agora o App.tsx monitora a sessão real do Supabase (onAuthStateChange)
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message === 'Invalid login credentials' ? 'E-mail ou senha incorretos.' : err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0c10] flex items-center justify-center p-6 relative overflow-hidden font-sans selection:bg-blue-500/30 selection:text-white">
      
      {/* Background de Alta Performance: Gradientes GVP Master */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
         <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-600/10 rounded-full blur-[160px] animate-pulse"></div>
         <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-indigo-600/10 rounded-full blur-[160px] animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 bg-white/5 backdrop-blur-[40px] rounded-[64px] shadow-[0_40px_100px_rgba(0,0,0,0.6)] overflow-hidden border border-white/10 relative z-10 animate-in fade-in zoom-in duration-800">
         
         {/* Lado Esquerdo: Branding GVP Master */}
         <div className="hidden lg:flex flex-col justify-between p-20 bg-slate-950 text-white relative overflow-hidden group">
            <div className="relative z-10">
               <div className="flex items-center gap-6 mb-16">
                  <div className="p-5 bg-blue-600 rounded-[28px] shadow-[0_0_40px_rgba(37,99,235,0.4)] transition-transform duration-500 hover:rotate-12">
                     <Stethoscope className="w-9 h-9" />
                  </div>
                  <div>
                     <h2 className="text-3xl font-bold tracking-tight leading-none text-white">Sistema GVP</h2>
                     <p className="text-sm font-medium text-blue-400 mt-2 flex items-center gap-2">
                        <Sparkles className="w-4 h-4" /> Gestão de Contatos
                     </p>
                  </div>
               </div>

               <div className="space-y-8 max-w-md">
                  <h1 className="text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight text-white">
                     Acesso <br/> <span className="text-blue-500">Exclusivo</span> GVP.
                  </h1>
                  <p className="text-slate-400 leading-relaxed text-lg mt-6">
                     Autenticação para gestão de informações e relatórios.
                  </p>
               </div>
            </div>

            <div className="relative z-10">
               <div className="p-10 bg-white/5 rounded-[40px] border border-white/10 backdrop-blur-xl shadow-2xl">
                  <div className="flex items-center gap-5 mb-5 text-blue-400">
                     <Database className="w-7 h-7" />
                     <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">Servidor Supabase Ativo</span>
                  </div>
                  <p className="text-sm font-bold text-slate-500 leading-relaxed italic opacity-70">
                     Sua sessão é protegida com criptografia ponta a ponta.
                  </p>
               </div>
            </div>
         </div>

         {/* Lado Direito: Dashboard Login GVP v3.5.4 */}
         <div className="p-10 lg:p-24 flex flex-col justify-center bg-white relative overflow-hidden lg:rounded-r-[64px]">
            <div className="max-w-md mx-auto w-full relative z-10">
               <div className="mb-16">
                  <div className="w-12 h-2 bg-blue-700 rounded-full mb-8"></div>
                  <h2 className="text-4xl font-bold text-slate-900 tracking-tight mb-2 leading-none">Bem-vindo</h2>
                  <p className="text-slate-500 font-medium text-sm">Acesse sua conta para continuar</p>
               </div>

               {error && (
                 <div className="mb-10 p-6 bg-red-50 border-l-8 border-red-500 text-red-600 rounded-3xl text-[10px] font-black uppercase tracking-widest flex items-center gap-4 animate-in duration-500">
                    <ShieldCheck className="w-6 h-6 shrink-0" />
                    {error}
                 </div>
               )}

               <form onSubmit={handleLogin} className="space-y-10">
                  <div className="space-y-8">
                     <div className="space-y-3 group">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 ml-4 group-focus-within:text-blue-600 transition-all italic">E-mail Operacional</label>
                        <div className="relative">
                           <div className="absolute inset-y-0 left-0 pl-7 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                              <User className="w-5 h-5" />
                           </div>
                           <input 
                              type="email" 
                              required
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              placeholder="seu.email@gvp.com.br"
                              className="w-full bg-slate-50 border-2 border-slate-100 px-16 py-6 rounded-[32px] focus:outline-none focus:border-blue-500 transition-all font-bold text-sm tracking-tight outline-none italic h-[70px]"
                           />
                        </div>
                     </div>

                     <div className="space-y-3 group">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 ml-4 group-focus-within:text-blue-600 transition-all italic">Senha Master</label>
                        <div className="relative">
                           <div className="absolute inset-y-0 left-0 pl-7 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                              <Lock className="w-5 h-5" />
                           </div>
                           <input 
                              type="password" 
                              required
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              placeholder="••••••••••••"
                              className="w-full bg-slate-50 border-2 border-slate-100 px-16 py-6 rounded-[32px] focus:outline-none focus:border-blue-500 transition-all font-bold text-sm tracking-tight outline-none italic h-[70px]"
                           />
                        </div>
                     </div>
                  </div>

                  <button 
                     type="submit"
                     disabled={loading}
                     className="w-full py-5 mt-4 bg-slate-900 text-white rounded-[22px] font-bold text-sm shadow-xl hover:bg-blue-600 transition-all flex items-center justify-center gap-3 active:translate-y-1 group disabled:opacity-50 mb-8"
                  >
                     {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Entrar na Plataforma'}
                     {!loading && <ArrowRight className="w-6 h-6 group-hover:translate-x-3 transition-transform" />}
                  </button>
               </form>

               <div className="text-center pt-8 border-t border-slate-50">
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic mb-2">Restrito a Colaboradores</p>
                  <Link to="/signup" className="text-[11px] font-black text-blue-600 uppercase tracking-[0.3em] hover:text-slate-900 transition-colors underline-offset-8 hover:underline italic">Nova Credencial GVP</Link>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default Login;
