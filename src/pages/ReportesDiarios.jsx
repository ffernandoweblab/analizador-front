'use client';

import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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

const BACKEND_URL = "https://backend-1-azu0.onrender.com";

// Funcion reutilizable para obtener el label correcto de un usuario
function obtenerLabelUsuario(user) {
  let label = user.prediccion?.label;
  
  if (!label && user.prediccion?.probabilidades) {
    const probs = user.prediccion.probabilidades;
    const maxProb = Math.max(
      probs.productivo || 0,
      probs.regular || 0,
      probs.no_productivo || 0
    );
    
    if (maxProb === (probs.productivo || 0)) label = "productivo";
    else if (maxProb === (probs.no_productivo || 0)) label = "no_productivo";
    else label = "regular";
  }
  
  return label || "regular";
}

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

//  FUNCIÓN CORRECTA: Obtiene últimos 7 días SIN incluir HOY
function obtenerDiasLaboralesAntesDe(diasRequeridos = 7) {
  const dias = [];
  const hoy = new Date();
  let fechaActual = new Date(hoy);
  
  // 🔑 Empezar desde AYER (no desde hoy)
  fechaActual.setDate(fechaActual.getDate() - 1);

  while (dias.length < diasRequeridos) {
    const diaSemana = fechaActual.getDay();

    if (diaSemana !== 0 && diaSemana !== 6) {
      dias.push(fechaActual.toISOString().slice(0, 10));
    }

    fechaActual.setDate(fechaActual.getDate() - 1);
  }

  return dias.reverse();
}

