import React, { useState, useEffect } from 'react';
import type { Medico } from '../../types/medico';
import { CAMPOS_COMPLETUDE } from '../../types/medico';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import Badge from '../../components/Badge';
import { toast } from '../../components/Toast';
import { 
  Phone, Stethoscope, Edit3, CheckCircle2, Loader2,
  MessageCircle, Camera, Globe, Link2, MapPin, Building2,
  Mail, User, ExternalLink, ChevronLeft, XCircle, Zap,
  Share2, FileText, Trash2
} from 'lucide-react';
import { supabase } from '../../lib/supabase';



const DetalhesMedico: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [medico, setMedico] = useState<Medico | null>(null);
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase.from('medicos').select('*').eq('id', id).single();
        if (error) throw error;
        setMedico(data);
      } catch {
        toast.error('Erro ao carregar ficha.');
      } finally { setLoading(false); }
    })();
  }, [id]);

  const enviarParaFila = async () => {
    if (!medico) return;
    setEnviando(true);
    try {
      const { error } = await supabase.from('medicos')
        .update({ status_atual: 'pronto' })
        .eq('id', id);
      if (error) throw error;
      setMedico((prev: any) => ({ ...prev, status_atual: 'pronto' }));
      toast.success(`Dr(a). ${medico.nome} enviado(a) para a Esteira!`);
      setTimeout(() => navigate('/recem-encontrados'), 1200);
    } catch {
      toast.error('Erro ao enviar para a fila.');
    } finally { setEnviando(false); }
  };

  const compartilhar = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url)
      .then(() => toast.success('Link copiado para a área de transferência!'))
      .catch(() => toast.error('Não foi possível copiar o link.'));
  };

  const deleteMedico = async () => {
    if (!medico) return;
    if (!window.confirm(`Apagar Dr(a). ${medico.nome} permanentemente?`)) return;
    try {
      const { error } = await supabase.from('medicos').delete().eq('id', id);
      if (error) throw error;
      toast.success(`${medico.nome} removido(a).`);
      setTimeout(() => navigate('/medicos'), 800);
    } catch (err: any) {
      toast.error(`Erro ao apagar: ${err.message}`);
    }
  };

  if (loading) return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin opacity-20" />
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Carregando ficha...</p>
      </div>
    </Layout>
  );

  if (!medico) return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 space-y-4">
        <XCircle className="w-16 h-16 text-red-100" />
        <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Ficha não encontrada</h2>
        <button onClick={() => navigate('/medicos')} className="px-10 py-4 bg-slate-950 text-white rounded-2xl font-black text-[10px] uppercase shadow-2xl">Voltar</button>
      </div>
    </Layout>
  );

  // Completude
  const preenchidos = CAMPOS_COMPLETUDE.filter(c => medico[c] && String(medico[c]).trim() !== '').length;
  const completude = Math.round((preenchidos / CAMPOS_COMPLETUDE.length) * 100);
  const completudeCor = completude < 40 ? 'bg-red-500' : completude < 75 ? 'bg-orange-500' : 'bg-green-500';
  const completudeTxt = completude < 40 ? 'text-red-500' : completude < 75 ? 'text-orange-500' : 'text-green-600';

  const naFila = ['pronto','abordando','concluido'].includes(medico.status_atual);

  return (
    <Layout>
      <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 pb-32 space-y-6 md:space-y-8">

        {/* Navegação + Ações */}
        <div className="flex flex-wrap justify-between items-center gap-4">
          <button onClick={() => navigate('/medicos')}
            className="flex items-center gap-2 text-slate-400 hover:text-slate-900 font-black text-[10px] uppercase tracking-widest transition-all group">
            <div className="p-3 bg-white border border-slate-100 rounded-xl shadow-sm group-hover:scale-110 transition-all"><ChevronLeft className="w-4 h-4" /></div>
            Central de Dados
          </button>
          <div className="flex gap-3">
            {/* Botão Compartilhar */}
            <button onClick={compartilhar}
              className="p-4 bg-white border border-slate-100 text-slate-500 rounded-2xl hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all shadow-lg" title="Copiar link da ficha">
              <Share2 className="w-5 h-5" />
            </button>
            <button onClick={deleteMedico}
              className="p-4 bg-white border border-red-100 text-red-400 rounded-2xl hover:bg-red-600 hover:text-white hover:border-red-600 transition-all shadow-lg" title="Apagar médico">
              <Trash2 className="w-5 h-5" />
            </button>
            {/* Botão Enviar para Fila */}
            {!naFila && (
              <button onClick={enviarParaFila} disabled={enviando}
                className="flex items-center gap-3 px-6 py-4 bg-orange-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-orange-700 transition-all border-b-4 border-orange-800 active:border-b-0 active:translate-y-1 disabled:opacity-50">
                {enviando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 fill-white" />}
                Enviar para Esteira
              </button>
            )}
            {naFila && (
              <span className="flex items-center gap-2 px-5 py-4 bg-slate-100 text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-slate-200">
                <CheckCircle2 className="w-4 h-4" /> Na Esteira GVP
              </span>
            )}
            <button onClick={() => navigate(`/medicos/editar/${id}`)}
              className="flex items-center gap-3 px-6 py-4 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-2xl hover:bg-blue-700 transition-all border-b-4 border-blue-900 active:border-b-0 active:translate-y-1">
              <Edit3 className="w-4 h-4" /> Editar
            </button>
          </div>
        </div>

        {/* Barra de Completude */}
        <div className="bg-white p-5 rounded-[24px] shadow-xl border border-slate-50">
          <div className="flex justify-between items-center mb-2">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Completude da Ficha</p>
            <p className={`text-[11px] font-black uppercase italic ${completudeTxt}`}>{completude}%</p>
          </div>
          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200">
            <div className={`h-full ${completudeCor} rounded-full transition-all duration-700`} style={{ width: `${completude}%` }}></div>
          </div>
          {completude < 100 && (
            <button onClick={() => navigate(`/medicos/editar/${id}`)} className="text-[9px] font-black text-blue-500 uppercase tracking-widest mt-2 hover:underline italic">
              + Completar ficha
            </button>
          )}
        </div>

        {/* Hero */}
        <div className="bg-slate-950 text-white rounded-[32px] md:rounded-[48px] p-8 md:p-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] -mr-48 -mt-48"></div>
          <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8 text-center lg:text-left">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-[28px] bg-white text-slate-950 flex items-center justify-center font-black text-4xl md:text-5xl shadow-2xl shrink-0">
              {medico.nome.charAt(0)}
            </div>
            <div className="space-y-4 flex-1 min-w-0">
              <div className="flex flex-wrap justify-center lg:justify-start gap-3">
                <Badge text={medico.status_atual} />
                {medico.cns && <span className="px-4 py-2 bg-white/10 text-white/60 text-[8px] font-black uppercase tracking-widest rounded-xl border border-white/5">CRM: {medico.cns}</span>}
                {medico.responsavel_nome && <span className="px-4 py-2 bg-blue-600/20 text-blue-400 text-[8px] font-black uppercase tracking-widest rounded-xl border border-blue-600/20 flex items-center gap-1.5"><User className="w-3 h-3" />{medico.responsavel_nome}</span>}
              </div>
              <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase leading-none italic">{medico.nome}</h1>
              <div className="flex flex-wrap justify-center lg:justify-start gap-6 pt-4 border-t border-white/5">
                <div className="flex items-center gap-3 text-blue-400">
                  <Stethoscope className="w-5 h-5" />
                  <p className="text-xl font-black uppercase text-white">{medico.especialidade || 'Clínica Geral'}</p>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className={`w-5 h-5 ${medico.sus === 'Sim' ? 'text-green-500' : 'text-slate-700'}`} />
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">SUS: <span className="text-white">{medico.sus}</span></p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Canais */}
        <div className="space-y-4">
          <h2 className="text-xl font-black text-slate-900 tracking-tighter uppercase leading-none px-2 border-l-4 border-blue-600 ml-2 italic">Canais de Contato</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <DataItem icon={MessageCircle} label="WhatsApp" value={medico.telefone} color="bg-green-600"
              link={medico.telefone ? `https://wa.me/55${medico.telefone.replace(/\D/g,'')}` : null} />
            <DataItem icon={Mail} label="E-mail" value={medico.email} color="bg-slate-700"
              link={medico.email ? `mailto:${medico.email}` : null} />
            <DataItem icon={Camera} label="Instagram" value={medico.instagram ? `@${medico.instagram.replace('@','')}` : null} color="bg-pink-600"
              link={medico.instagram ? `https://instagram.com/${medico.instagram.replace('@','')}` : null} />
            <DataItem icon={Link2} label="LinkedIn" value={medico.linkedin ? 'Ver Perfil' : null} color="bg-blue-600"
              link={medico.linkedin} />
            <DataItem icon={Globe} label="Website" value={medico.website} color="bg-indigo-600"
              link={medico.website ? (medico.website.startsWith('http') ? medico.website : `https://${medico.website}`) : null} />
            <DataItem icon={User} label="Vínculo" value={medico.vinculo} color="bg-slate-500" />
          </div>
        </div>

        {/* Estrutura */}
        <div className="bg-white p-7 md:p-10 rounded-[32px] border border-slate-100 shadow-xl">
          <h3 className="text-lg font-black text-slate-900 tracking-tighter uppercase mb-6 italic border-l-4 border-blue-600 pl-3">Estrutura da Clínica</h3>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="flex items-start gap-4 lg:col-span-2">
              <div className="p-4 bg-slate-950 text-white rounded-2xl shrink-0"><Building2 className="w-5 h-5" /></div>
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Unidade</p>
                <p className="text-xl font-black text-slate-900 uppercase italic">{medico.consultorio_nome || '—'}</p>
                <p className="text-sm font-bold text-slate-400 mt-1 flex items-center gap-2"><MapPin className="w-3.5 h-3.5" />{medico.consultorio_endereco || 'Endereço não cadastrado'}</p>
              </div>
            </div>
            <div className="flex flex-col justify-center items-center bg-slate-50 rounded-2xl p-6 border border-slate-100 text-center">
              <Phone className="w-6 h-6 text-blue-600 mb-2" />
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Telefone</p>
              <p className="text-2xl font-black text-slate-900 italic">{medico.consultorio_telefone || '—'}</p>
            </div>
          </div>
        </div>

        {/* Observações */}
        {medico.observacoes && (
          <div className="bg-amber-50 p-7 rounded-[28px] border-2 border-amber-100 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-amber-500 text-white rounded-xl"><FileText className="w-5 h-5" /></div>
              <h3 className="text-lg font-black text-slate-900 uppercase italic tracking-tighter">Observações da Operação</h3>
            </div>
            <p className="text-sm font-bold text-slate-600 leading-relaxed whitespace-pre-wrap">{medico.observacoes}</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

const DataItem = ({ icon: Icon, label, value, color, link }: any) => (
  <div className="bg-white p-5 rounded-[24px] border border-slate-100 shadow-lg group hover:border-blue-400 transition-all flex items-start gap-4">
    <div className={`p-3.5 ${color} rounded-[16px] shadow-md flex-shrink-0 group-hover:scale-110 transition-transform`}>
      <Icon className="w-4 h-4 text-white" />
    </div>
    <div className="min-w-0">
      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      {link ? (
        <a href={link} target="_blank" rel="noreferrer"
          className="text-base font-black text-slate-900 hover:text-blue-600 transition-colors flex items-center gap-1.5 truncate max-w-[200px]">
          {value || '—'}<ExternalLink className="w-3 h-3 opacity-30 group-hover:opacity-100 shrink-0" />
        </a>
      ) : (
        <p className={`text-base font-black tracking-tight ${!value ? 'text-slate-300' : 'text-slate-900'}`}>{value || '—'}</p>
      )}
    </div>
  </div>
);

export default DetalhesMedico;
