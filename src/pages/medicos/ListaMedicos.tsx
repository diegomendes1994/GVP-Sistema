import React, { useState, useEffect, useMemo } from 'react'; // GVP Production Build v3.6.2
import type { Medico } from '../../types/medico';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import Badge from '../../components/Badge';
import { 
  Search, 
  Plus, 
  Download, 
  Edit3,
  Loader2,
  AlertCircle,
  Database,
  Stethoscope,
  User as UserIcon,
  Zap,
  CheckCircle2,
  Trash2
} from 'lucide-react';
import ImportExcelModal from '../../components/ImportExcelModal';
import { toast } from '../../components/Toast';
import { supabase } from '../../lib/supabase';

const ListaMedicos: React.FC = () => {
  const navigate = useNavigate();
  const [showImportModal, setShowImportModal] = useState(false);
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [filtroEspecialidade, setFiltroEspecialidade] = useState('todas');
  const [filtroResponsavel, setFiltroResponsavel] = useState('todos');
  const [medicos, setMedicos] = useState<Medico[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingId, setSendingId] = useState<number | null>(null);
  const [showClearModal, setShowClearModal] = useState(false);
  const [clearConfirmText, setClearConfirmText] = useState('');
  const [clearing, setClearing] = useState(false);

  const [meuNome] = useState(localStorage.getItem('gvp_me') || '');

  const fetchMedicos = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('medicos')
        .select('*')
        .order('nome', { ascending: true });
      
      if (error) throw error;
      setMedicos(data || []);
    } catch (err) {
      console.error('Erro ao buscar médicos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicos();
  }, []);

  const handleImport = async (data: any[]) => {
    setLoading(true);
    try {
      const { error } = await supabase.from('medicos').insert(data);
      if (error) throw error;
      toast.success(`${data.length} dados importados com sucesso!`);
      fetchMedicos();
      setShowImportModal(false);
    } catch (err: any) {
      console.error('ERRO SUPABASE: ', err);
      toast.error(err.message || 'Erro ao importar Excel. Verifique o console.');
    } finally {
      setLoading(false);
    }
  };

  const enviarParaFila = async (id: number) => {
    setSendingId(id);
    try {
       // Atualiza apenas o status — o Supabase gerencia o updated_at automaticamente
       const { error } = await supabase
         .from('medicos')
         .update({ status_atual: 'pronto' })
         .eq('id', id);
       
       if (error) throw error;
       
       setMedicos(prev => prev.map(m => m.id === id ? { ...m, status_atual: 'pronto' as const } : m));
       toast.success('Médico enviado para a Esteira de Abordagem!');
       setTimeout(() => {
         setSendingId(null);
         navigate('/recem-encontrados');
       }, 900);
    } catch (err: any) {
       toast.error(`Erro: ${err.message || 'Tente novamente.'}`);
       setSendingId(null);
    }
  };

  const deleteMedico = async (id: number, nome: string) => {
    if (!window.confirm(`Apagar Dr(a). ${nome} permanentemente?`)) return;
    try {
      const { error } = await supabase.from('medicos').delete().eq('id', id);
      if (error) throw error;
      setMedicos(prev => prev.filter(m => m.id !== id));
      toast.success(`${nome} removido(a) da base.`);
    } catch (err: any) {
      toast.error(`Erro ao apagar: ${err.message}`);
    }
  };

  const limparTodaBase = async () => {
    if (clearConfirmText !== 'CONFIRMAR') {
      toast.error('Digite CONFIRMAR para prosseguir.');
      return;
    }
    setClearing(true);
    try {
      const { error } = await supabase.from('medicos').delete().gte('id', 0);
      if (error) throw error;
      setMedicos([]);
      setShowClearModal(false);
      setClearConfirmText('');
      toast.success('Base limpa com sucesso!');
    } catch (err: any) {
      toast.error(`Erro ao limpar: ${err.message}`);
    } finally { setClearing(false); }
  };

  const especialidades = useMemo(() => {
    const esps = Array.from(new Set(medicos.map(m => m.especialidade).filter(Boolean)));
    return ['todas', ...esps];
  }, [medicos]);

  const responsaveis = useMemo(() => {
    const resps = Array.from(new Set(medicos.map(m => m.responsavel_nome).filter(Boolean)));
    return ['todos', ...resps];
  }, [medicos]);

  const filtrados = useMemo(() => {
    return medicos.filter(m => {
      const matchBusca = m.nome.toLowerCase().includes(busca.toLowerCase()) || 
                         (m.especialidade && m.especialidade.toLowerCase().includes(busca.toLowerCase()));
      const matchStatus = filtroStatus === 'todos' || m.status_atual === filtroStatus;
      const matchEspecialidade = filtroEspecialidade === 'todas' || m.especialidade === filtroEspecialidade;
      const matchResponsavel = filtroResponsavel === 'todos' || m.responsavel_nome === filtroResponsavel;
      return matchBusca && matchStatus && matchEspecialidade && matchResponsavel;
    });
  }, [medicos, busca, filtroStatus, filtroEspecialidade, filtroResponsavel]);

  return (
    <Layout>
      <div className="space-y-6 md:space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-24 text-slate-900">
        
        {/* Header Central de Dados v3.6.2 */}
        {/* Modal de Confirmação — Limpar Base */}
        {showClearModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => { setShowClearModal(false); setClearConfirmText(''); }}></div>
            <div className="relative z-10 bg-white rounded-[36px] p-8 md:p-12 shadow-2xl max-w-md w-full border-2 border-red-100 animate-in zoom-in-95 duration-200">
              <div className="flex flex-col items-center text-center space-y-5">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                  <Trash2 className="w-10 h-10 text-red-600" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter italic">Ação Irreversível</h3>
                <p className="text-sm font-bold text-slate-400 leading-relaxed">
                  Isso vai <span className="text-red-600 font-black">apagar TODOS os {medicos.length} médicos</span> da base permanentemente. Não há como desfazer.
                </p>
                <div className="w-full space-y-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Digite <span className="text-red-600">CONFIRMAR</span> para prosseguir:</p>
                  <input
                    value={clearConfirmText}
                    onChange={e => setClearConfirmText(e.target.value)}
                    placeholder="CONFIRMAR"
                    className="w-full border-2 border-slate-100 focus:border-red-400 px-5 py-4 rounded-2xl font-black text-center text-sm focus:outline-none transition-all"
                  />
                </div>
                <div className="flex gap-4 w-full">
                  <button onClick={() => { setShowClearModal(false); setClearConfirmText(''); }}
                    className="flex-1 py-5 bg-slate-100 text-slate-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all italic">
                    Cancelar
                  </button>
                  <button onClick={limparTodaBase} disabled={clearing || clearConfirmText !== 'CONFIRMAR'}
                    className="flex-1 py-5 bg-red-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-700 transition-all border-b-4 border-red-800 active:border-b-0 active:translate-y-1 disabled:opacity-30 italic flex items-center justify-center gap-2">
                    {clearing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    Apagar Tudo
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 bg-slate-950 text-white p-6 md:p-12 rounded-[40px] md:rounded-[50px] shadow-2xl relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-[100px] -mr-32 -mt-32"></div>
           
           <div className="relative z-10 space-y-2 text-center lg:text-left">
              <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight leading-none">Banco de Informações</h1>
              <div className="flex items-center justify-center lg:justify-start gap-4">
                 <div className="w-2 h-2 bg-blue-400 rounded-full shadow-lg shadow-blue-400/50"></div>
                 <p className="text-slate-400 font-medium text-xs tracking-wide leading-none">Gestão de Médicos GVP</p>
              </div>
           </div>

            <div className="flex flex-col sm:flex-row flex-wrap w-full lg:w-auto gap-4 relative z-10">
               <button onClick={() => setShowClearModal(true)}
                 className="flex-1 lg:flex-none flex items-center justify-center gap-3 px-6 py-4 bg-red-600/10 border border-red-500/20 text-red-400 rounded-[18px] font-semibold text-xs hover:bg-red-600 hover:text-white transition-all">
                 <Trash2 className="w-4 h-4" /> Limpar Base
               </button>
               <button onClick={() => setShowImportModal(true)}
                 className="flex-1 lg:flex-none flex items-center justify-center gap-3 px-6 py-4 bg-white/5 border border-white/10 text-white rounded-[18px] font-semibold text-xs hover:bg-white hover:text-slate-950 transition-all">
                 <Download className="w-4 h-4" /> Importar Base
               </button>
               <button onClick={() => navigate('/medicos/novo')}
                 className="flex-1 lg:flex-none flex items-center justify-center gap-3 px-8 py-4 bg-blue-600 text-white rounded-[18px] font-semibold text-sm shadow-lg hover:bg-blue-700 transition-all">
                 <Plus className="w-5 h-5" /> Adicionar Médico
               </button>
            </div>
         </div>

        {/* Filtros Master */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
           <div className="md:col-span-2 relative group">
              <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500">
                 <Search className="w-5 h-5" />
              </div>
              <input 
                type="text" 
                placeholder="Pesquisar por nome..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full bg-white text-slate-900 border-2 border-slate-100 pl-14 pr-6 py-4 rounded-[20px] focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium text-sm h-full min-h-[55px]"
              />
           </div>
           
           <div className="relative">
              <select 
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value)}
                className="w-full bg-white text-slate-700 border-2 border-slate-100 px-6 py-4 rounded-[20px] focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-semibold text-xs h-full min-h-[55px]"
              >
                 <option value="todos">Status: Todos</option>
                 <option value="bruto">Bruto</option>
                 <option value="novo">Novo</option>
                 <option value="enriquecendo">Enriquecendo...</option>
                 <option value="pronto">Pronto p/ Abordagem</option>
                 <option value="abordando">Em Abordagem</option>
                 <option value="agendado">Reunião Agendada</option>
                 <option value="concluido">Convertido (GVP)</option>
                 <option value="impossivel">Sem Contato</option>
                 <option value="arquivado">Arquivado</option>
              </select>
           </div>
           
           <div className="relative">
              <select 
                value={filtroEspecialidade}
                onChange={(e) => setFiltroEspecialidade(e.target.value)}
                className="w-full bg-white text-slate-700 border-2 border-slate-100 px-6 py-4 rounded-[20px] focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-semibold text-xs h-full min-h-[55px]"
              >
                 <option value="todas">Especialidade: Todas</option>
                 {especialidades.map(esp => esp !== 'todas' && <option key={String(esp)} value={String(esp)}>{String(esp)}</option>)}
              </select>
           </div>

           <div className="relative">
              <select 
                value={filtroResponsavel}
                onChange={(e) => setFiltroResponsavel(e.target.value)}
                className="w-full bg-white text-slate-700 border-2 border-slate-100 px-6 py-4 rounded-[20px] focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-semibold text-xs h-full min-h-[55px]"
              >
                 <option value="todos">Responsável: Todos</option>
                 {responsaveis.map(resp => resp !== 'todos' && <option key={String(resp)} value={String(resp)}>{String(resp)}</option>)}
              </select>
           </div>
        </div>

        {/* Listagem GVP v3.6.2 */}
        <div className="grid grid-cols-1 gap-6">
           {loading ? (
              <div className="py-32 text-center space-y-6">
                 <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto opacity-20" />
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse italic leading-none">Sincronizando Base GVP...</p>
              </div>
           ) : filtrados.length > 0 ? filtrados.map((m) => (
              <div key={m.id} className="bg-white rounded-[32px] md:rounded-[40px] p-6 md:p-8 shadow-2xl shadow-slate-200/20 border border-slate-50 flex flex-col md:flex-row items-center gap-8 md:gap-10 hover:border-blue-400 transition-all group relative overflow-hidden">
                 
                 <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 flex-1 min-w-0 w-full text-center sm:text-left">
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-blue-600 text-white rounded-[16px] md:rounded-[20px] flex items-center justify-center font-bold text-xl md:text-2xl shrink-0 shadow-lg border-2 border-blue-500">
                       {m.nome.charAt(0)}
                    </div>
                    <div className="space-y-2 flex-1 min-w-0 w-full">
                       <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3">
                          <h4 className="text-lg md:text-xl font-bold text-slate-900 tracking-tight leading-tight line-clamp-2 break-words">{m.nome}</h4>
                          <Badge text={m.status_atual} />
                       </div>
                       <div className="flex flex-wrap justify-center sm:justify-start gap-2 pt-1">
                          <span className="text-xs font-semibold text-slate-500 bg-slate-50 px-3 py-1 rounded-lg flex items-center gap-1.5 border border-slate-200">
                             <Stethoscope className="w-3.5 h-3.5 text-blue-500" /> {m.especialidade || 'Clínica Geral'}
                          </span>
                          {m.responsavel_nome && (
                             <span className={`px-3 py-1 text-xs font-semibold rounded-lg flex items-center gap-1.5 border ${m.responsavel_nome === meuNome ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                                <UserIcon className="w-3.5 h-3.5" /> {m.responsavel_nome}
                             </span>
                          )}
                       </div>
                    </div>
                 </div>

                 {/* Tactical Actions v3.6.2 */}
                 <div className="flex gap-3 w-full md:w-auto shrink-0 relative z-10">
                    {/* Botão ENVIAR FILA - Destino: Esteira de Abordagem (Status 'pronto') */}
                    {m.status_atual !== 'pronto' && m.status_atual !== 'abordando' && m.status_atual !== 'concluido' ? (
                       <button 
                         disabled={sendingId === m.id}
                         onClick={() => enviarParaFila(m.id)}
                                                   className={`flex-1 md:flex-none px-8 py-5 md:px-10 md:py-6 rounded-[24px] shadow-2xl transition-all flex items-center justify-center gap-4 group/btn border-b-8 active:border-b-0 active:translate-y-2 ${sendingId === m.id ? 'bg-green-600 text-white border-green-800' : 'bg-orange-600 text-white border-orange-800 hover:bg-orange-700'}`}
                       >
                          {sendingId === m.id ? (
                             <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-5 h-5 animate-bounce" />
                                <span className="text-[11px] font-black uppercase tracking-[0.2em] italic">Enviado!</span>
                             </div>
                          ) : (
                             <>
                                <Zap className="w-5 h-5 fill-white" />
                                <span className="text-[11px] font-black uppercase tracking-[0.2em] italic">Enviar Fila</span>
                             </>
                          )}
                       </button>
                    ) : (
                       <div className="px-8 py-5 bg-slate-50 rounded-[28px] border-2 border-slate-100 flex items-center gap-3 opacity-50 grayscale scale-95 cursor-default">
                          <CheckCircle2 className="w-5 h-5 text-slate-400" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Na Esteira GVP</span>
                       </div>
                    )}
                    
                    <button 
                      onClick={() => navigate(`/medicos/${m.id}`)}
                      className="p-5 md:p-6 bg-blue-50 text-blue-600 rounded-[24px] hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center shadow-xl border border-blue-100"
                    >
                       <Database className="w-6 h-6" />
                    </button>
                    <button 
                      onClick={() => navigate(`/medicos/editar/${m.id}`)}
                      className="p-5 md:p-6 bg-slate-950 text-white rounded-[24px] hover:bg-blue-600 transition-all flex items-center justify-center shadow-2xl border-b-8 border-slate-900 active:border-b-0 active:translate-y-2"
                    >
                       <Edit3 className="w-6 h-6" />
                    </button>
                    <button 
                      onClick={() => deleteMedico(m.id, m.nome)}
                      className="p-5 md:p-6 bg-red-50 text-red-400 rounded-[24px] hover:bg-red-600 hover:text-white transition-all flex items-center justify-center shadow-xl border border-red-100"
                      title="Apagar médico"
                    >
                       <Trash2 className="w-5 h-5" />
                    </button>
                 </div>
              </div>
           )) : (
              <div className="py-32 md:py-48 text-center bg-white rounded-[60px] border-4 border-dashed border-slate-100 grayscale opacity-40 mx-2">
                 <AlertCircle className="w-16 h-16 mx-auto text-slate-200 mb-6" />
                 <h3 className="text-2xl font-black text-slate-300 uppercase tracking-tighter italic">Base de Dados Vazia</h3>
                 <p className="text-[10px] font-black text-slate-200 uppercase tracking-widest mt-2 italic">Aguardando novos alvos médicos...</p>
              </div>
           )}
        </div>
      </div>

      <ImportExcelModal 
        isOpen={showImportModal} 
        onClose={() => setShowImportModal(false)}
        onImport={handleImport}
      />
    </Layout>
  );
};

export default ListaMedicos;
