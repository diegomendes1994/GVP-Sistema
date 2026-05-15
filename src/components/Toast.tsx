import React, { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';

// --- Sistema Global de Toast sem Context/Provider ---
type ToastType = 'success' | 'error' | 'info';

interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

let _items: ToastItem[] = [];
let _listeners: Array<(items: ToastItem[]) => void> = [];

const _notify = () => _listeners.forEach(l => l([..._items]));

const _add = (message: string, type: ToastType, duration = 4000) => {
  const id = `${Date.now()}-${Math.random()}`;
  _items = [..._items, { id, message, type }];
  _notify();
  setTimeout(() => {
    _items = _items.filter(t => t.id !== id);
    _notify();
  }, duration);
};

// Exportação global: use toast.success(), toast.error(), toast.info()
export const toast = {
  success: (msg: string) => _add(msg, 'success', 4000),
  error:   (msg: string) => _add(msg, 'error', 6000),
  info:    (msg: string) => _add(msg, 'info', 4000),
};

// Componente que fica fixo no canto da tela
export const ToastContainer: React.FC = () => {
  const [items, setItems] = useState<ToastItem[]>([]);

  useEffect(() => {
    const listener = (newItems: ToastItem[]) => setItems(newItems);
    _listeners.push(listener);
    return () => { _listeners = _listeners.filter(l => l !== listener); };
  }, []);

  if (items.length === 0) return null;

  const styles: Record<ToastType, string> = {
    success: 'bg-green-600 border-green-700 text-white',
    error:   'bg-red-600 border-red-700 text-white',
    info:    'bg-slate-950 border-slate-800 text-white',
  };

  const icons: Record<ToastType, React.ReactNode> = {
    success: <CheckCircle2 className="w-5 h-5 shrink-0" />,
    error:   <XCircle className="w-5 h-5 shrink-0" />,
    info:    <Info className="w-5 h-5 shrink-0" />,
  };

  const dismiss = (id: string) => {
    _items = _items.filter(t => t.id !== id);
    _notify();
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      {items.map(item => (
        <div
          key={item.id}
          className={`flex items-center gap-4 px-5 py-4 rounded-2xl shadow-2xl border-2 font-black text-[11px] uppercase tracking-widest animate-in slide-in-from-right-4 duration-300 pointer-events-auto ${styles[item.type]}`}
        >
          {icons[item.type]}
          <span className="flex-1 leading-none">{item.message}</span>
          <button onClick={() => dismiss(item.id)} className="opacity-50 hover:opacity-100 transition-opacity">
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
