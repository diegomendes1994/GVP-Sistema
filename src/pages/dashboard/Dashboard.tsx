import React, { useState, useEffect, useCallback } from 'react';
import type { Medico } from '../../types/medico';
import Layout from '../../components/Layout';
import { 
  Users, Zap, CheckCircle2,
  Loader2, ArrowUpRight, Rocket, RefreshCw, Calendar, ChevronDown, AlertCircle
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { toast } from '../../components/Toast';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({ total: 0, fila: 0, emAndamento: 0, concluido: 0, semAbordagem: 0, progressoGeral: 0 });
  const [loading, setLoading] = useState(true);
  const [periodo, setPeriodo] = useState('todo');

  // useCallback garante que a função sempre lê o período correto (sem closure stale)
  const fetchStats = useCallback(async (periodoAtual: string = periodo) => {
    setLoading(true);
    try {
      let query = supabase.from('medicos').select('*');

      if (periodoAtual !== 'todo') {
        const agora = new Date();
        let dataLimite: Date;
        
        if (periodoAtual === 'hoje') {
          dataLimite = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate(), 0, 0, 0);
        } else if (periodoAtual === 'semana') {
          dataLimite = new Date(agora.getTime() - 7 * 24 * 60 * 60 * 1000);
        } else {
          dataLimite = new Date(agora.getFullYear(), agora.getMonth() - 1, agora.getDate());
        }
        
        const dataStr = dataLimite.toISOString();
        // Filtra por registros atualizados OU criados dentro do período
        query = query.or(`updated_at.gte.${dataStr},created_at.gte.${dataStr}`);
      }

      const { data: medicos, error } = await query;
      if (error) throw error;
      if (!medicos) return;

      const med = medicos as Medico[];
      const total = med.length;
      
      const fila = med.filter(m => m.status_atual === 'pronto').length;
      const emAndamento = med.filter(m => m.status_atual === 'abordando').length;
      const concluido = med.filter(m => m.status_atual === 'concluido').length;
      const semAbordagem = med.filter(m => m.status_atual === 'novo' || !m.status_atual).length;
      
      const totalProcesso = fila + emAndamento + concluido;
      const progresso = totalProcesso > 0 ? Math.round((concluido / totalProcesso) * 100) : 0;

      setStats({ total, fila, emAndamento, concluido, semAbordagem, progressoGeral: progresso });
    } catch (err: any) {
      console.error('Erro GVP Dashboard:', err);
      toast.error(err.message || 'Erro ao carregar Dashboard. Verifique o schema no Supabase.');
    } finally {
      setLoading(false);
    }
  }, [periodo]);

  useEffect(() => {
    // Passa o período explicitamente para evitar closure stale
    fetchStats(periodo);

    // Real-time: escuta mudanças na tabela e recalcula
    const channel = supabase
      .channel(`dashboard-${periodo}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'medicos' }, () => {
        fetchStats(periodo);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [periodo]); // Reexecuta SEMPRE que o período mudar

return (
    <Layout>
      <div className="space-y-8 md:space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-24 text-slate-900">
        
        {/* Header */}
         <div className="bg-slate-950 p-8 md:p-14 rounded-[40px] shadow-2xl relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[140px] -mr-48 -mt-48"></div>
           <div className="relative z-10 flex flex-col lg:flex-row justify-between items-center gap-8">
              <div className="space-y-3 text-center lg:text-left">
                 <div className="flex items-center justify-center lg:justify-start gap-3">
                    <div className="w-2.5 h-2.5 bg-blue-400 rounded-full shadow-lg shadow-blue-400/50"></div>
                    <span className="text-xs font-medium text-slate-400 tracking-wide">Visão Geral Formada</span>
                 </div>
                 <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-none">Meu Painel</h1>
              </div>
              <div className="flex items-center gap-3">
                 <div className="relative">
                    <select 
                      value={periodo}
                      onChange={(e) => setPeriodo(e.target.value)}
                      className="bg-white/10 border-2 border-white/20 text-white pl-10 pr-8 py-5 rounded-[22px] font-black text-[10px] uppercase tracking-widest focus:outline-none appearance-none cursor-pointer hover:bg-white/15 transition-all min-w-[200px] italic"
                    >
                       <option value="hoje" className="bg-slate-900">Hoje</option>
                       <option value="semana" className="bg-slate-900">Última Semana</option>
                       <option value="mes" className="bg-slate-900">Último Mês</option>
                       <option value="todo" className="bg-slate-900">Toda a Base</option>
                    </select>
                    <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400 pointer-events-none" />
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
                 </div>
                 <button 
                   onClick={() => fetchStats(periodo)}
                   className="p-5 bg-blue-600 text-white rounded-[22px] hover:bg-white hover:text-slate-950 transition-all shadow-2xl border-b-4 border-blue-800 active:translate-y-1"
                   title="Atualizar Métricas"
                 >
                    <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                 </button>
              </div>
           </div>
        </div>

        {loading ? (
           <div className="py-24 text-center space-y-4">
              <Loader2 className="w-14 h-14 text-blue-600 animate-spin mx-auto opacity-20" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse italic">Calculando métricas...</p>
           </div>
        ) : (
            <>
              {/* Cards de KPI */}
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                 <StatCard title="Total na Base" value={stats.total} icon={<Users className="w-5 h-5 text-slate-600" />} color="bg-white border-slate-100" subtitle="Todos os médicos" />
                 <StatCard title="Na Fila" value={stats.fila} icon={<Rocket className="w-5 h-5 text-blue-500" />} color="bg-blue-50 text-blue-600 border-blue-100" subtitle="Aguardando abordagem" />
                 <StatCard title="Em Andamento" value={stats.emAndamento} icon={<Zap className="w-5 h-5 text-orange-500" />} color="bg-orange-50 text-orange-600 border-orange-100" subtitle="Contatos ativos" />
                 <StatCard title="Concluídos" value={stats.concluido} icon={<CheckCircle2 className="w-5 h-5 text-green-600" />} color="bg-green-50 text-green-600 border-green-100" subtitle="Pipeline finalizado" />
                 <StatCard title="Sem Abordagem" value={stats.semAbordagem} icon={<AlertCircle className="w-5 h-5 text-slate-500" />} color="bg-slate-50 text-slate-600 border-slate-100" subtitle="Leads Novos ou Brutos" />
              </div>
           </>
        )}
      </div>
    </Layout>
  );
};

 const StatCard = ({ title, value, icon, color, subtitle }: any) => (
  <div className={`p-8 rounded-[36px] shadow-2xl shadow-slate-200/20 border transition-all hover:scale-[1.04] cursor-pointer group flex flex-col justify-between min-h-[200px] ${color}`}>
     <div className="flex justify-between items-start">
        <div className="p-3 bg-white rounded-2xl shadow-sm border border-white group-hover:rotate-6 transition-transform duration-500">{icon}</div>
        <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
           <ArrowUpRight className="w-5 h-5" />
        </div>
     </div>
     <div>
        <h2 className="text-5xl font-bold tracking-tight leading-none text-slate-900 mt-4">{value}</h2>
        <p className="text-sm font-semibold tracking-wide text-slate-700 mt-3 leading-none">{title}</p>
        <p className="text-xs font-medium opacity-60 mt-1">{subtitle}</p>
     </div>
  </div>
);

export default Dashboard;
