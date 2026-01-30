// src/App.jsx
import React from 'react';
import './App.css';
import Layout from './components/layout/Layout';
import ReportesDiarios from './pages/ReportesDiarios';
import ProductividadCards from './services/Productividad';
import ProductividadDetalle from './services/ProductividadDetalle'; // NUEVO
import { Routes, Route, Navigate } from 'react-router-dom';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<ProductividadCards />} />
        <Route path="/prediccionhoy" element={<ProductividadCards />} />
        <Route path="/reportes" element={<ReportesDiarios />} />

        {/* ✅ RUTA NUEVA: detalle por usuario */}
        <Route path="/productividad/:userId" element={<ProductividadDetalle />} />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Layout>
  );
}

export default App;
