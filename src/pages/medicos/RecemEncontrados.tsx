import React, { useState, useEffect, useMemo } from 'react';
import type { Medico } from '../../types/medico';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import { toast } from '../../components/Toast';
import { Zap, History, Loader2, RefreshCw, Play, CheckCircle2, AlertTriangle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

// Modal de Confirmação reutilizável
const ConfirmModal = ({ open, title, message, onConfirm, onCancel }: {
  open: boolean; title: string; message: string;
  onConfirm: () => void; onCancel: () => void;
}) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={onCancel}></div>
      <div className="relative z-10 bg-white rounded-[36px] p-8 md:p-12 shadow-2xl max-w-md w-full border-2 border-slate-50 animate-in zoom-in-95 duration-200">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-orange-500" />
          </div>
          <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter italic leading-none">{title}</h3>
          <p className="text-sm font-bold text-slate-400 leading-relaxed">{message}</p>
          <div className="flex gap-4 w-full pt-2">
            <button onClick={onCancel}
              className="flex-1 py-5 bg-slate-100 text-slate-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all italic">
              Cancelar
            </button>
            <button onClick={onConfirm}
              className="flex-1 py-5 bg-slate-950 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all border-b-4 border-slate-800 active:border-b-0 active:translate-y-1 italic">
              Confirmar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const RecemEncontrados: React.FC = () => {
  const [medicos, setMedicos] = useState<Medico[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroProcesso, setFiltroProcesso] = useState('pronto');

  // Estado do modal de confirmação
  const [confirmacao, setConfirmacao] = useState<{
    open: boolean; medicoId: number | null; medicoNome: string;
    novoStatus: string; titulo: string; mensagem: string;
  }>({ open: false, medicoId: null, medicoNome: '', novoStatus: '', titulo: '', mensagem: '' });

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('medicos').select('*')
        .in('status_atual', ['pronto', 'abordando', 'concluido'])
        .order('id', { ascending: false });
      if (error) throw error;
      setMedicos(data || []);
    } catch (err: any) {
      toast.error(`Erro ao carregar esteira: ${err.message || 'verifique a conexão.'}`);
    } finally { setLoading(false); }
  };

  useEffect(() => {
    fetchLeads();
    // Pedir permissão de notificação ao entrar na tela
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const solicitarMudanca = (medico: any, novoStatus: string) => {
    const mensagens: Record<string, { titulo: string; mensagem: string }> = {
      abordando: {
        titulo: 'Iniciar Contato?',
        mensagem: `Confirma que o contato com Dr(a). ${medico.nome} foi iniciado?`,
      },
      concluido: {
        titulo: 'Concluir Contato?',
        mensagem: `Tem certeza que o processo com Dr(a). ${medico.nome} foi concluído? Ele sairá da fila ativa.`,
      },
      pronto: {
        titulo: 'Retroceder Etapa?',
        mensagem: `Isso vai mover Dr(a). ${medico.nome} de volta para "Não Iniciado".`,
      },
    };
    const info = mensagens[novoStatus] || { titulo: 'Confirmar?', mensagem: 'Deseja mudar o status?' };
    setConfirmacao({ open: true, medicoId: medico.id, medicoNome: medico.nome, novoStatus, ...info });
  };

  const confirmarMudanca = async () => {
    if (!confirmacao.medicoId) return;
    setConfirmacao(prev => ({ ...prev, open: false }));
    try {
      // Rastrear usuário logado
      const { data: { user } } = await supabase.auth.getUser();
      const abordadoPor = user?.email || 'Equipe GVP';

      const { error } = await supabase.from('medicos').update({
        status_atual: confirmacao.novoStatus,
        abordado_por: abordadoPor,
      }).eq('id', confirmacao.medicoId);

      if (error) throw error;

      setMedicos(prev => prev.map(m =>
        m.id === confirmacao.medicoId
          ? { ...m, status_atual: confirmacao.novoStatus as Medico['status_atual'] }
          : m
      ));

      const labels: Record<string, string> = { abordando: 'Em Andamento', concluido: 'Concluído', pronto: 'Não Iniciado' };
      toast.success(`${confirmacao.medicoNome} → ${labels[confirmacao.novoStatus]}`);
    } catch {
      toast.error('Erro ao atualizar status.');
    }
  };

  const filtrados = useMemo(() => medicos.filter(m => m.status_atual === filtroProcesso), [medicos, filtroProcesso]);

  const getStatusLabel = (s: string) => ({ pronto: 'Não Iniciado', abordando: 'Em Andamento', concluido: 'Concluído' }[s] || s);

  const contadores = useMemo(() => ({
    pronto: medicos.filter(m => m.status_atual === 'pronto').length,
    abordando: medicos.filter(m => m.status_atual === 'abordando').length,
    concluido: medicos.filter(m => m.status_atual === 'concluido').length,
  }), [medicos]);

  return (
    <Layout>
      <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-24 text-slate-900">

        {/* Modal de Confirmação */}
        <ConfirmModal
          open={confirmacao.open}
          title={confirmacao.titulo}
          message={confirmacao.mensagem}
          onConfirm={confirmarMudanca}
          onCancel={() => setConfirmacao(prev => ({ ...prev, open: false }))}
        />

        {/* Header */}
        <div className="bg-slate-950 text-white p-6 md:p-12 rounded-[40px] shadow-2xl relative overflow-hidden border-b-6 border-blue-600">
           <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-[100px] -mr-40 -mt-40 animate-pulse"></div>
           <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="space-y-2 text-center md:text-left">
                 <div className="flex items-center justify-center md:justify-start gap-4">
                    <div className="p-3 bg-blue-600 rounded-2xl shadow-xl"><Zap className="w-7 h-7 fill-white" /></div>
                    <h1 className="text-3xl md:text-4xl font-black tracking-tighter uppercase leading-none italic underline decoration-blue-500">Esteira Tática</h1>
                 </div>
                 <p className="text-blue-500 font-black uppercase text-[9px] tracking-[0.4em] italic">Pipeline de Abordagem GVP</p>
              </div>
              <button onClick={fetchLeads}
                className="p-5 bg-white/5 border-2 border-white/10 rounded-[28px] text-blue-400 hover:bg-white hover:text-slate-950 transition-all">
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
           </div>
        </div>

        {/* Filtros com contadores */}
        <div className="grid grid-cols-3 gap-3 bg-white p-2.5 rounded-[32px] shadow-2xl border border-slate-50">
          {([
            { key: 'pronto', label: 'Não Iniciado', active: 'bg-slate-950 text-white shadow-xl' },
            { key: 'abordando', label: 'Em Andamento', active: 'bg-orange-500 text-white shadow-xl shadow-orange-500/20' },
            { key: 'concluido', label: 'Concluído', active: 'bg-green-600 text-white shadow-xl shadow-green-500/20' },
          ] as const).map(({ key, label, active }) => (
            <button key={key} onClick={() => setFiltroProcesso(key)}
              className={`relative p-5 rounded-[24px] font-black text-[10px] uppercase tracking-[0.2em] flex flex-col items-center justify-center gap-1 transition-all min-h-[70px] ${filtroProcesso === key ? active : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}>
              <span>{label}</span>
              <span className={`text-2xl font-black leading-none italic ${filtroProcesso === key ? 'text-white' : 'text-slate-300'}`}>{contadores[key]}</span>
            </button>
          ))}
        </div>

        {/* Lista */}
        <div className="grid grid-cols-1 gap-5">
          {loading ? (
            <div className="py-32 text-center space-y-4">
              <Loader2 className="w-14 h-14 text-blue-600 animate-spin mx-auto opacity-20" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse italic">Carregando pipeline...</p>
            </div>
          ) : filtrados.length > 0 ? filtrados.map(m => (
            <div key={m.id} className="bg-white rounded-[28px] md:rounded-[40px] p-6 md:p-8 shadow-2xl shadow-slate-200/20 border border-slate-50 flex flex-col lg:flex-row items-center gap-8 hover:border-blue-400 transition-all group">

              <div className="flex flex-col sm:flex-row items-center gap-6 flex-1 min-w-0 w-full text-center sm:text-left">
                <div className="w-16 h-16 bg-slate-950 text-white rounded-[24px] flex items-center justify-center font-black text-2xl shrink-0 shadow-xl">
                  {m.nome.charAt(0)}
                </div>
                <div className="space-y-1.5 flex-1 min-w-0">
                  <p className={`text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full inline-block ${filtroProcesso === 'pronto' ? 'bg-slate-100 text-slate-500' : filtroProcesso === 'abordando' ? 'bg-orange-50 text-orange-500' : 'bg-green-50 text-green-600'}`}>
                    {getStatusLabel(m.status_atual)}
                  </p>
                  <Link to={`/medicos/${m.id}`} className="block hover:text-blue-600 transition-colors">
                    <h3 className="text-xl md:text-2xl font-black text-slate-950 tracking-tighter uppercase leading-none italic">{m.nome}</h3>
                  </Link>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-[11px] font-bold text-slate-400 italic uppercase tracking-widest">
                    <span>{m.especialidade || 'Clínica Geral'}</span>
                    {m.responsavel_nome && <><span className="w-1 h-1 bg-slate-200 rounded-full"></span><span>Resp: {m.responsavel_nome}</span></>}
                    {m.abordado_por && <><span className="w-1 h-1 bg-slate-200 rounded-full"></span><span className="text-blue-400">Abordado por: {m.abordado_por}</span></>}
                  </div>
                </div>
              </div>

              {/* Ações com confirmação */}
              <div className="w-full lg:w-[320px] flex gap-3 pt-5 lg:pt-0 lg:pl-8 border-t lg:border-t-0 lg:border-l border-slate-100">
                {m.status_atual === 'pronto' && (
                  <button onClick={() => solicitarMudanca(m, 'abordando')}
                    className="flex-1 py-6 bg-slate-950 text-white rounded-[24px] font-black text-[11px] uppercase tracking-[0.2em] shadow-xl hover:bg-blue-600 transition-all border-b-4 border-slate-800 active:border-b-0 active:translate-y-1 flex items-center justify-center gap-3 italic">
                    <Play className="w-4 h-4 fill-white" /> Iniciar Contato
                  </button>
                )}
                {m.status_atual === 'abordando' && (
                  <div className="flex flex-col w-full gap-2">
                    <button onClick={() => solicitarMudanca(m, 'concluido')}
                      className="w-full py-6 bg-orange-500 text-white rounded-[24px] font-black text-[11px] uppercase tracking-[0.2em] shadow-xl border-b-4 border-orange-700 active:border-b-0 active:translate-y-1 flex items-center justify-center gap-3 italic">
                      <CheckCircle2 className="w-5 h-5" /> Concluir Contato
                    </button>
                    <button onClick={() => solicitarMudanca(m, 'pronto')}
                      className="text-[9px] font-black text-slate-300 uppercase hover:text-slate-900 transition-all italic underline decoration-slate-100">
                      Retroceder Etapa
                    </button>
                  </div>
                )}
                {m.status_atual === 'concluido' && (
                  <div className="flex flex-col w-full gap-2">
                    <div className="p-5 bg-green-50 text-green-600 rounded-[24px] border-2 border-green-100 flex items-center justify-center gap-3 font-black text-[10px] uppercase tracking-widest italic h-[65px]">
                      <CheckCircle2 className="w-5 h-5" /> Finalizado
                    </div>
                    <button onClick={() => solicitarMudanca(m, 'abordando')}
                      className="text-[9px] font-black text-slate-300 uppercase hover:text-slate-900 transition-all italic underline decoration-slate-100">
                      Reativar Contato
                    </button>
                  </div>
                )}
              </div>
            </div>
          )) : (
            <div className="py-40 text-center bg-white rounded-[60px] border-4 border-dashed border-slate-100 opacity-40">
              <History className="w-16 h-16 text-slate-200 mx-auto mb-6" />
              <h2 className="text-2xl font-black text-slate-200 uppercase italic mb-2">Pipeline Vazio</h2>
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] italic">Nenhum médico nesta etapa.</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default RecemEncontrados;
