import React from 'react';
import './App.css';
import Layout from './components/layout/Layout';
// import Dashboard from './pages/Dashboard';
import ReportesDiarios from './pages/ReportesDiarios';
import ProductividadCards from './services/Productividad';
import { Routes, Route, Navigate } from 'react-router-dom';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<ProductividadCards />} />
        <Route path="/prediccionhoy" element={<ProductividadCards />} />
        <Route path="/reportes" element={<ReportesDiarios />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Layout>
  );
}

export default App;
