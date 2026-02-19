// src/App.jsx
import React from 'react';
import './App.css';
import Layout from './components/layout/Layout';
import ReportesDiarios from './pages/ReportesDiarios';
import ProductividadCards from './services/Productividad';
import ProductividadDetalle from './services/ProductividadDetalle';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ConnectionProvider } from './context/ConnectionContext';

function App() {
  return (
    <ConnectionProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<ProductividadCards />} />
          <Route path="/prediccionhoy" element={<ProductividadCards />} />
          <Route path="/reportes" element={<ReportesDiarios />} />
          <Route path="/productividad/:userId" element={<ProductividadDetalle />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Layout>
    </ConnectionProvider>
  );
}

export default App;