// Modal para mostrar usuarios de un día seleccionado
function ModalUsuariosDia({ diaSeleccionado, onClose, onNavigateToDia }) {
  const [usuariosDelDia, setUsuariosDelDia] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarUsuariosDelDia = async () => {
      if (!diaSeleccionado) return;
      
      setLoading(true);
      try {
        const url = `${BACKEND_URL}/api/productividad/hoy?date=${diaSeleccionado.fechaCompleta}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error('Error al cargar');
        const data = await res.json();
        
        setUsuariosDelDia(data.users || []);
      } catch (e) {
        console.error('Error:', e);
        setUsuariosDelDia([]);
      } finally {
        setLoading(false);
      }
    };

    cargarUsuariosDelDia();
  }, [diaSeleccionado]);

  if (!diaSeleccionado) return null;

  return (
    <Dialog
      open={!!diaSeleccionado}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: 3,
          bgcolor: 'background.paper',
        }
      }}
    >
      <DialogTitle sx={{ fontWeight: 800, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>{'📅'} {diaSeleccionado.fecha}</span>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2}>
          <Typography variant="body2" color="text.secondary">
            <strong>Total:</strong> {diaSeleccionado.total} usuarios
          </Typography>
          
          <Grid container spacing={1}>
            <Grid item xs={6}>
              <Box sx={{ p: 1.5, bgcolor: alpha('#10b981', 0.1), borderRadius: 2, textAlign: 'center' }}>
                <Typography variant="body2" fontWeight={800} color="#10b981">
                  {diaSeleccionado.productivo}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Productivos
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box sx={{ p: 1.5, bgcolor: alpha('#f59e0b', 0.1), borderRadius: 2, textAlign: 'center' }}>
                <Typography variant="body2" fontWeight={800} color="#f59e0b">
                  {diaSeleccionado.regular}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Regulares
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box sx={{ p: 1.5, bgcolor: alpha('#ef4444', 0.1), borderRadius: 2, textAlign: 'center' }}>
                <Typography variant="body2" fontWeight={800} color="#ef4444">
                  {diaSeleccionado.no_productivo}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  No Productivos
                </Typography>
              </Box>
            </Grid>
          </Grid>

          <Typography variant="subtitle2" fontWeight={800} sx={{ mt: 2 }}>
            {'📋'} Usuarios de ese dia:
          </Typography>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
              <CircularProgress />
            </Box>
          ) : usuariosDelDia.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
              Sin datos para este dia
            </Typography>
          ) : (
            <Stack spacing={1} sx={{ maxHeight: 400, overflowY: 'auto' }}>
              {usuariosDelDia.map((user) => (
                <Box
                  key={user.user_id}
                  onClick={() => onNavigateToDia(user.user_id, diaSeleccionado.fechaCompleta)}
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: alpha('#64748b', 0.08),
                    border: '1px solid',
                    borderColor: 'divider',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      bgcolor: alpha('#3b82f6', 0.12),
                      borderColor: '#3b82f6',
                      transform: 'translateX(4px)',
                    }
                  }}
                >
                  <Typography variant="body2" fontWeight={700} sx={{ mb: 0.5 }}>
                    {user.colaborador}
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                    <Chip
                      label={obtenerLabelUsuario(user)}
                      size="small"
                      sx={{
                        bgcolor: alpha(COLORS[obtenerLabelUsuario(user)], 0.2),
                        color: COLORS[obtenerLabelUsuario(user)],
                        fontWeight: 700,
                      }}
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ pt: 0.5 }}>
                      {'⏱️'} {formatearTiempo(user.tiempo_total)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ pt: 0.5 }}>
                      {'📋'} {user.actividades} actividades
                    </Typography>
                  </Stack>
                </Box>
              ))}
            </Stack>
          )}
        </Stack>
      </DialogContent>
    </Dialog>
  );
}

// Modal expandible para graficas
function ModalGrafica({ titulo, tipo, datos, onClose }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  const chartHeight = (() => {
    if (tipo === "distribucion") {
      return isMobile ? 320 : isTablet ? 420 : 520;
    }

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
      maxWidth="lg"
      PaperProps={{
        sx: {
          bgcolor: "background.paper",
          borderRadius: { xs: 3, sm: 3 },
          width: "100%",
          maxWidth: { xs: "95vw", sm: "92vw", md: "1100px" },
          m: { xs: 1.5, sm: 2 },
          maxHeight: { xs: "88vh", sm: "86vh" },
          overflow: "hidden",
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
          variant={isMobile ? "subtitle1" : "h6"}
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
                  left: isMobile ? 110 : 200,
                  bottom: 12,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                <XAxis type="number" tick={{ fontSize: isMobile ? 10 : 13, fill: theme.palette.text.primary }} />
                <YAxis
                  dataKey="nombre"
                  type="category"
                  tick={{ fontSize: isMobile ? 9 : 12, fill: theme.palette.text.primary }}
                  width={isMobile ? 100 : 180}
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
                  outerRadius={isMobile ? 95 : isTablet ? 150 : 190}
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
                    backgroundColor: "#1f2937",
                    border: `2px solid ${theme.palette.primary.main}`,
                    borderRadius: "8px",
                    color: "#ffffff",
                    fontSize: isMobile ? "12px" : "14px",
                    padding: "8px 12px",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.5)",
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

        {tipo === "siete_dias" && (
          <Box sx={{ width: "100%", height: chartHeight }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={datos}
                margin={{
                  top: 12,
                  right: isMobile ? 8 : 20,
                  left: isMobile ? 6 : 16,
                  bottom: isMobile ? 100 : 120,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                <XAxis
                  dataKey="fecha"
                  tick={{ fontSize: isMobile ? 8 : 11, fill: theme.palette.text.primary }}
                  angle={-45}
                  textAnchor="end"
                  height={isMobile ? 100 : 120}
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
                <Bar dataKey="productivo" stackId="a" fill={COLORS.productivo} radius={[8, 8, 0, 0]} />
                <Bar dataKey="regular" stackId="a" fill={COLORS.regular} radius={[0, 0, 0, 0]} />
                <Bar dataKey="no_productivo" stackId="a" fill={COLORS.no_productivo} radius={[0, 0, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Componente de paginacion para tabla
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
        {"Pág"} {paginaActual} de {totalPaginas}
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

// Componente de estadistica
function StatCard({ icon: Icon, label, value, color }) {
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
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10));
  const [isToday, setIsToday] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  
  const [modalActivo, setModalActivo] = useState(null);
  const [paginaUsuarios, setPaginaUsuarios] = useState(1);
  const [datosOchoDias, setDatosOchoDias] = useState([]);
  const [loadingOchoDias, setLoadingOchoDias] = useState(false);
  const [diaSeleccionado, setDiaSeleccionado] = useState(null);
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

      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`Error ${res.status}: ${await res.text()}`);
      }
      
      const jsonData = await res.json();
      setData(jsonData);
      setPaginaUsuarios(1);
    } catch (e) {
      console.error("Error cargando datos:", e);
      setErr(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  }, [fecha]);

  // ✅ FIX: Usa obtenerDiasLaboralesAntesDe para excluir HOY
  const cargarDatos7Dias = useCallback(async () => {
    setLoadingOchoDias(true);
    try {
      const diasLaborales = obtenerDiasLaboralesAntesDe(7);
      
      const promesas = diasLaborales.map(async (fechaDia) => {
        try {
          const url = `${BACKEND_URL}/api/productividad/hoy?date=${fechaDia}`;
          
          const res = await fetch(url);
          if (!res.ok) throw new Error('Error al cargar');
          const dataDia = await res.json();

          const contadores = { productivo: 0, regular: 0, no_productivo: 0 };
          dataDia.users?.forEach(user => {
            contadores[obtenerLabelUsuario(user)]++;
          });

          return {
            fecha: new Date(fechaDia + 'T00:00:00').toLocaleDateString('es-ES', { weekday: 'short', month: 'short', day: 'numeric' }),
            fechaCompleta: fechaDia,
            productivo: contadores.productivo,
            regular: contadores.regular,
            no_productivo: contadores.no_productivo,
            total: dataDia.users?.length || 0,
          };
        } catch (error) {
          console.error(`Error cargando ${fechaDia}:`, error);
          return {
            fecha: new Date(fechaDia + 'T00:00:00').toLocaleDateString('es-ES', { weekday: 'short', month: 'short', day: 'numeric' }),
            fechaCompleta: fechaDia,
            productivo: 0,
            regular: 0,
            no_productivo: 0,
            total: 0,
          };
        }
      });

      const resultados = await Promise.all(promesas);
      setDatosOchoDias(resultados);
    } catch (e) {
      console.error("Error cargando datos de 7 dias:", e);
    } finally {
      setLoadingOchoDias(false);
    }
  }, []);

  // Cargar datos del dia seleccionado cuando cambia la fecha
  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  // Cargar datos de 7 dias solo UNA VEZ al montar el componente
  const datos7DiasCargados = React.useRef(false);
  useEffect(() => {
    if (!datos7DiasCargados.current) {
      datos7DiasCargados.current = true;
      cargarDatos7Dias();
    }
  }, [cargarDatos7Dias]);

  // Auto-refresh solo para datos del dia actual
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

  const navegarADiaConColaborador = (userId, fechaDia) => {
    navigate(`/productividad/${userId}?date=${fechaDia}`);
  };

  const procesarDatosGenerales = useCallback(() => {
    if (!data?.users) return [];

    const contadores = { productivo: 0, regular: 0, no_productivo: 0 };
    data.users.forEach(user => {
      contadores[obtenerLabelUsuario(user)]++;
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
        const label = obtenerLabelUsuario(user);
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
      estado: obtenerLabelUsuario(user),
    }));

  const datosUsuariosCompletos = usuarios
    .sort((a, b) => (b.tiempo_total || 0) - (a.tiempo_total || 0))
    .map(user => ({
      nombre: user.colaborador,
      tiempo: user.tiempo_total || 0,
      actividades: user.actividades || 0,
      revisiones: user.revisiones || 0,
      estado: obtenerLabelUsuario(user),
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
                  {isMobile ? "Analisis del desempeno" : `Analisis detallado del desempeno ${isToday ? "en tiempo real" : "de la fecha seleccionada"}`}
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
                      <Tooltip title="Dia anterior">
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

                      <Tooltip title="Dia siguiente">
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
                      onClick={() => {
                        cargarDatos();
                        datos7DiasCargados.current = false;
                        cargarDatos7Dias();
                      }}
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
                      {loading ? "Cargando..." : (isMobile ? "Actualizar" : "Actualizar")}
                    </Button>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Box>

          {mostrarAvisoSinDatos && (
            <Alert severity="info" sx={{ borderRadius: 2 }}>
              <Typography variant="body2">
                {'📌'} <strong>Sin datos aun para hoy.</strong> Los datos se mostraran conforme vayan llegando.
              </Typography>
            </Alert>
          )}

          {/* Estadisticas Clave */}
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

          {/* Graficas Principales */}
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
                Vista General {isToday && !isMobile ? "del Dia" : ""}
              </Typography>

              <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }}>
                {/* Grafica de 7 dias laborales */}
                <Grid item xs={12} lg={6}>
                  <Card
                    sx={{
                      borderRadius: 3,
                      border: "1px solid",
                      borderColor: "divider",
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
                          {'📈'} {isMobile ? "Ultimos 7 dias" : "Productividad Ultimos 7 Dias"}
                        </Typography>
                        <Tooltip title="Click para ver detalles o en un dia para ver sus colaboradores">
                          <IconButton 
                            size="small" 
                            disabled={loadingOchoDias}
                            onClick={(e) => {
                              e.stopPropagation();
                              setModalActivo('siete_dias');
                            }}
                          >
                            <FullscreenIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                      
                      {loadingOchoDias ? (
                        <Box sx={{ height: isMobile ? 350 : 450, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <CircularProgress />
                        </Box>
                      ) : (
                        <Box sx={{ cursor: 'pointer' }}>
                          <ResponsiveContainer width="100%" height={isMobile ? 350 : 450}>
                            <BarChart 
                              data={datosOchoDias} 
                              margin={{ bottom: isMobile ? 60 : 80 }}
                              onClick={(event) => {
                                if (event && event.activeTooltipIndex !== undefined) {
                                  const diaClickeado = datosOchoDias[event.activeTooltipIndex];
                                  if (diaClickeado) {
                                    setDiaSeleccionado(diaClickeado);
                                  }
                                }
                              }}
                            >
                              <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                              <XAxis
                                dataKey="fecha"
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
                              <Bar dataKey="productivo" stackId="a" fill={COLORS.productivo} name="Productivo" />
                              <Bar dataKey="regular" stackId="a" fill={COLORS.regular} name="Regular" />
                              <Bar dataKey="no_productivo" stackId="a" fill={COLORS.no_productivo} name="No Productivo" />
                            </BarChart>
                          </ResponsiveContainer>
                        </Box>
                      )}
                      
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block', textAlign: 'center' }}>
                        {'💡'} Click en una barra para ver los colaboradores de ese dia
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Grafica Circular */}
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
                          {'🎯'} {isMobile ? "Distribucion" : "Distribucion de Productividad"}
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

                {/* Grafica de Barras - Tiempo */}
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
                          {'⏱️'} {isMobile ? "Top 8 Tiempo" : "Top 8 Usuarios por Tiempo"}
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

                {/* Grafica de Barras - Actividades */}
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
                          {'📋'} {isMobile ? "Act vs Rev" : "Top 8 Actividades vs Revisiones"}
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

                {/* Grafica Radar */}
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
                        {''} {isMobile ? "Comparativa" : "Comparativa de Usuarios"}
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
                        const estado = obtenerLabelUsuario(user);
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
          titulo={`Distribucion${!isMobile ? " Detallada" : ""} (${usuarios.length} usuarios)`}
          tipo="distribucion"
          datos={distribucion}
          onClose={() => setModalActivo(null)}
        />
      )}

      {modalActivo === 'tiempo' && (
        <ModalGrafica
          titulo={`${isMobile ? "Tiempo Total" : "Todos los Usuarios - Tiempo Total"} (${usuarios.length})`}
          tipo="barras_tiempo"
          datos={datosUsuariosCompletos}
          onClose={() => setModalActivo(null)}
        />
      )}

      {modalActivo === 'actividades' && (
        <ModalGrafica
          titulo={`${isMobile ? "Act vs Rev" : "Actividades vs Revisiones"} (${usuarios.length})`}
          tipo="actividades_revisiones"
          datos={datosUsuariosCompletos}
          onClose={() => setModalActivo(null)}
        />
      )}

      {modalActivo === 'siete_dias' && (
        <ModalGrafica
          titulo="Productividad Ultimos 7 Dias Laborales"
          tipo="siete_dias"
          datos={datosOchoDias}
          onClose={() => setModalActivo(null)}
        />
      )}

      {/* Modal para mostrar usuarios de un dia */}
      <ModalUsuariosDia 
        diaSeleccionado={diaSeleccionado}
        onClose={() => setDiaSeleccionado(null)}
        onNavigateToDia={navegarADiaConColaborador}
      />
    </Box>
  );
}