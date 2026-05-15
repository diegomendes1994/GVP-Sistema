import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { 
  Upload, 
  CheckCircle2, 
  ArrowRight, 
  Columns,
  FileText,
  User as UserIcon
} from 'lucide-react';
import Modal from './Modal';

interface ImportExcelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (data: any[]) => void;
}

const ImportExcelModal: React.FC<ImportExcelModalProps> = ({ isOpen, onClose, onImport }) => {
  const [step, setStep] = useState(1);
  const [fileName, setFileName] = useState('');
  const [headers, setHeaders] = useState<string[]>([]);
  const [excelData, setExcelData] = useState<any[]>([]);
  const [responsavelBatch, setResponsavelBatch] = useState('');
  const [mapping, setMapping] = useState<Record<string, string>>({
    nome: '',
    especialidade: '',
    sus: '',
    vinculo: '',
    cns: ''
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'array' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const rawData = XLSX.utils.sheet_to_json(ws, { header: 1 });
      const jsonData = XLSX.utils.sheet_to_json(ws);
      
      if (rawData.length > 0) {
        const fileHeaders = rawData[0] as string[];
        setHeaders(fileHeaders);
        setExcelData(jsonData);
        
        const newMapping = { ...mapping };
        fileHeaders.forEach((header, index) => {
          const h = header.toLowerCase().trim();
          if (index === 0 || h.includes('nome')) newMapping.nome = header;
          if (index === 1 || h.includes('especialidade')) newMapping.especialidade = header;
          if (index === 2 || h.includes('sus')) newMapping.sus = header;
          if (index === 3 || h.includes('vinculo')) newMapping.vinculo = header;
          if (h.includes('cns')) newMapping.cns = header;
        });
        setMapping(newMapping);
      }
      setStep(2);
    };
    reader.readAsArrayBuffer(file);
  };

  const handleFinishImport = () => {
    const finalData = excelData.map((row: any) => ({
      nome: row[mapping.nome] || 'Sem Nome',
      especialidade: row[mapping.especialidade] || '',
      sus: String(row[mapping.sus] || 'Não'),
      vinculo: row[mapping.vinculo] || '',
      cns: row[mapping.cns] || '',
      responsavel_nome: responsavelBatch || null,
      status_atual: 'novo'
    }));

    onImport(finalData);
    setStep(1);
    setResponsavelBatch('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Importação GVP Master">
      {step === 1 ? (
        <div className="p-10 text-center animate-in fade-in zoom-in duration-500">
          <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-[28px] flex items-center justify-center mx-auto mb-8 shadow-xl shadow-blue-500/10 border-2 border-white">
            <Upload className="w-8 h-8" />
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter mb-4 uppercase leading-none">Subir Nova Planilha</h2>
          <p className="text-slate-400 font-bold max-w-sm mx-auto mb-10 uppercase text-[9px] tracking-widest leading-relaxed">
            Selecione o arquivo Excel e defina um <span className="text-blue-500 italic">Responsável Principal</span> no próximo passo.
          </p>
          
          <label className="block w-full cursor-pointer relative group">
            <input type="file" className="hidden" accept=".xlsx, .xls" onChange={handleFileUpload} />
            <div className="w-full py-8 bg-slate-50 border-4 border-dashed border-slate-100 rounded-[32px] group-hover:bg-blue-50 group-hover:border-blue-200 transition-all flex flex-col items-center gap-4">
               <FileText className="w-7 h-7 text-slate-200 group-hover:text-blue-500 transition-colors" />
               <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest group-hover:text-blue-600">Escolha o arquivo GVP</span>
            </div>
          </label>
        </div>
      ) : (
        <div className="p-8 space-y-8 animate-in slide-in-from-right-8 duration-700">
          <div className="flex items-center gap-4 p-5 bg-green-50 text-green-600 rounded-[28px] border-2 border-green-100/50">
             <div className="p-2.5 bg-white rounded-xl shadow-sm"><CheckCircle2 className="w-5 h-5" /></div>
             <div>
                <p className="text-[9px] font-black uppercase tracking-widest opacity-60">Arquivo Carregado</p>
                <p className="text-xs md:text-sm font-black tracking-tight uppercase truncate max-w-[200px]">{fileName}</p>
             </div>
          </div>

          <div className="space-y-4">
             <div className="flex items-center gap-3 px-1">
                <UserIcon className="w-4 h-4 text-blue-600" />
                <h3 className="text-lg font-black text-slate-900 tracking-tighter uppercase">Responsável pela Lista</h3>
             </div>
             <input 
               type="text" 
               placeholder="Ex: Equipe João, Pesquisa Interna..."
               value={responsavelBatch}
               onChange={(e) => setResponsavelBatch(e.target.value)}
               className="w-full bg-slate-950 text-white border-4 border-slate-900 px-6 py-5 rounded-[24px] focus:outline-none focus:border-blue-500 transition-all font-bold text-sm shadow-xl"
             />
          </div>

          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-3 px-1">
               <Columns className="w-4 h-4 text-slate-400" />
               <h3 className="text-lg font-black text-slate-900 tracking-tighter uppercase">Conferir Colunas Excel</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6 bg-slate-50 rounded-[32px] border border-slate-100">
              {Object.keys(mapping).map((field) => (
                <div key={field} className="space-y-1.5 px-1">
                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none block mb-1 italic">Mapear: {field}</label>
                  <select 
                    value={mapping[field]} 
                    onChange={(e) => setMapping({ ...mapping, [field]: e.target.value })}
                    className="w-full bg-white border-2 border-slate-200 text-slate-900 px-5 py-3 rounded-2xl focus:outline-none focus:border-blue-500 transition-all font-bold text-xs h-[50px] outline-none shadow-sm cursor-pointer appearance-none"
                  >
                    <option value="">Ignorar Campo</option>
                    {headers.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button onClick={() => setStep(1)} className="px-6 py-4 bg-white border-2 border-slate-100 text-slate-400 rounded-2xl font-black text-[9px] uppercase hover:text-slate-950 transition-all">Voltar</button>
            <button 
              onClick={handleFinishImport}
              className="flex-1 py-5 bg-slate-950 text-white rounded-[28px] font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:bg-blue-600 transition-all flex items-center justify-center gap-3 border-b-6 border-slate-900 active:border-b-0 active:translate-y-1 group"
            >
              Concluir Importação GVP
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default ImportExcelModal;
