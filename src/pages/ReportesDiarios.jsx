'use client';

import React, { useCallback, useEffect, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  TextField,
  Checkbox,
  FormControlLabel,
  Grid,
  IconButton,
  Stack,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  CircularProgress,
  Alert,
  alpha,
  useTheme,
  Tooltip,
  Badge,
  useMediaQuery,
} from "@mui/material";

import RefreshIcon from "@mui/icons-material/Refresh";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import CloseIcon from "@mui/icons-material/Close";
import AssessmentIcon from "@mui/icons-material/Assessment";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningIcon from "@mui/icons-material/Warning";
import CancelIcon from "@mui/icons-material/Cancel";
import PeopleIcon from "@mui/icons-material/People";

import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";

const COLORS = {
  productivo: "#10b981",
  regular: "#f59e0b",
  no_productivo: "#ef4444",
};

// const BACKEND_URL = "http://localhost:3001";
const BACKEND_URL = "https://backend-xycc.onrender.com";

function formatearTiempo(minutos) {
  if (!minutos || minutos === 0) return "0 min";
  if (minutos >= 60) {
    const horas = Math.floor(minutos / 60);
    const minutosRestantes = minutos % 60;
    if (minutosRestantes === 0) return `${horas}h`;
    return `${horas}h ${minutosRestantes}min`;
  }
  return `${minutos} min`;
}

