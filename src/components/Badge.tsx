import React from 'react';

interface BadgeProps {
  text: string;
}

const Badge: React.FC<BadgeProps> = ({ text }) => {
  const status = text?.toLowerCase()?.trim() || '';
  
  const getStyles = () => {
    switch (status) {
      case 'bruto':
      case 'novo':
        return 'bg-slate-50 text-slate-400 border-slate-100';
      case 'enriquecendo':
      case 'em_enriquecimento':
        return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'pronto':
      case 'enriquecido':
        return 'bg-indigo-50 text-indigo-600 border-indigo-100';
      case 'abordando':
        return 'bg-orange-50 text-orange-600 border-orange-100';
      case 'concluido':
        return 'bg-green-50 text-green-600 border-green-100';
      case 'agendado':
        return 'bg-green-600 text-white border-green-700 shadow-lg shadow-green-500/20';
      case 'impossivel':
      case 'arquivado':
        return 'bg-red-50 text-red-500 border-red-100 opacity-70';
      default:
        return 'bg-slate-100 text-slate-500 border-slate-200';
    }
  };

  const getText = () => {
    switch (status) {
      case 'bruto':
      case 'novo': return 'Fila de Dados';
      case 'enriquecendo':
      case 'em_enriquecimento': return 'Enriquecendo';
      case 'pronto':
      case 'enriquecido': return 'Na Esteira';
      case 'abordando': return 'Em Andamento';
      case 'concluido': return 'Concluído';
      case 'agendado': return 'Sucesso!';
      case 'impossivel':
      case 'arquivado': return 'Contato Impossível';
      default: return text.replace('_', ' ').toUpperCase();
    }
  };

  return (
    <span className={`px-4 py-1.5 rounded-2xl text-[9px] font-black uppercase tracking-widest border transition-all ${getStyles()}`}>
      {getText()}
    </span>
  );
};

export default Badge;
