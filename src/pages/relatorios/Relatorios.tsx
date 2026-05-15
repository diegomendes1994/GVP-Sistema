import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../../components/Layout';
import {
  Phone, Mail, Camera, Link2, Globe,
  Loader2, RefreshCw, BarChart2, Users,
  CheckCircle2, Zap, Rocket, AlertCircle, Calendar, ChevronDown
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface RelatorioData {
  total: number;
  fila: number;
  emAndamento: number;
  concluidos: number;
  semAbordagem: number;
  temWhatsapp: number;
  temEmail: number;
  temInstagram: number;
  temLinkedin: number;
  temWebsite: number;
  especialidades: { nome: string; total: number }[];
  volumeMeses: { mes: string; total: number }[];
}

const Relatorios: React.FC = () => {
  const [dados, setDados] = useState<RelatorioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [periodo, setPeriodo] = useState('todo');

  const fetchDados = useCallback(async (p: string = periodo) => {
    setLoading(true);
    try {
      let query = supabase.from('medicos').select('*');

      if (p !== 'todo') {
        const agora = new Date();
        let limite: Date;
        if (p === 'hoje') limite = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());
        else if (p === 'semana') limite = new Date(agora.getTime() - 7 * 24 * 60 * 60 * 1000);
        else limite = new Date(agora.getFullYear(), agora.getMonth() - 1, agora.getDate());
        query = query.or(`updated_at.gte.${limite.toISOString()},created_at.gte.${limite.toISOString()}`);
      }

      const { data, error } = await query;
      if (error) throw error;
      if (!data) return;

      const total = data.length;

      // Pipeline
      const fila = data.filter(m => m.status_atual === 'pronto').length;
      const emAndamento = data.filter(m => m.status_atual === 'abordando').length;
      const concluidos = data.filter(m => m.status_atual === 'concluido').length;
      const semAbordagem = data.filter(m => m.status_atual === 'novo' || !m.status_atual).length;

      // Canais
      const temWhatsapp = data.filter(m => m.telefone?.trim()).length;
      const temEmail = data.filter(m => m.email?.trim()).length;
      const temInstagram = data.filter(m => m.instagram?.trim()).length;
      const temLinkedin = data.filter(m => m.linkedin?.trim()).length;
      const temWebsite = data.filter(m => m.website?.trim()).length;

      // Top especialidades
      const espMap: Record<string, number> = {};
      data.forEach(m => { if (m.especialidade?.trim()) espMap[m.especialidade.trim()] = (espMap[m.especialidade.trim()] || 0) + 1; });
      const especialidades = Object.entries(espMap).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([nome, total]) => ({ nome, total }));

      // Volumetria por mês
      const volumeMeses = Object.entries(
        data.reduce((acc: Record<string, number>, m) => {
          if (m.created_at) {
            const date = new Date(m.created_at);
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            acc[key] = (acc[key] || 0) + 1;
          }
          return acc;
        }, {})
      ).sort((a, b) => a[0].localeCompare(b[0])).map(([key, total]) => {
        const [year, month] = key.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1, 1);
        const mesStr = `${date.toLocaleString('pt-BR', { month: 'short' }).toUpperCase()}/${year}`;
        return { mes: mesStr, total };
      });

      setDados({ total, fila, emAndamento, concluidos, semAbordagem, temWhatsapp, temEmail, temInstagram, temLinkedin, temWebsite, especialidades, volumeMeses });
    } catch (err) {
      console.error('Erro GVP Relatórios:', err);
    } finally {
      setLoading(false);
    }
  }, [periodo]);

  useEffect(() => { fetchDados(periodo); }, [periodo]);

  const maxEsp = dados?.especialidades[0]?.total || 1;

  return (
    <Layout>
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-24 text-slate-900">

        {/* Header */}
        <div className="bg-slate-950 p-8 md:p-12 rounded-[40px] shadow-2xl relative overflow-hidden border-b-8 border-blue-600">
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/20 rounded-full blur-[120px] -mr-40 -mt-40 animate-pulse"></div>
          <div className="relative z-10 flex flex-col lg:flex-row justify-between items-center gap-6">
            <div className="space-y-2 text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start gap-3">
                <div className="p-3 bg-blue-600 rounded-2xl shadow-xl"><BarChart2 className="w-6 h-6 text-white" /></div>
                <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter uppercase leading-none italic underline decoration-blue-600">Relatórios</h1>
              </div>
              <p className="text-blue-500 font-black uppercase text-[9px] tracking-[0.4em] italic">Inteligência GVP — Dados Detalhados</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <select value={periodo} onChange={e => setPeriodo(e.target.value)}
                  className="bg-white/10 border-2 border-white/20 text-white pl-10 pr-8 py-4 rounded-[20px] font-black text-[10px] uppercase tracking-widest focus:outline-none appearance-none cursor-pointer hover:bg-white/15 transition-all min-w-[180px] italic">
                  <option value="hoje" className="bg-slate-900">Hoje</option>
                  <option value="semana" className="bg-slate-900">Última Semana</option>
                  <option value="mes" className="bg-slate-900">Último Mês</option>
                  <option value="todo" className="bg-slate-900">Toda a Base</option>
                </select>
                <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400 pointer-events-none" />
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
              </div>
              <button onClick={() => fetchDados(periodo)}
                className="p-4 bg-blue-600 text-white rounded-[20px] hover:bg-white hover:text-slate-950 transition-all shadow-xl border-b-4 border-blue-800 active:translate-y-1">
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="py-32 text-center space-y-4">
            <Loader2 className="w-14 h-14 text-blue-600 animate-spin mx-auto opacity-20" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse italic">Processando dados...</p>
          </div>
        ) : dados && (
          <div className="space-y-8">

            {/* Resumo rápido */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              <MiniCard label="Total na Base" value={dados.total} icon={<Users className="w-5 h-5" />} bg="bg-slate-950 text-white" />
              <MiniCard label="Na Fila" value={dados.fila} icon={<Rocket className="w-5 h-5 text-blue-400" />} bg="bg-blue-50 text-blue-700" />
              <MiniCard label="Em Andamento" value={dados.emAndamento} icon={<Zap className="w-5 h-5 text-orange-500" />} bg="bg-orange-50 text-orange-700" />
              <MiniCard label="Concluídos" value={dados.concluidos} icon={<CheckCircle2 className="w-5 h-5 text-green-600" />} bg="bg-green-50 text-green-700" />
              <MiniCard label="Sem Abordagem" value={dados.semAbordagem} icon={<AlertCircle className="w-5 h-5 text-slate-400" />} bg="bg-slate-50 text-slate-600" />
            </div>

            {/* Canais de Contato */}
            <Section title="📡 Cobertura de Canais de Contato" subtitle={`De ${dados.total} médicos cadastrados, quantos têm cada canal`}>
              <div className="space-y-4">
                <CanalBar icon={<Phone className="w-4 h-4 text-green-600" />} label="WhatsApp" value={dados.temWhatsapp} total={dados.total} color="bg-green-500" />
                <CanalBar icon={<Mail className="w-4 h-4 text-slate-600" />} label="E-mail" value={dados.temEmail} total={dados.total} color="bg-slate-500" />
                <CanalBar icon={<Camera className="w-4 h-4 text-pink-600" />} label="Instagram" value={dados.temInstagram} total={dados.total} color="bg-pink-500" />
                <CanalBar icon={<Link2 className="w-4 h-4 text-blue-600" />} label="LinkedIn" value={dados.temLinkedin} total={dados.total} color="bg-blue-500" />
                <CanalBar icon={<Globe className="w-4 h-4 text-indigo-600" />} label="Website" value={dados.temWebsite} total={dados.total} color="bg-indigo-500" />
              </div>
              <div className="mt-6 p-5 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] italic text-center">
                  Canal com melhor cobertura: <span className="text-slate-900">
                    {[
                      { n: 'WhatsApp', v: dados.temWhatsapp },
                      { n: 'E-mail', v: dados.temEmail },
                      { n: 'Instagram', v: dados.temInstagram },
                      { n: 'LinkedIn', v: dados.temLinkedin },
                    ].sort((a, b) => b.v - a.v)[0].n}
                  </span> — melhor ponto de entrada para abordagem
                </p>
              </div>
            </Section>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Especialidades */}
              <Section title="🩺 Top Especialidades" subtitle="Especialidades mais representadas na base">
                {dados.especialidades.length === 0 ? (
                  <p className="text-sm font-bold text-slate-300 italic text-center py-4">Nenhuma especialidade cadastrada</p>
                ) : dados.especialidades.map((esp) => (
                  <div key={esp.nome} className="space-y-1.5 mb-3">
                    <div className="flex justify-between">
                      <span className="text-[11px] font-black text-slate-700 uppercase tracking-widest italic truncate max-w-[200px]">{esp.nome}</span>
                      <span className="text-[11px] font-black text-slate-400 italic">{esp.total} ({Math.round((esp.total / maxEsp) * 100)}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600 rounded-full transition-all duration-700" style={{ width: `${Math.round((esp.total / maxEsp) * 100)}%` }}></div>
                    </div>
                  </div>
                ))}
              </Section>

              {/* Volumetria */}
              <Section title="📈 Crescimento (Volume / Mês)" subtitle="Quantos leads foram importados/criados por mês">
                {dados.volumeMeses.length === 0 ? (
                  <p className="text-sm font-bold text-slate-300 italic text-center py-4">Nenhum histórico de volumetria</p>
                ) : (
                  <div className="space-y-4">
                    {dados.volumeMeses.map((v) => {
                      const maxVol = Math.max(...dados.volumeMeses.map(x => x.total));
                      return (
                        <div key={v.mes} className="space-y-1.5 mb-4 group">
                          <div className="flex justify-between items-end">
                            <span className="text-[11px] font-black text-slate-700 uppercase tracking-widest italic">{v.mes}</span>
                            <span className="text-md font-black text-blue-600 italic font-mono tracking-tighter">{v.total} <span className="text-[9px] text-slate-400 font-sans tracking-tight">LEADS</span></span>
                          </div>
                          <div className="w-full bg-slate-50 h-3.5 rounded-full overflow-hidden border border-slate-100 p-0.5">
                            <div className="h-full bg-blue-600 rounded-full transition-all duration-1000 group-hover:bg-blue-500" style={{ width: `${Math.round((v.total / (maxVol || 1)) * 100)}%` }}></div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </Section>
            </div>

          </div>
        )}
      </div>
    </Layout>
  );
};

// Componentes auxiliares
const MiniCard = ({ label, value, icon, bg }: any) => (
  <div className={`${bg} p-5 rounded-[28px] shadow-xl border border-white/10 flex flex-col gap-2`}>
    <div className="flex items-center gap-2 opacity-70">{icon}<span className="text-[9px] font-black uppercase tracking-widest italic">{label}</span></div>
    <p className="text-4xl font-black italic leading-none">{value}</p>
  </div>
);

const CanalBar = ({ icon, label, value, total, color }: any) => {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-[11px] font-black text-slate-700 uppercase tracking-widest italic">{label}</span>
        </div>
        <span className="text-[11px] font-black text-slate-500 italic">{value} <span className="text-slate-300">/ {total}</span> <span className="text-slate-400 ml-1">({pct}%)</span></span>
      </div>
      <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden border border-slate-200">
        <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }}></div>
      </div>
    </div>
  );
};

const Section = ({ title, subtitle, children }: any) => (
  <div className="bg-white p-7 md:p-10 rounded-[36px] shadow-2xl shadow-slate-200/10 border border-slate-50 space-y-5">
    <div className="border-l-4 border-blue-600 pl-4">
      <h2 className="text-xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">{title}</h2>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 italic">{subtitle}</p>
    </div>
    {children}
  </div>
);

export default Relatorios;
