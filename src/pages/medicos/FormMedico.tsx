import React, { useState, useEffect } from 'react';
import { CAMPOS_COMPLETUDE } from '../../types/medico';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../../components/Layout';
import { toast } from '../../components/Toast';
import { 
  Save, X, User, Stethoscope, Edit3, Phone, Mail,
  Building2, MapPin, CheckCircle2, Loader2, Camera,
  Globe, Link2, AlertCircle, FileText, Search
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

// Campos obrigatórios para cálculo de completude


const calcularCompletude = (data: any) => {
  const preenchidos = CAMPOS_COMPLETUDE.filter(c => data[c] && String(data[c]).trim() !== '').length;
  return Math.round((preenchidos / CAMPOS_COMPLETUDE.length) * 100);
};

const FormMedico: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = !!id && id !== 'novo';

  const [fetching, setFetching] = useState(isEditing);
  const [loading, setLoading] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);
  const [duplicataAviso, setDuplicataAviso] = useState('');

  const [formData, setFormData] = useState({
    nome: '', especialidade: '', telefone: '', email: '',
    instagram: '', linkedin: '', website: '', cns: '',
    sus: 'Não', vinculo: '', consultorio_nome: '',
    consultorio_endereco: '', consultorio_cep: '',
    consultorio_telefone: '', status_atual: 'novo',
    responsavel_nome: '', observacoes: ''
  });

  const completude = calcularCompletude(formData);

  useEffect(() => {
    if (!isEditing) { setFetching(false); return; }
    (async () => {
      setFetching(true);
      try {
        const { data, error } = await supabase.from('medicos').select('*').eq('id', id).single();
        if (error) throw error;
        if (data) setFormData({ ...formData, ...data });
      } catch {
        toast.error('Erro ao carregar ficha do médico.');
      } finally { setFetching(false); }
    })();
  }, [id]);

  // Detecção de duplicatas ao digitar o nome
  const verificarDuplicata = async (nome: string) => {
    if (!nome || nome.length < 4 || isEditing) return;
    const { data } = await supabase
      .from('medicos').select('id, nome')
      .ilike('nome', `%${nome.trim()}%`)
      .limit(1);
    if (data && data.length > 0) {
      setDuplicataAviso(`⚠️ Já existe um registro similar: "${data[0].nome}"`);
    } else {
      setDuplicataAviso('');
    }
  };

  // CEP automático via ViaCEP
  const buscarCep = async (cep: string) => {
    const cepLimpo = cep.replace(/\D/g, '');
    if (cepLimpo.length !== 8) return;
    setCepLoading(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const data = await res.json();
      if (data.erro) { toast.error('CEP não encontrado.'); return; }
      setFormData(prev => ({
        ...prev,
        consultorio_cep: cep,
        consultorio_endereco: `${data.logradouro}, ${data.bairro} - ${data.localidade}/${data.uf}`
      }));
      toast.success('Endereço preenchido automaticamente!');
    } catch {
      toast.error('Erro ao buscar CEP. Verifique sua conexão.');
    } finally { setCepLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome.trim()) { toast.error('O nome do médico é obrigatório.'); return; }
    setLoading(true);
    try {
      if (isEditing) {
        const { id: _, created_at: __, ...updateData } = formData as any;
        const { error } = await supabase.from('medicos').update(updateData).eq('id', id);
        if (error) throw error;
        toast.success('Ficha atualizada com sucesso!');
      } else {
        const { error } = await supabase.from('medicos').insert([formData]);
        if (error) throw error;
        toast.success('Médico cadastrado com sucesso!');
      }
      setTimeout(() => navigate('/medicos'), 800);
    } catch (err: any) {
      toast.error(`Erro ao salvar: ${err.message}`);
    } finally { setLoading(false); }
  };

  const set = (name: string, value: string) => setFormData(prev => ({ ...prev, [name]: value }));

  if (fetching) return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin opacity-20" />
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Carregando ficha...</p>
      </div>
    </Layout>
  );

  // Cor da barra de completude
  const completudeCor = completude < 40 ? 'bg-red-500' : completude < 75 ? 'bg-orange-500' : 'bg-green-500';

  return (
    <Layout>
      <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 pb-24 space-y-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-slate-950 text-white p-8 md:p-12 rounded-[40px] shadow-2xl relative overflow-hidden">
           <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-[100px] -mr-32 -mt-32"></div>
           <div className="relative z-10 flex items-center gap-6">
              <div className="w-16 h-16 bg-blue-600 rounded-[22px] flex items-center justify-center shadow-xl">
                 {isEditing ? <Edit3 className="w-8 h-8" /> : <Plus className="w-8 h-8" />}
              </div>
              <div>
                 <h1 className="text-3xl md:text-4xl font-black tracking-tighter uppercase leading-none italic underline decoration-blue-600">
                   {isEditing ? 'Editar Ficha' : 'Novo Médico'}
                 </h1>
                 <p className="text-blue-500 font-black uppercase text-[9px] tracking-[0.4em] mt-1 italic">
                   {isEditing ? `Ref: #${id}` : 'Inclusão GVP'}
                 </p>
              </div>
           </div>
           <div className="relative z-10 flex gap-3 w-full md:w-auto">
              <button type="button" onClick={() => navigate('/medicos')}
                className="flex-1 md:flex-none px-6 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white hover:text-slate-950 transition-all flex items-center justify-center gap-2">
                <X className="w-4 h-4" /> Cancelar
              </button>
              <button onClick={handleSubmit} disabled={loading}
                className="flex-1 md:flex-none px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-2xl hover:bg-white hover:text-slate-950 transition-all flex items-center justify-center gap-2 border-b-4 border-blue-900 active:border-b-0 active:translate-y-1 disabled:opacity-50">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {isEditing ? 'Salvar' : 'Cadastrar'}
              </button>
           </div>
        </div>

        {/* Barra de Completude da Ficha */}
        <div className="bg-white p-6 rounded-[28px] shadow-xl border border-slate-50">
           <div className="flex justify-between items-center mb-3">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Completude da Ficha</p>
              <p className={`text-[11px] font-black uppercase tracking-widest italic ${completude < 40 ? 'text-red-500' : completude < 75 ? 'text-orange-500' : 'text-green-600'}`}>
                {completude}% completo
              </p>
           </div>
           <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden border border-slate-200">
              <div className={`h-full ${completudeCor} rounded-full transition-all duration-700 ease-out`} style={{ width: `${completude}%` }}></div>
           </div>
           <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-2 italic">
             {CAMPOS_COMPLETUDE.filter(c => !formData[c as keyof typeof formData]).length} campo(s) por preencher
           </p>
        </div>

        {/* Aviso de Duplicata */}
        {duplicataAviso && (
          <div className="p-5 bg-orange-50 border-l-4 border-orange-500 text-orange-700 rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            {duplicataAviso}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Coluna Esquerda */}
          <div className="space-y-8">
            <Section title="Dados Pessoais" icon={<User className="w-5 h-5" />}>
              <div className="md:col-span-2">
                <Label icon={User} text="Nome do Médico *" />
                <input value={formData.nome}
                  onChange={e => { set('nome', e.target.value); verificarDuplicata(e.target.value); }}
                  placeholder="Dr/Dra..." className={INPUT} />
              </div>
              <div className="md:col-span-2">
                <Label icon={User} text="Responsável da Mineração" />
                <input value={formData.responsavel_nome} onChange={e => set('responsavel_nome', e.target.value)} placeholder="Ex: João" className={INPUT} />
              </div>
              <div>
                <Label icon={Stethoscope} text="Especialidade" />
                <input value={formData.especialidade} onChange={e => set('especialidade', e.target.value)} placeholder="Ex: Cardiologia" className={INPUT} />
              </div>
              <div>
                <Label icon={AlertCircle} text="CRM / CNS" />
                <input value={formData.cns} onChange={e => set('cns', e.target.value)} placeholder="Apenas números" className={INPUT} />
              </div>
              <div>
                <Label icon={CheckCircle2} text="Atende SUS" />
                <select value={formData.sus} onChange={e => set('sus', e.target.value)} className={INPUT}>
                  <option>Sim</option>
                  <option>Não</option>
                </select>
              </div>
              <div>
                <Label icon={Building2} text="Vínculo da Ficha" />
                <input value={formData.vinculo} onChange={e => set('vinculo', e.target.value)} placeholder="Ex: Indicação, Instagram..." className={INPUT} />
              </div>
            </Section>

            <Section title="Canais Digitais" icon={<Globe className="w-5 h-5" />}>
              <div>
                <Label icon={Phone} text="WhatsApp" />
                <input value={formData.telefone} onChange={e => set('telefone', e.target.value)} placeholder="DDD + Número" className={INPUT} />
              </div>
              <div>
                <Label icon={Mail} text="E-mail" />
                <input type="email" value={formData.email} onChange={e => set('email', e.target.value)} placeholder="contato@..." className={INPUT} />
              </div>
              <div>
                <Label icon={Camera} text="Instagram" />
                <input value={formData.instagram} onChange={e => set('instagram', e.target.value)} placeholder="@usuario" className={INPUT} />
              </div>
              <div>
                {/* FIX: era name="website" — corrigido para linkedin */}
                <Label icon={Link2} text="LinkedIn" />
                <input value={formData.linkedin} onChange={e => set('linkedin', e.target.value)} placeholder="https://linkedin.com/in/..." className={INPUT} />
              </div>
              <div className="md:col-span-2">
                <Label icon={Globe} text="Website / Clínica Online" />
                <input value={formData.website} onChange={e => set('website', e.target.value)} placeholder="https://..." className={INPUT} />
              </div>
            </Section>
          </div>

          {/* Coluna Direita */}
          <div className="space-y-8">
            <Section title="Endereço da Clínica" icon={<Building2 className="w-5 h-5" />}>
              {/* CEP com busca automática */}
              <div className="md:col-span-2">
                <Label icon={Search} text="CEP (preenche endereço automaticamente)" />
                <div className="relative">
                  <input
                    value={formData.consultorio_cep || ''}
                    onChange={e => { set('consultorio_cep', e.target.value); if (e.target.value.replace(/\D/g,'').length === 8) buscarCep(e.target.value); }}
                    placeholder="00000-000"
                    maxLength={9}
                    className={INPUT}
                  />
                  {cepLoading && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-blue-600" />}
                </div>
              </div>
              <div className="md:col-span-2">
                <Label icon={Building2} text="Nome da Clínica/Unidade" />
                <input value={formData.consultorio_nome} onChange={e => set('consultorio_nome', e.target.value)} placeholder="Nome Fantasia" className={INPUT} />
              </div>
              <div className="md:col-span-2">
                <Label icon={MapPin} text="Endereço Completo" />
                <input value={formData.consultorio_endereco} onChange={e => set('consultorio_endereco', e.target.value)} placeholder="Rua, Número, Cidade..." className={INPUT} />
              </div>
              <div className="md:col-span-2">
                <Label icon={Phone} text="Telefone da Unidade" />
                <input value={formData.consultorio_telefone} onChange={e => set('consultorio_telefone', e.target.value)} placeholder="DDD + Número" className={INPUT} />
              </div>
            </Section>

            <Section title="Observações da Operação" icon={<FileText className="w-5 h-5" />}>
              <div className="md:col-span-2">
                <Label icon={FileText} text="Notas Internas (visível para a equipe)" />
                <textarea
                  value={formData.observacoes}
                  onChange={e => set('observacoes', e.target.value)}
                  placeholder="Ex: Médico demonstrou interesse em GVP, prefere contato às quartas..."
                  rows={5}
                  className={`${INPUT} resize-none`}
                />
              </div>
            </Section>

            <div className="p-5 bg-blue-50 border-2 border-dashed border-blue-100 rounded-2xl">
              <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest text-center italic">Status Controlado pelo Sistema</p>
              <p className="text-[8px] font-bold text-blue-400 uppercase tracking-widest text-center mt-1 italic">Use os botões da Esteira ou Central para mudar o status.</p>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  );
};

const INPUT = "w-full bg-white border-2 border-slate-100 px-5 py-4 rounded-2xl focus:outline-none focus:border-blue-500 transition-all font-bold text-sm shadow-sm mt-1";

const Label = ({ icon: Icon, text }: { icon: any; text: string }) => (
  <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none group-focus-within:text-blue-600 transition-colors">
    <Icon className="w-3.5 h-3.5" /> {text}
  </label>
);

const Section = ({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) => (
  <div className="space-y-5">
    <div className="flex items-center gap-3 px-1">
      <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">{icon}</div>
      <h2 className="text-xl font-black text-slate-900 tracking-tighter uppercase italic">{title}</h2>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 bg-white p-7 rounded-[32px] border border-slate-50 shadow-xl">
      {children}
    </div>
  </div>
);

const Plus = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M5 12h14"/><path d="M12 5v14"/>
  </svg>
);

export default FormMedico;