// Modal expandible para gráficas
// Modal expandible para gráficas (RESPONSIVO + más pequeño)
function ModalGrafica({ titulo, tipo, datos, onClose }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  // Alto base del chart según tipo + breakpoint (solo UI)
  const chartHeight = (() => {
    if (tipo === "distribucion") {
      // Pie: no necesita ser enorme
      return isMobile ? 320 : isTablet ? 420 : 520;
    }

    // Barras: depende de cantidad (pero con límites)
    const perRow = tipo === "actividades_revisiones" ? (isMobile ? 34 : 44) : (isMobile ? 28 : 38);
    const minH = isMobile ? 360 : isTablet ? 520 : 620;
    const maxH = isMobile ? 520 : isTablet ? 760 : 900;

    const computed = (datos?.length || 0) * perRow + (isMobile ? 120 : 160);
    return Math.max(minH, Math.min(maxH, computed));
  })();

  return (
    <Dialog
      open={true}
      onClose={onClose}
      fullWidth
      maxWidth="lg" // ✅ antes xl (muy grande)
      PaperProps={{
        sx: {
          bgcolor: "background.paper",
          borderRadius: { xs: 3, sm: 3 },
          width: "100%",
          maxWidth: { xs: "95vw", sm: "92vw", md: "1100px" }, // ✅ controla el tamaño real
          m: { xs: 1.5, sm: 2 }, // ✅ márgenes en pantallas pequeñas

          // ✅ alto máximo + scroll interno (no se sale de pantalla)
          maxHeight: { xs: "88vh", sm: "86vh" },
          overflow: "hidden", // el scroll vive en DialogContent
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid",
          borderColor: "divider",
          py: { xs: 1.25, sm: 2 },
          px: { xs: 1.5, sm: 3 },
          gap: 1.5,
        }}
      >
        <Typography
          variant={isMobile ? "subtitle1" : "h6"} // ✅ más compacto en mobile
          fontWeight={900}
          sx={{
            pr: 1,
            lineHeight: 1.2,
            display: "-webkit-box",
            WebkitLineClamp: { xs: 2, sm: 2 },
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {titulo}
        </Typography>

        <IconButton onClick={onClose} size={isMobile ? "medium" : "large"}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent
        dividers
        sx={{
          p: { xs: 1.5, sm: 3 },
          overflowY: "auto",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {tipo === "barras_tiempo" && (
          <Box sx={{ width: "100%", height: chartHeight }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={datos}
                layout="vertical"
                margin={{
                  top: 12,
                  right: isMobile ? 8 : 20,
                  left: isMobile ? 110 : 200, // ✅ reduce un poco
                  bottom: 12,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                <XAxis type="number" tick={{ fontSize: isMobile ? 10 : 13, fill: theme.palette.text.primary }} />
                <YAxis
                  dataKey="nombre"
                  type="category"
                  tick={{ fontSize: isMobile ? 9 : 12, fill: theme.palette.text.primary }}
                  width={isMobile ? 100 : 180} // ✅ reduce un poco
                />
                <RechartsTooltip
                  formatter={(value) => formatearTiempo(value)}
                  contentStyle={{
                    backgroundColor: theme.palette.background.paper,
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: "10px",
                    color: theme.palette.text.primary,
                    fontSize: isMobile ? "12px" : "14px",
                  }}
                />
                <Bar dataKey="tiempo" fill={COLORS.productivo} radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        )}

        {tipo === "actividades_revisiones" && (
          <Box sx={{ width: "100%", height: chartHeight }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={datos}
                margin={{
                  top: 12,
                  right: isMobile ? 8 : 20,
                  left: isMobile ? 6 : 16,
                  bottom: isMobile ? 120 : 140,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                <XAxis
                  dataKey="nombre"
                  tick={{ fontSize: isMobile ? 8 : 11, fill: theme.palette.text.primary }}
                  angle={-45}
                  textAnchor="end"
                  height={isMobile ? 120 : 140}
                />
                <YAxis tick={{ fontSize: isMobile ? 10 : 13, fill: theme.palette.text.primary }} />
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: theme.palette.background.paper,
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: "10px",
                    color: theme.palette.text.primary,
                    fontSize: isMobile ? "12px" : "14px",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: isMobile ? "12px" : "14px" }} />
                <Bar dataKey="actividades" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                <Bar dataKey="revisiones" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        )}

        {tipo === "distribucion" && (
          <Box sx={{ width: "100%", height: chartHeight }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={datos}
                  cx="50%"
                  cy="50%"
                  labelLine={!isMobile}
                  label={
                    isMobile
                      ? false
                      : ({ name, count, percent }) =>
                          `${name}: ${count} usuarios (${(percent * 100).toFixed(1)}%)`
                  }
                  outerRadius={isMobile ? 95 : isTablet ? 150 : 190} // ✅ más pequeño en general
                  fill="#8884d8"
                  dataKey="count"
                >
                  {datos.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>

                <RechartsTooltip
                  formatter={(value, name, props) => [
                    `${value} usuarios (${(props.payload.percent * 100).toFixed(1)}%)`,
                    props.payload.name,
                  ]}
                  contentStyle={{
                    backgroundColor: theme.palette.background.paper,
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: "10px",
                    color: theme.palette.text.primary,
                    fontSize: isMobile ? "12px" : "14px",
                  }}
                />

                <Legend
                  verticalAlign="bottom"
                  height={36}
                  wrapperStyle={{ fontSize: isMobile ? "11px" : "14px" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}


// Componente de paginación para tabla
function PaginacionTabla({ total, porPagina, paginaActual, onCambiarPagina }) {
  const totalPaginas = Math.ceil(total / porPagina);
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down('sm'));
  
  if (totalPaginas <= 1) return null;

  return (
    <Stack 
      direction="row" 
      spacing={{ xs: 1, sm: 2 }} 
      justifyContent="center" 
      alignItems="center" 
      sx={{ py: 2 }}
      flexWrap="wrap"
    >
      <Button
        variant="outlined"
        onClick={() => onCambiarPagina(paginaActual - 1)}
        disabled={paginaActual === 1}
        startIcon={!isMobile && <ChevronLeftIcon />}
        size={isMobile ? "small" : "medium"}
        sx={{ borderRadius: 2, minWidth: isMobile ? 80 : 120 }}
      >
        {isMobile ? "Ant" : "Anterior"}
      </Button>
      
      <Typography 
        variant="body2" 
        sx={{ 
          color: "text.secondary", 
          fontWeight: 600,
          fontSize: { xs: "0.75rem", sm: "0.875rem" },
          px: 1,
        }}
      >
        Pág {paginaActual} de {totalPaginas}
      </Typography>
      
      <Button
        variant="outlined"
        onClick={() => onCambiarPagina(paginaActual + 1)}
        disabled={paginaActual === totalPaginas}
        endIcon={!isMobile && <ChevronRightIcon />}
        size={isMobile ? "small" : "medium"}
        sx={{ borderRadius: 2, minWidth: isMobile ? 80 : 120 }}
      >
        {isMobile ? "Sig" : "Siguiente"}
      </Button>
    </Stack>
  );
}

// Componente de estadística
function StatCard({ icon: Icon, label, value, color }) {
  // const isMobile = useMediaQuery((theme) => theme.breakpoints.down('sm'));
  
  return (
    <Card
      sx={{
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: alpha(color, 0.08),
        transition: "all 0.3s ease",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: `0 8px 24px ${alpha(color, 0.2)}`,
          borderColor: color,
        }
      }}
    >
      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
        <Stack spacing={{ xs: 1.5, sm: 2 }} alignItems="center" textAlign="center">
          <Box
            sx={{
              width: { xs: 48, sm: 64 },
              height: { xs: 48, sm: 64 },
              borderRadius: 2,
              bgcolor: alpha(color, 0.15),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon sx={{ fontSize: { xs: 24, sm: 32 }, color: color }} />
          </Box>
          <Box>
            <Typography 
              variant="h4" 
              fontWeight={900} 
              sx={{ 
                color: "text.primary",
                fontSize: { xs: "1.5rem", sm: "2rem" }
              }}
            >
              {value}
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                color: "text.secondary", 
                fontWeight: 600, 
                mt: 0.5,
                fontSize: { xs: "0.75rem", sm: "0.875rem" }
              }}
            >
              {label}
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default function ReportesDiarios() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  // const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10));
  const [isToday, setIsToday] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  
  // Estados para modales y paginación
  const [modalActivo, setModalActivo] = useState(null);
  const [paginaUsuarios, setPaginaUsuarios] = useState(1);
  const usuariosPorPagina = 8;

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    setIsToday(fecha === today);
  }, [fecha]);

  const cargarDatos = useCallback(async () => {
    setLoading(true);
    setErr("");
    try {
      const today = new Date().toISOString().slice(0, 10);
      
      const url = fecha === today
        ? `${BACKEND_URL}/api/productividad/hoy`
        : `${BACKEND_URL}/api/productividad/hoy?date=${fecha}`;

      console.log("📊 Cargando reportes desde:", url);
      
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`Error ${res.status}: ${await res.text()}`);
      }
      
      const jsonData = await res.json();
      
      if (!jsonData.users || jsonData.users.length === 0) {
        console.warn("⚠️ Sin datos de usuarios para esta fecha");
        setData(jsonData);
      } else {
        console.log("✅ Datos cargados correctamente:", jsonData.users.length, "usuarios");
        setData(jsonData);
      }
      
      setPaginaUsuarios(1);
    } catch (e) {
      console.error("❌ Error cargando datos:", e);
      setErr(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  }, [fecha]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  useEffect(() => {
    if (!isToday || !autoRefresh) return;

    const interval = setInterval(() => {
      cargarDatos();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [isToday, autoRefresh, cargarDatos]);

  const cambiarDia = (dias) => {
    const fechaActual = new Date(fecha);
    fechaActual.setDate(fechaActual.getDate() + dias);
    setFecha(fechaActual.toISOString().slice(0, 10));
  };

  const procesarDatosGenerales = useCallback(() => {
    if (!data?.users) return [];

    const contadores = {
      productivo: 0,
      regular: 0,
      no_productivo: 0,
    };

    data.users.forEach(user => {
      const label = user.prediccion?.label || "regular";
      contadores[label]++;
    });

    const total = data.users.length;
    
    return [
      { 
        name: "Productivo", 
        count: contadores.productivo, 
        fill: COLORS.productivo,
        percent: contadores.productivo / total
      },
      { 
        name: "Regular", 
        count: contadores.regular, 
        fill: COLORS.regular,
        percent: contadores.regular / total
      },
      { 
        name: "No Productivo", 
        count: contadores.no_productivo, 
        fill: COLORS.no_productivo,
        percent: contadores.no_productivo / total
      },
    ].filter(item => item.count > 0);
  }, [data]);

  const procesarPromediosUsuarios = useCallback(() => {
    if (!data?.users) return [];

    return data.users
      .sort((a, b) => (b.tiempo_total || 0) - (a.tiempo_total || 0))
      .slice(0, 8)
      .map(user => {
        const label = user.prediccion?.label || "regular";
        const productivo = label === "productivo" ? 100 : label === "regular" ? 50 : 0;
        const regular = label === "regular" ? 100 : label === "productivo" ? 50 : 50;
        const no_productivo = label === "no_productivo" ? 100 : label === "regular" ? 50 : 0;

        return {
          nombre: user.colaborador?.split(' ')[0] || user.user_id,
          productivo: productivo,
          regular: regular,
          no_productivo: no_productivo,
        };
      });
  }, [data]);

  const distribucion = procesarDatosGenerales();
  const promedios = procesarPromediosUsuarios();
  const usuarios = data?.users || [];

  const datosUsuariosPreview = usuarios
    .sort((a, b) => (b.tiempo_total || 0) - (a.tiempo_total || 0))
    .slice(0, 8)
    .map(user => ({
      nombre: user.colaborador,
      tiempo: user.tiempo_total || 0,
      actividades: user.actividades || 0,
      revisiones: user.revisiones || 0,
      estado: user.prediccion?.label || "regular",
    }));

  const datosUsuariosCompletos = usuarios
    .sort((a, b) => (b.tiempo_total || 0) - (a.tiempo_total || 0))
    .map(user => ({
      nombre: user.colaborador,
      tiempo: user.tiempo_total || 0,
      actividades: user.actividades || 0,
      revisiones: user.revisiones || 0,
      estado: user.prediccion?.label || "regular",
    }));

  const indiceInicio = (paginaUsuarios - 1) * usuariosPorPagina;
  const indiceFin = indiceInicio + usuariosPorPagina;
  const usuariosPaginados = usuarios.slice(indiceInicio, indiceFin);

  if (err) {
    return (
      <Box sx={{ bgcolor: "background.default", minHeight: "100vh", py: { xs: 2, sm: 4 } }}>
        <Container maxWidth="xl">
          <Alert severity="error" sx={{ borderRadius: 2 }}>
            {err}
          </Alert>
        </Container>
      </Box>
    );
  }
  
  if (!data) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh" }}>
        <Stack spacing={2} alignItems="center">
          <CircularProgress size={60} />
          <Typography variant="h6" color="text.secondary">
            Cargando datos...
          </Typography>
        </Stack>
      </Box>
    );
  }

  const mostrarAvisoSinDatos = isToday && usuarios.length === 0;

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh", py: { xs: 2, sm: 3, md: 4 } }}>
      <Container maxWidth="xl">
        <Stack spacing={{ xs: 2, sm: 3, md: 4 }}>
          {/* Header */}
          <Box>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ xs: "flex-start", sm: "center" }} sx={{ mb: 2 }}>
              <AssessmentIcon sx={{ fontSize: { xs: 32, sm: 40 }, color: "#3b82f6" }} />
              <Box>
                <Typography
                  variant="h3"
                  fontWeight={900}
                  sx={{
                    fontSize: { xs: "1.5rem", sm: "2rem", md: "3rem" },
                    background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    lineHeight: 1.2,
                  }}
                >
                  Reporte de Productividad {!isMobile && isToday && "- Hoy"}
                </Typography>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    color: "text.secondary", 
                    mt: 0.5,
                    fontSize: { xs: "0.875rem", sm: "1rem" }
                  }}
                >
                  {isMobile ? "Análisis del desempeño" : `Análisis detallado del desempeño ${isToday ? "en tiempo real" : "de la fecha seleccionada"}`}
                </Typography>
              </Box>
            </Stack>

            {/* Controls */}
            <Card sx={{ borderRadius: 3, bgcolor: "background.paper", border: "1px solid", borderColor: "divider" }}>
              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Stack spacing={2}>
                  <Stack 
                    direction={{ xs: "column", sm: "row" }} 
                    spacing={2} 
                    alignItems={{ xs: "stretch", sm: "center" }}
                    flexWrap="wrap"
                  >
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ flex: { sm: 1 } }}>
                      <Tooltip title="Día anterior">
                        <IconButton
                          onClick={() => cambiarDia(-1)}
                          size={isMobile ? "small" : "medium"}
                          sx={{
                            bgcolor: alpha("#3b82f6", 0.1),
                            "&:hover": { bgcolor: alpha("#3b82f6", 0.2) }
                          }}
                        >
                          <ChevronLeftIcon fontSize={isMobile ? "small" : "medium"} />
                        </IconButton>
                      </Tooltip>

                      <TextField
                        type="date"
                        value={fecha}
                        onChange={(e) => setFecha(e.target.value)}
                        size="small"
                        label={!isMobile && "Fecha"}
                        sx={{ minWidth: { xs: 140, sm: 180 }, flex: 1 }}
                      />

                      <Tooltip title="Día siguiente">
                        <span>
                          <IconButton
                            onClick={() => cambiarDia(1)}
                            disabled={isToday}
                            size={isMobile ? "small" : "medium"}
                            sx={{
                              bgcolor: alpha("#3b82f6", 0.1),
                              "&:hover": { bgcolor: alpha("#3b82f6", 0.2) },
                              "&:disabled": { opacity: 0.3 }
                            }}
                          >
                            <ChevronRightIcon fontSize={isMobile ? "small" : "medium"} />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </Stack>

                    {isToday && (
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={autoRefresh}
                            onChange={(e) => setAutoRefresh(e.target.checked)}
                            size={isMobile ? "small" : "medium"}
                          />
                        }
                        label={
                          <Typography variant="body2" sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}>
                            Auto-actualizar
                          </Typography>
                        }
                      />
                    )}

                    <Button
                      variant="contained"
                      startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <RefreshIcon />}
                      onClick={cargarDatos}
                      disabled={loading}
                      fullWidth={isMobile}
                      size={isMobile ? "medium" : "large"}
                      sx={{
                        borderRadius: 2,
                        background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
                        "&:hover": {
                          background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)",
                        },
                      }}
                    >
                      {loading ? "Cargando..." : (isMobile ? "Actualizar" : " Actualizar")}
                    </Button>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Box>

          {mostrarAvisoSinDatos && (
            <Alert severity="info" sx={{ borderRadius: 2 }}>
              <Typography variant="body2">
                📌 <strong>Sin datos aún para hoy.</strong> Los datos se mostrarán conforme vayan llegando.
              </Typography>
            </Alert>
          )}

          {/* Estadísticas Clave */}
          {distribucion.length > 0 && (
            <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }}>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  icon={PeopleIcon}
                  label="Total Usuarios"
                  value={usuarios.length}
                  color="#3b82f6"
                />
              </Grid>
              {distribucion.map((item) => {
                const iconMap = {
                  "Productivo": CheckCircleIcon,
                  "Regular": WarningIcon,
                  "No Productivo": CancelIcon,
                };
                const Icon = iconMap[item.name];
                const total = distribucion.reduce((sum, d) => sum + d.count, 0);
                const porcentaje = ((item.count / total) * 100).toFixed(1);
                
                return (
                  <Grid item xs={12} sm={6} md={3} key={item.name}>
                    <StatCard
                      icon={Icon}
                      label={isMobile ? item.name : `${item.name} (${porcentaje}%)`}
                      value={item.count}
                      color={item.fill}
                    />
                  </Grid>
                );
              })}
            </Grid>
          )}

          {/* Gráficas Principales */}
          {usuarios.length > 0 && (
            <>
              <Typography 
                variant="h5" 
                fontWeight={800} 
                sx={{ 
                  mt: 2,
                  fontSize: { xs: "1.25rem", sm: "1.5rem" }
                }}
              >
                Vista General {isToday && !isMobile ? "del Día" : ""}
              </Typography>

              <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }}>
                {/* Gráfica Circular */}
                <Grid item xs={12} lg={6}>
                  <Card
                    onClick={() => setModalActivo('distribucion')}
                    sx={{
                      borderRadius: 3,
                      border: "1px solid",
                      borderColor: "divider",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        transform: "translateY(-4px)",
                        boxShadow: `0 8px 24px ${alpha("#3b82f6", 0.2)}`,
                        borderColor: "#3b82f6",
                      }
                    }}
                  >
                    <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                        <Typography 
                          variant="h6" 
                          fontWeight={800}
                          sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}
                        >
                          🎯 {isMobile ? "Distribución" : "Distribución de Productividad"}
                        </Typography>
                        <Tooltip title="Ver detalles">
                          <IconButton size="small">
                            <FullscreenIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                      <ResponsiveContainer width="100%" height={isMobile ? 250 : 300}>
                        <PieChart>
                          <Pie
                            data={distribucion}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={isMobile ? false : ({ name, count }) => `${name}: ${count}`}
                            outerRadius={isMobile ? 80 : 100}
                            fill="#8884d8"
                            dataKey="count"
                          >
                            {distribucion.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                          </Pie>
                          <RechartsTooltip
                            contentStyle={{
                              backgroundColor: theme.palette.background.paper,
                              border: `1px solid ${theme.palette.divider}`,
                              borderRadius: "8px",
                              color: theme.palette.text.primary,
                              fontSize: isMobile ? "12px" : "14px",
                            }}
                          />
                          {isMobile && <Legend wrapperStyle={{ fontSize: "10px" }} />}
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Gráfica de Barras - Tiempo */}
                <Grid item xs={12} lg={6}>
                  <Card
                    onClick={() => setModalActivo('tiempo')}
                    sx={{
                      borderRadius: 3,
                      border: "1px solid",
                      borderColor: "divider",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        transform: "translateY(-4px)",
                        boxShadow: `0 8px 24px ${alpha("#3b82f6", 0.2)}`,
                        borderColor: "#3b82f6",
                      }
                    }}
                  >
                    <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                        <Typography 
                          variant="h6" 
                          fontWeight={800}
                          sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}
                        >
                          ⏱️ {isMobile ? "Top 8 Tiempo" : "Top 8 Usuarios por Tiempo"}
                        </Typography>
                        <Badge badgeContent={usuarios.length} color="primary">
                          <Tooltip title="Ver todos">
                            <IconButton size="small">
                              <FullscreenIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Badge>
                      </Stack>
                      <ResponsiveContainer width="100%" height={isMobile ? 250 : 300}>
                        <BarChart 
                          data={datosUsuariosPreview} 
                          layout="vertical"
                          margin={{ left: isMobile ? 60 : 80 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                          <XAxis type="number" tick={{ fontSize: isMobile ? 10 : 12, fill: theme.palette.text.primary }} />
                          <YAxis 
                            dataKey="nombre" 
                            type="category" 
                            tick={{ fontSize: isMobile ? 9 : 11, fill: theme.palette.text.primary }} 
                            width={isMobile ? 55 : 75} 
                          />
                          <RechartsTooltip
                            formatter={(value) => formatearTiempo(value)}
                            contentStyle={{
                              backgroundColor: theme.palette.background.paper,
                              border: `1px solid ${theme.palette.divider}`,
                              borderRadius: "8px",
                              color: theme.palette.text.primary,
                              fontSize: isMobile ? "12px" : "14px",
                            }}
                          />
                          <Bar dataKey="tiempo" fill={COLORS.productivo} radius={[0, 8, 8, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Gráfica de Barras - Actividades */}
                <Grid item xs={12} lg={6}>
                  <Card
                    onClick={() => setModalActivo('actividades')}
                    sx={{
                      borderRadius: 3,
                      border: "1px solid",
                      borderColor: "divider",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        transform: "translateY(-4px)",
                        boxShadow: `0 8px 24px ${alpha("#3b82f6", 0.2)}`,
                        borderColor: "#3b82f6",
                      }
                    }}
                  >
                    <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                        <Typography 
                          variant="h6" 
                          fontWeight={800}
                          sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}
                        >
                          📋 {isMobile ? "Act vs Rev" : "Top 8 Actividades vs Revisiones"}
                        </Typography>
                        <Badge badgeContent={usuarios.length} color="primary">
                          <Tooltip title="Ver todos">
                            <IconButton size="small">
                              <FullscreenIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Badge>
                      </Stack>
                      <ResponsiveContainer width="100%" height={isMobile ? 250 : 300}>
                        <BarChart data={datosUsuariosPreview} margin={{ bottom: isMobile ? 60 : 80 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                          <XAxis 
                            dataKey="nombre" 
                            tick={{ fontSize: isMobile ? 8 : 10, fill: theme.palette.text.primary }} 
                            angle={-45} 
                            textAnchor="end" 
                            height={isMobile ? 60 : 80} 
                          />
                          <YAxis tick={{ fontSize: isMobile ? 10 : 12, fill: theme.palette.text.primary }} />
                          <RechartsTooltip
                            contentStyle={{
                              backgroundColor: theme.palette.background.paper,
                              border: `1px solid ${theme.palette.divider}`,
                              borderRadius: "8px",
                              color: theme.palette.text.primary,
                              fontSize: isMobile ? "12px" : "14px",
                            }}
                          />
                          <Legend wrapperStyle={{ fontSize: isMobile ? "11px" : "14px" }} />
                          <Bar dataKey="actividades" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                          <Bar dataKey="revisiones" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Gráfica Radar */}
                <Grid item xs={12} lg={6}>
                  <Card
                    sx={{
                      borderRadius: 3,
                      border: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                      <Typography 
                        variant="h6" 
                        fontWeight={800} 
                        sx={{ 
                          mb: 2,
                          fontSize: { xs: "1rem", sm: "1.25rem" }
                        }}
                      >
                        ⭐ {isMobile ? "Comparativa" : "Comparativa de Usuarios"}
                      </Typography>
                      <ResponsiveContainer width="100%" height={isMobile ? 250 : 300}>
                        <RadarChart data={promedios}>
                          <PolarGrid stroke={theme.palette.divider} />
                          <PolarAngleAxis 
                            dataKey="nombre" 
                            tick={{ fontSize: isMobile ? 9 : 12, fill: theme.palette.text.primary }} 
                          />
                          <PolarRadiusAxis 
                            angle={90} 
                            domain={[0, 100]} 
                            tick={{ fontSize: isMobile ? 9 : 12, fill: theme.palette.text.primary }} 
                          />
                          <Radar
                            name="Productivo"
                            dataKey="productivo"
                            stroke={COLORS.productivo}
                            fill={COLORS.productivo}
                            fillOpacity={0.3}
                          />
                          <Radar
                            name="Regular"
                            dataKey="regular"
                            stroke={COLORS.regular}
                            fill={COLORS.regular}
                            fillOpacity={0.3}
                          />
                          <Radar
                            name="No Productivo"
                            dataKey="no_productivo"
                            stroke={COLORS.no_productivo}
                            fill={COLORS.no_productivo}
                            fillOpacity={0.3}
                          />
                          <Legend wrapperStyle={{ fontSize: isMobile ? "10px" : "14px" }} />
                          <RechartsTooltip
                            contentStyle={{
                              backgroundColor: theme.palette.background.paper,
                              border: `1px solid ${theme.palette.divider}`,
                              borderRadius: "8px",
                              color: theme.palette.text.primary,
                              fontSize: isMobile ? "12px" : "14px",
                            }}
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Tabla de Usuarios */}
              <Box>
                <Typography 
                  variant="h5" 
                  fontWeight={800} 
                  sx={{ 
                    mb: 2,
                    fontSize: { xs: "1.25rem", sm: "1.5rem" }
                  }}
                >
                  Detalle de Usuarios ({usuarios.length} total)
                </Typography>

                <PaginacionTabla 
                  total={usuarios.length} 
                  porPagina={usuariosPorPagina}
                  paginaActual={paginaUsuarios}
                  onCambiarPagina={setPaginaUsuarios}
                />

                <Card sx={{ borderRadius: 3, border: "1px solid", borderColor: "divider" }}>
                  <Box sx={{ overflowX: "auto" }}>
                    <Box sx={{ minWidth: isMobile ? 500 : 650 }}>
                      {/* Header */}
                      <Box
                        sx={{
                          display: "grid",
                          gridTemplateColumns: isMobile 
                            ? "2fr 1.5fr 1fr 1fr" 
                            : "2fr 1.5fr 1fr 1fr 1fr",
                          gap: { xs: 1, sm: 2 },
                          p: { xs: 1.5, sm: 2 },
                          bgcolor: alpha(theme.palette.primary.main, 0.05),
                          borderBottom: "1px solid",
                          borderColor: "divider",
                        }}
                      >
                        <Typography variant="body2" fontWeight={800} fontSize={{ xs: "0.75rem", sm: "0.875rem" }}>
                          Usuario
                        </Typography>
                        <Typography variant="body2" fontWeight={800} fontSize={{ xs: "0.75rem", sm: "0.875rem" }}>
                          Estado
                        </Typography>
                        {!isMobile && (
                          <Typography variant="body2" fontWeight={800} fontSize={{ xs: "0.75rem", sm: "0.875rem" }}>
                            Tiempo
                          </Typography>
                        )}
                        <Typography variant="body2" fontWeight={800} fontSize={{ xs: "0.75rem", sm: "0.875rem" }}>
                          {isMobile ? "Act" : "Actividades"}
                        </Typography>
                        <Typography variant="body2" fontWeight={800} fontSize={{ xs: "0.75rem", sm: "0.875rem" }}>
                          {isMobile ? "Rev" : "Revisiones"}
                        </Typography>
                      </Box>

                      {/* Rows */}
                      {usuariosPaginados.map((user) => {
                        const estado = user.prediccion?.label || "regular";
                        const colorEstado = COLORS[estado];
                        return (
                          <Box
                            key={user.user_id}
                            sx={{
                              display: "grid",
                              gridTemplateColumns: isMobile 
                                ? "2fr 1.5fr 1fr 1fr" 
                                : "2fr 1.5fr 1fr 1fr 1fr",
                              gap: { xs: 1, sm: 2 },
                              p: { xs: 1.5, sm: 2 },
                              borderBottom: "1px solid",
                              borderColor: "divider",
                              transition: "all 0.2s ease",
                              "&:hover": {
                                bgcolor: alpha(theme.palette.primary.main, 0.03),
                              },
                              "&:last-child": {
                                borderBottom: "none",
                              }
                            }}
                          >
                            <Typography 
                              variant="body2" 
                              fontWeight={600}
                              fontSize={{ xs: "0.75rem", sm: "0.875rem" }}
                              noWrap
                            >
                              {user.colaborador}
                            </Typography>
                            <Box>
                              <Chip
                                label={isMobile 
                                  ? estado.charAt(0).toUpperCase() 
                                  : estado.charAt(0).toUpperCase() + estado.slice(1).replace("_", " ")
                                }
                                size="small"
                                sx={{
                                  bgcolor: alpha(colorEstado, 0.15),
                                  color: colorEstado,
                                  fontWeight: 700,
                                  borderRadius: 999,
                                  fontSize: { xs: "0.65rem", sm: "0.75rem" },
                                  height: { xs: 20, sm: 24 },
                                }}
                              />
                            </Box>
                            {!isMobile && (
                              <Typography variant="body2" fontSize={{ xs: "0.75rem", sm: "0.875rem" }}>
                                {formatearTiempo(user.tiempo_total)}
                              </Typography>
                            )}
                            <Typography variant="body2" fontSize={{ xs: "0.75rem", sm: "0.875rem" }}>
                              {user.actividades}
                            </Typography>
                            <Typography variant="body2" fontSize={{ xs: "0.75rem", sm: "0.875rem" }}>
                              {user.revisiones}
                            </Typography>
                          </Box>
                        );
                      })}
                    </Box>
                  </Box>
                </Card>

                <PaginacionTabla 
                  total={usuarios.length} 
                  porPagina={usuariosPorPagina}
                  paginaActual={paginaUsuarios}
                  onCambiarPagina={setPaginaUsuarios}
                />
              </Box>
            </>
          )}
        </Stack>
      </Container>

      {/* Modales */}
      {modalActivo === 'distribucion' && (
        <ModalGrafica
          titulo={`🎯 Distribución${!isMobile ? " Detallada" : ""} (${usuarios.length} usuarios)`}
          tipo="distribucion"
          datos={distribucion}
          onClose={() => setModalActivo(null)}
        />
      )}

      {modalActivo === 'tiempo' && (
        <ModalGrafica
          titulo={`📊 ${isMobile ? "Tiempo Total" : "Todos los Usuarios - Tiempo Total"} (${usuarios.length})`}
          tipo="barras_tiempo"
          datos={datosUsuariosCompletos}
          onClose={() => setModalActivo(null)}
        />
      )}

      {modalActivo === 'actividades' && (
        <ModalGrafica
          titulo={`📋 ${isMobile ? "Act vs Rev" : "Actividades vs Revisiones"} (${usuarios.length})`}
          tipo="actividades_revisiones"
          datos={datosUsuariosCompletos}
          onClose={() => setModalActivo(null)}
        />
      )}
    </Box>
  );
}
