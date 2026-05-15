import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'; // GVP Security Guard v3.5.1
import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';

// Pages
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import Dashboard from './pages/dashboard/Dashboard';
import ListaMedicos from './pages/medicos/ListaMedicos';
import DetalhesMedico from './pages/medicos/DetalhesMedico';
import FormMedico from './pages/medicos/FormMedico';
import RecemEncontrados from './pages/medicos/RecemEncontrados';
import Relatorios from './pages/relatorios/Relatorios';

// Protected Route Master: Monitorando a sessão REAL do Supabase
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<any>(undefined);

  useEffect(() => {
    // Verificar sessão inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Escutar mudanças de autenticação (Deslogado, Expirado, etc)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Enquanto carrega a sessão, não mostrar nada para evitar "piscada" de tela proibida
  if (session === undefined) return null;

  // Se não tem sessão real no servidor, manda pra o Login e apaga o cache local antigo
  if (!session) {
    localStorage.removeItem('isAuthenticated');
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        {/* Protected Routes Master GVP */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/medicos" element={<ProtectedRoute><ListaMedicos /></ProtectedRoute>} />
        <Route path="/recem-encontrados" element={<ProtectedRoute><RecemEncontrados /></ProtectedRoute>} />
        <Route path="/relatorios" element={<ProtectedRoute><Relatorios /></ProtectedRoute>} />
        
        <Route path="/medicos/novo" element={<ProtectedRoute><FormMedico /></ProtectedRoute>} />
        <Route path="/medicos/editar/:id" element={<ProtectedRoute><FormMedico /></ProtectedRoute>} />
        <Route path="/medicos/:id" element={<ProtectedRoute><DetalhesMedico /></ProtectedRoute>} />

        {/* Home Redirect & Global Routes */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
