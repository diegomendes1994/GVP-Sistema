import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const Modal: React.FC<ModalProps> = ({ 
  isOpen, 
  title, 
  children, 
  onClose, 
  size = 'md' 
}) => {
  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
  };

  return (
    <div 
      className="fixed inset-0 bg-slate-950/60 backdrop-blur-md flex items-end md:items-center justify-center z-[100] transition-all p-0 md:p-6"
      onClick={onClose}
    >
      <div 
        className={`bg-white rounded-t-[40px] md:rounded-[48px] shadow-2xl w-full h-[92vh] md:h-auto md:max-h-[90vh] animate-in slide-in-from-bottom-24 md:zoom-in duration-500 flex flex-col relative overflow-hidden ${sizeClasses[size]}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Decor Bar (Mobile Only) */}
        <div className="md:hidden w-12 h-1.5 bg-slate-100 rounded-full mx-auto my-4 shrink-0"></div>

        <div className="flex justify-between items-center px-8 md:px-12 py-6 md:py-8 border-b border-slate-50 shrink-0">
          <div className="space-y-1">
             <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tighter uppercase leading-none">{title}</h2>
             <p className="hidden md:block text-[9px] font-black text-slate-400 uppercase tracking-widest italic py-1">Controle Operacional GVP</p>
          </div>
          <button 
            onClick={onClose} 
            className="text-slate-300 hover:text-red-500 transition-all p-3 md:p-4 bg-slate-50 hover:bg-red-50 rounded-2xl md:rounded-[22px] group"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5 md:w-6 md:h-6 group-hover:rotate-90 transition-transform" />
          </button>
        </div>
        <div className="p-8 md:p-12 overflow-y-auto flex-1 custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
