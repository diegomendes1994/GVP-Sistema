import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  User, 
  Lock, 
  ShieldCheck, 
  ArrowRight,
  Stethoscope,
  ShieldAlert,
  Loader2,
  Mail,
  Sparkles
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

const Signup: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const { error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          }
        }
      });

      if (authError) throw authError;

      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0c10] flex items-center justify-center p-6 relative overflow-hidden font-sans selection:bg-blue-500/30 selection:text-white">
      
      {/* Background Pro GVP */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
         <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-600/10 rounded-full blur-[160px] animate-pulse"></div>
         <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-indigo-600/10 rounded-full blur-[160px] animate-pulse" style={{ animationDelay: '2s' }}></div>
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]"></div>
      </div>

      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 bg-white/5 backdrop-blur-[40px] rounded-[64px] shadow-[0_40px_100px_rgba(0,0,0,0.6)] overflow-hidden border border-white/10 relative z-10 animate-in fade-in zoom-in duration-1000">
         
         {/* Branding Lateral */}
         <div className="hidden lg:flex flex-col justify-between p-24 bg-gradient-to-br from-slate-950 via-slate-950 to-blue-950 text-white relative overflow-hidden group">
            <div className="absolute inset-0 bg-blue-600/5 pointer-events-none"></div>
            
            <div className="relative z-10">
               <div className="flex items-center gap-6 mb-16">
                  <div className="p-5 bg-blue-600 rounded-[28px] shadow-[0_0_40px_rgba(37,99,235,0.4)] group-hover:rotate-6 transition-transform">
                     <Stethoscope className="w-9 h-9" />
                  </div>
                  <div>
                     <h2 className="text-3xl font-black tracking-tighter leading-none uppercase">GVP</h2>
                     <p className="text-[10px] font-black uppercase text-blue-500 tracking-[0.4em] mt-2 opacity-80 flex items-center gap-2">
                        <Sparkles className="w-3 h-3" /> NOVO USUÁRIO
                     </p>
                  </div>
               </div>

               <div className="space-y-8 max-w-md">
                  <h1 className="text-6xl font-black leading-[1.1] tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400">
                     Acesso Pro <br/> <span className="text-blue-500">Exclusivo.</span>
                  </h1>
                  <p className="text-slate-400 font-bold leading-relaxed text-xl opacity-90">
                     Crie suas credenciais oficiais e junte-se ao time de gestão GVP hoje mesmo.
                  </p>
               </div>
            </div>

            <div className="relative z-10">
               <div className="p-10 bg-white/5 rounded-[40px] border border-white/10 backdrop-blur-xl shadow-2xl group/card hover:bg-white/10 transition-all">
                  <div className="flex items-center gap-5 mb-5 text-blue-400">
                     <ShieldCheck className="w-7 h-7" />
                     <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">Auditoria Completa</span>
                  </div>
                  <p className="text-sm font-bold text-slate-500 leading-relaxed">
                     Sua conta registrará todas as ações sob seu nome, garantindo a integridade da base GVP.
                  </p>
               </div>
            </div>
         </div>

         {/* Formulário de Cadastro */}
         <div className="p-10 lg:p-24 flex flex-col justify-center bg-white/95 relative overflow-hidden">
            <div className="max-w-md mx-auto w-full relative z-10">
               <div className="mb-16">
                  <div className="w-12 h-1 bg-blue-600 rounded-full mb-8"></div>
                  <h2 className="text-5xl font-black text-slate-950 tracking-tighter mb-3 leading-none">Novo Registro.</h2>
                  <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em] px-1">Painel GVP - Admissão de Usuário</p>
               </div>

               {error && (
                 <div className="mb-10 p-6 bg-red-50 border-l-8 border-red-500 text-red-600 rounded-3xl text-xs font-black uppercase tracking-widest flex items-center gap-4 animate-in shake duration-500">
                    <ShieldAlert className="w-6 h-6 shrink-0" />
                    {error}
                 </div>
               )}

               {success ? (
                 <div className="p-12 bg-green-50/50 border-2 border-green-100/50 text-green-600 rounded-[48px] text-center space-y-8 animate-in zoom-in duration-500 shadow-2xl shadow-green-100/20 backdrop-blur-sm">
                    <div className="w-20 h-20 bg-white rounded-[28px] flex items-center justify-center mx-auto shadow-xl ring-1 ring-green-100 group-hover:scale-110 transition-transform">
                       <ShieldCheck className="w-10 h-10" />
                    </div>
                    <div className="space-y-4">
                       <h3 className="text-3xl font-black uppercase tracking-tighter">Conta Registrada!</h3>
                       <p className="text-sm font-bold opacity-80 uppercase text-[10px] tracking-[0.3em] leading-relaxed">O sistema GVP autenticou seu perfil. Redirecionando para o Login...</p>
                    </div>
                 </div>
               ) : (
                 <form onSubmit={handleSignup} className="space-y-6">
                    <div className="space-y-2 group">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 ml-4 group-focus-within:text-blue-600 transition-all">Nome Completo do Usuário</label>
                        <div className="relative">
                           <div className="absolute inset-y-0 left-0 pl-7 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                              <User className="w-5 h-5" />
                           </div>
                           <input 
                              type="text" 
                              required
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              placeholder="Nome do Usuário"
                              className="w-full bg-slate-50 border-2 border-slate-100 px-16 py-5 rounded-[28px] focus:outline-none focus:ring-8 focus:ring-blue-500/5 focus:border-blue-500 transition-all font-bold text-sm tracking-tight outline-none shadow-sm hover:bg-slate-100/50 uppercase placeholder:opacity-50"
                           />
                        </div>
                    </div>

                    <div className="space-y-2 group">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 ml-4 group-focus-within:text-blue-600 transition-all">E-mail Operacional</label>
                        <div className="relative">
                           <div className="absolute inset-y-0 left-0 pl-7 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                              <Mail className="w-5 h-5" />
                           </div>
                           <input 
                              type="email" 
                              required
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              placeholder="exemplo@gvp.com.br"
                              className="w-full bg-slate-50 border-2 border-slate-100 px-16 py-5 rounded-[28px] focus:outline-none focus:ring-8 focus:ring-blue-500/5 focus:border-blue-500 transition-all font-bold text-sm tracking-tight outline-none shadow-sm hover:bg-slate-100/50 uppercase placeholder:opacity-50"
                           />
                        </div>
                    </div>

                    <div className="space-y-2 group">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 ml-4 group-focus-within:text-blue-600 transition-all">Definir Senha Segura</label>
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
                              className="w-full bg-slate-50 border-2 border-slate-100 px-16 py-5 rounded-[28px] focus:outline-none focus:ring-8 focus:ring-blue-500/5 focus:border-blue-500 transition-all font-bold text-sm tracking-tight outline-none shadow-sm hover:bg-slate-100/50"
                           />
                        </div>
                    </div>

                    <button 
                       type="submit"
                       disabled={loading}
                       className="w-full py-7 mt-6 bg-blue-600 text-white rounded-[36px] font-black text-xs uppercase tracking-[0.3em] shadow-[0_20px_50px_rgba(37,99,235,0.3)] hover:bg-blue-700 transition-all flex items-center justify-center gap-5 border-b-6 border-blue-900 active:border-b-0 active:translate-y-2 group disabled:opacity-50"
                    >
                       {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Registrar Novo Usuário'}
                       {!loading && <ArrowRight className="w-6 h-6 group-hover:translate-x-3 transition-transform" />}
                    </button>
                 </form>
               )}

               <div className="mt-14 text-center">
                  <p className="text-xs font-bold text-slate-400">Já possui acesso?</p>
                  <Link to="/login" className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] hover:text-blue-600 mt-2 inline-block underline-offset-8 hover:underline transition-all">Fazer Login no Centro GVP</Link>
               </div>

               <div className="mt-20 pt-12 border-t border-slate-50 relative overflow-hidden flex items-center justify-center">
                  <button className="flex items-center gap-4 text-xs font-black text-slate-300 uppercase tracking-widest grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all">
                     <ShieldCheck className="w-4 h-4" />
                     SISTEMA DE SEGURANÇA GVP ATIVO
                  </button>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default Signup;
