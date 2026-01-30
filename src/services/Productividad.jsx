import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import IconButton from "@mui/material/IconButton";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";


import {
  Avatar,
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Container,
  Divider,
  Grid,
  LinearProgress,
  Skeleton,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  Paper,
  alpha,
} from "@mui/material";

import AssignmentTurnedInOutlinedIcon from "@mui/icons-material/AssignmentTurnedInOutlined";
import ChecklistOutlinedIcon from "@mui/icons-material/ChecklistOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";


//const BACKEND_URL = "http://localhost:3001";
const BACKEND_URL = "https://backend-xycc.onrender.com";

const LABEL_PRETTY = {
  no_productivo: "No productivo",
  regular: "Regular",
  productivo: "Productivo",
};

const DESCRIPTIONS = {
  no_productivo: "Tuviste una productividad baja. Puedes mejorar.",
  regular: "Tuviste una productividad regular. Puedes mejorar.",
  productivo: "Fuiste muy productivo hoy. Excelente desempeño.",
};

function prettyLabel(label) {
  if (!label) return "";
  return (
    LABEL_PRETTY[label] ??
    String(label)
      .replaceAll("_", " ")
      .replace(/\b\w/g, (c) => c.toUpperCase())
  );
}

function formatearTiempo(minutos) {
  const m = Number(minutos ?? 0) || 0;
  if (m <= 0) return "0 min";
  if (m >= 60) {
    const horas = Math.floor(m / 60);
    const minutosRestantes = m % 60;
    return minutosRestantes === 0 ? `${horas}h` : `${horas}h ${minutosRestantes}min`;
  }
  return `${m} min`;
}

function toProb(v) {
  const n = typeof v === "string" ? Number.parseFloat(v) : Number(v);
  if (!Number.isFinite(n)) return 0;
  if (n < 0) return 0;
  if (n > 1) return 1;
  return n;
}

function getPredPalette(label) {
  switch (label) {
    case "productivo":
      return {
        chipColor: "success",
        bar: "success",
        avatarBg: "#10b981",
        gradient: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
        shadowColor: "rgba(16, 185, 129, 0.3)"
      };
    case "no_productivo":
      return {
        chipColor: "error",
        bar: "error",
        avatarBg: "#ef4444",
        gradient: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
        shadowColor: "rgba(239, 68, 68, 0.3)"
      };
    default:
      return {
        chipColor: "warning",
        bar: "warning",
        avatarBg: "#f59e0b",
        gradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
        shadowColor: "rgba(245, 158, 11, 0.3)"
      };
  }
}

function ProbRow({ label, value, color }) {
  const pct = Math.round(value * 1000) / 10;

  const colorMap = {
    error: "#ef4444",
    warning: "#f59e0b",
    success: "#10b981"
  };

  return (
    <Stack direction="row" spacing={2} alignItems="center">
      <Box sx={{ minWidth: 110 }}>
        <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 500 }}>
          {label}
        </Typography>
      </Box>
      <Box sx={{ flex: 1, position: "relative" }}>
        <Box
          sx={{
            height: 8,
            borderRadius: 999,
            bgcolor: alpha(colorMap[color], 0.1),
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              height: "100%",
              width: `${Math.min(100, Math.max(0, value * 100))}%`,
              background: `linear-gradient(90deg, ${colorMap[color]} 0%, ${alpha(colorMap[color], 0.8)} 100%)`,
              borderRadius: 999,
              transition: "width 0.6s ease-in-out",
            }}
          />
        </Box>
      </Box>
      <Box sx={{ minWidth: 56, textAlign: "right" }}>
        <Typography variant="body2" sx={{ color: colorMap[color], fontWeight: 700 }}>
          {pct.toFixed(1)}%
        </Typography>
      </Box>
    </Stack>
  );
}

function LoadingCard() {
  return (
    <Card
      sx={{
        borderRadius: 3,
        bgcolor: "background.paper",
        border: "1px solid",
        borderColor: "divider"
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Stack spacing={2.5}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Skeleton variant="circular" width={48} height={48} />
            <Box sx={{ flex: 1 }}>
              <Skeleton width="50%" height={24} />
              <Skeleton width="70%" height={16} sx={{ mt: 0.5 }} />
            </Box>
            <Skeleton width={100} height={28} sx={{ borderRadius: 999 }} />
          </Stack>
          <Divider />
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <Skeleton height={80} />
            </Grid>
            <Grid item xs={4}>
              <Skeleton height={80} />
            </Grid>
            <Grid item xs={4}>
              <Skeleton height={80} />
            </Grid>
          </Grid>
          <Skeleton height={120} />
        </Stack>
      </CardContent>
    </Card>
  );
}

function StatCard({ icon: Icon, value, label, color = "primary" }) {
  const colorMap = {
    primary: "#3b82f6",
    success: "#10b981",
    warning: "#f59e0b",
    error: "#ef4444",
  };

  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 2,
        bgcolor: alpha(colorMap[color], 0.08),
        border: "1px solid",
        borderColor: alpha(colorMap[color], 0.2),
        textAlign: "center",
        transition: "all 0.3s ease",
        "&:hover": {
          bgcolor: alpha(colorMap[color], 0.12),
          transform: "translateY(-2px)",
        }
      }}
    >
      <Icon sx={{ fontSize: 28, color: colorMap[color], mb: 1 }} />
      <Typography variant="h5" fontWeight={900} sx={{ color: "text.primary", mb: 0.5 }}>
        {value}
      </Typography>
      <Typography variant="caption" sx={{ color: "text.secondary", textTransform: "uppercase", letterSpacing: 0.5 }}>
        {label}
      </Typography>
    </Box>
  );
}

export default function Productividad() {
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const [, setSearchParams] = useSearchParams();

  const location = useLocation();
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const [fecha, setFecha] = useState(() => {
    const sp = new URLSearchParams(location.search);
    return sp.get("date") || today;
  });

  // ✅ Cuando cambie la URL (back/forward o navigate), sincroniza fecha
  useEffect(() => {
    const sp = new URLSearchParams(location.search);
    const d = sp.get("date") || today;
    setFecha(d);
  }, [location.search, today]);


  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [busqueda, setBusqueda] = useState("");


  const addDaysISO = (iso, delta) => {
    // iso: "YYYY-MM-DD"
    const d = new Date(`${iso}T00:00:00`);
    d.setDate(d.getDate() + delta);
    return d.toISOString().slice(0, 10);
  };

  const setFechaAndUrl = (next) => {
    setFecha(next);

    // Guarda la fecha en la URL
    if (!next || next === today) {
      setSearchParams({}, { replace: true }); // si quieres historial por cada cambio, pon replace:false
    } else {
      setSearchParams({ date: next }, { replace: true });
    }
  };

  const cargar = useCallback(async () => {
    setLoading(true);
    setErr("");
    try {
      const isToday = fecha === today;
      const url = isToday
        ? `${BACKEND_URL}/api/productividad/hoy`
        : `${BACKEND_URL}/api/productividad/hoy?date=${encodeURIComponent(fecha)}`;

      const res = await fetch(url);
      if (!res.ok) throw new Error(await res.text());
      setData(await res.json());
    } catch (e) {
      setErr(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  }, [fecha, today]);


  useEffect(() => {
    cargar();
    const id = setInterval(cargar, 5 * 60 * 1000);
    return () => clearInterval(id);
  }, [cargar]);

  const counts = useMemo(() => {
    const base = { todos: 0, productivo: 0, regular: 0, no_productivo: 0, sin_actividad: 0 };
    if (!data?.users) return base;

    base.todos = data.users.length;
    for (const u of data.users) {
      if ((Number(u?.tiempo_total ?? 0) || 0) === 0) base.sin_actividad += 1;
      else base[(u?.prediccion?.label || "regular")] += 1;
    }
    return base;
  }, [data]);

  const usuarios = useMemo(() => {
    if (!data?.users) return [];
    let usuariosRaw = data.users;

    if (busqueda.trim()) {
      const q = busqueda.toLowerCase();
      usuariosRaw = usuariosRaw.filter((u) => String(u?.colaborador || "").toLowerCase().includes(q));
    }

    if (filtroEstado !== "todos") {
      if (filtroEstado === "sin_actividad") {
        usuariosRaw = usuariosRaw.filter((u) => (Number(u?.tiempo_total ?? 0) || 0) === 0);
      } else {
        usuariosRaw = usuariosRaw.filter((u) => (u?.prediccion?.label || "regular") === filtroEstado);
      }
    }

    return usuariosRaw;
  }, [data, busqueda, filtroEstado]);

  const onGoDetalle = useCallback(
    (userId) => {
      const base = `/productividad/${encodeURIComponent(userId)}`;
      const url = fecha === today ? base : `${base}?date=${encodeURIComponent(fecha)}`;

      // ✅ guardo EXACTAMENTE la url actual (incluye ?date=...)
      const from = location.pathname + location.search;

      navigate(url, { state: { from } });
    },
    [navigate, fecha, today, location.pathname, location.search]
  );


  if (err) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper
          sx={{
            p: 3,
            borderRadius: 3,
            bgcolor: alpha("#ef4444", 0.1),
            border: "1px solid",
            borderColor: alpha("#ef4444", 0.3),
          }}
        >
          <Typography color="error" variant="body1" fontWeight={600}>
            {err}
          </Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Box sx={{ bgcolor: "#0a0e1a", minHeight: "100vh", py: 4 }}>
      <Container maxWidth="xl">
        <Stack spacing={4}>
          {/* Header */}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={3}
            alignItems={{ sm: "center" }}
            justifyContent="space-between"
          >
            <Box>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
                <TrendingUpIcon sx={{ fontSize: 40, color: "#3b82f6" }} />
                <Typography
                  variant="h3"
                  fontWeight={900}
                  sx={{
                    background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Panel de Productividad
                </Typography>
              </Stack>
              <Typography variant="body1" sx={{ color: "text.secondary", ml: 7 }}>
                {data ? `Predicción del día: ${data.date}` : "Cargando datos..."}
              </Typography>
            </Box>

            <Stack direction="row" spacing={2} alignItems="center">
  {/* Navegador de fecha (tipo Notion) */}
  <Stack direction="row" spacing={1} alignItems="center">
    <IconButton
      onClick={() => setFechaAndUrl(addDaysISO(fecha, -1))}
      sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2 }}
      aria-label="Día anterior"
    >
      <ChevronLeftRoundedIcon />
    </IconButton>

    <TextField
      type="date"
      size="small"
      value={fecha}
      onChange={(e) => setFechaAndUrl(e.target.value)}
      sx={{
        minWidth: 170,
        "& .MuiOutlinedInput-root": {
          bgcolor: "background.paper",
          borderRadius: 2,
          "&:hover": { bgcolor: alpha("#fff", 0.05) },
        },
      }}
    />

    <IconButton
      onClick={() => setFechaAndUrl(addDaysISO(fecha, 1))}
      sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2 }}
      aria-label="Día siguiente"
    >
      <ChevronRightRoundedIcon />
    </IconButton>
  </Stack>

  <Button
    variant="contained"
    startIcon={<RefreshOutlinedIcon />}
    onClick={cargar}
    disabled={loading}
    sx={{
      borderRadius: 2,
      px: 3,
      background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
      textTransform: "none",
      fontWeight: 700,
      boxShadow: "0 4px 14px rgba(59, 130, 246, 0.3)",
      "&:hover": {
        background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)",
        boxShadow: "0 6px 20px rgba(59, 130, 246, 0.4)",
      },
      "&:disabled": { background: alpha("#3b82f6", 0.3) },
    }}
  >
    {loading ? "Cargando..." : "Actualizar"}
  </Button>
</Stack>

          </Stack>

          {/* Filters */}
          {data && (
            <Card
              sx={{
                borderRadius: 3,
                bgcolor: "background.paper",
                border: "1px solid",
                borderColor: "divider",
                boxShadow: "0 4px 20px rgba(0,0,0,0.3)"
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Stack spacing={3}>
                  <ToggleButtonGroup
                    value={filtroEstado}
                    exclusive
                    onChange={(_, v) => v && setFiltroEstado(v)}
                    sx={{
                      flexWrap: "wrap",
                      gap: 1,
                      "& .MuiToggleButton-root": {
                        borderRadius: 2,
                        border: "1px solid",
                        borderColor: "divider",
                        textTransform: "none",
                        fontWeight: 600,
                        px: 2.5,
                        py: 1,
                        "&.Mui-selected": {
                          background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
                          color: "white",
                          borderColor: "transparent",
                          "&:hover": {
                            background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)",
                          }
                        }
                      }
                    }}
                  >
                    <ToggleButton value="todos">Todos ({counts.todos})</ToggleButton>
                    <ToggleButton value="productivo">✓ Productivo ({counts.productivo})</ToggleButton>
                    <ToggleButton value="regular">~ Regular ({counts.regular})</ToggleButton>
                    <ToggleButton value="no_productivo">✗ No productivo ({counts.no_productivo})</ToggleButton>
                    <ToggleButton value="sin_actividad">○ Sin actividad ({counts.sin_actividad})</ToggleButton>
                  </ToggleButtonGroup>

                  <TextField
                    size="medium"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}

                    placeholder="Buscar usuario por nombre..."
                    InputProps={{
                      startAdornment: <SearchOutlinedIcon sx={{ mr: 1.5, color: "text.secondary" }} />
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                        bgcolor: alpha("#fff", 0.03),
                        "&:hover": {
                          bgcolor: alpha("#fff", 0.05),
                        }
                      }
                    }}
                  />
                </Stack>
              </CardContent>
            </Card>
          )}

          {/* User Cards Grid */}
          <Grid container spacing={3}>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <Grid item xs={12} sm={6} lg={4} key={`loading-${i}`}>
                  <LoadingCard />
                </Grid>
              ))
            ) : data && usuarios.length === 0 ? (
              <Grid item xs={12}>
                <Paper
                  sx={{
                    borderRadius: 3,
                    p: 6,
                    textAlign: "center",
                    bgcolor: "background.paper",
                    border: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <SearchOutlinedIcon sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
                  <Typography variant="h6" sx={{ color: "text.secondary" }}>
                    No se encontraron usuarios con los filtros seleccionados
                  </Typography>
                </Paper>
              </Grid>
            ) : (
              usuarios.map((u) => {
                const pred = u?.prediccion ?? {};
                const label = pred?.label || "regular";
                const palette = getPredPalette(label);

                const probsRaw = pred?.probabilidades ?? pred?.probabilities ?? {};
                const probabilities = {
                  no_productivo: toProb(probsRaw.no_productivo),
                  regular: toProb(probsRaw.regular),
                  productivo: toProb(probsRaw.productivo),
                };

                return (
                  <Grid item xs={12} sm={6} lg={4} key={u.user_id}>
                    <Card
                      sx={{
                        borderRadius: 3,
                        bgcolor: "background.paper",
                        border: "1px solid",
                        borderColor: "divider",
                        transition: "all 0.3s ease",
                        position: "relative",
                        overflow: "hidden",
                        "&:hover": {
                          transform: "translateY(-4px)",
                          boxShadow: `0 12px 32px ${palette.shadowColor}`,
                          borderColor: palette.avatarBg,
                        },
                        "&::before": {
                          content: '""',
                          position: "absolute",
                          top: 0,
                          left: 0,
                          right: 0,
                          height: 4,
                          background: palette.gradient,
                        }
                      }}
                    >
                      <CardActionArea onClick={() => onGoDetalle(u.user_id)}>
                        <CardContent sx={{ p: 3 }}>
                          <Stack spacing={2.5}>
                            {/* User Header */}
                            <Stack direction="row" spacing={2} alignItems="flex-start" justifyContent="space-between">
                              <Stack direction="row" spacing={2} alignItems="center" sx={{ flex: 1, minWidth: 0 }}>
                                <Avatar
                                  sx={{
                                    width: 48,
                                    height: 48,
                                    background: palette.gradient,
                                    fontWeight: 900,
                                    fontSize: 20,
                                    boxShadow: `0 4px 12px ${palette.shadowColor}`,
                                  }}
                                >
                                  {(u?.colaborador || "U").charAt(0).toUpperCase()}
                                </Avatar>
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                  <Typography
                                    variant="h6"
                                    fontWeight={800}
                                    noWrap
                                    sx={{ color: "text.primary", mb: 0.5 }}
                                  >
                                    {u?.colaborador || "Usuario"}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      color: "text.secondary",
                                      display: "block",
                                      lineHeight: 1.4
                                    }}
                                  >
                                    {DESCRIPTIONS[label] || ""}
                                  </Typography>
                                </Box>
                              </Stack>

                              <Chip
                                label={prettyLabel(label)}
                                sx={{
                                  fontWeight: 800,
                                  borderRadius: 999,
                                  background: palette.gradient,
                                  color: "white",
                                  border: "none",
                                  boxShadow: `0 2px 8px ${palette.shadowColor}`,
                                }}
                              />
                            </Stack>

                            <Divider sx={{ borderColor: alpha("#fff", 0.08) }} />

                            {/* Stats Grid */}
                            <Grid container spacing={1.5}>
                              <Grid item xs={4}>
                                <StatCard
                                  icon={ChecklistOutlinedIcon}
                                  value={Number(u?.actividades ?? 0) || 0}
                                  label="Actividades"
                                  color="primary"
                                />
                              </Grid>
                              <Grid item xs={4}>
                                <StatCard
                                  icon={AssignmentTurnedInOutlinedIcon}
                                  value={Number(u?.revisiones ?? 0) || 0}
                                  label="Revisiones"
                                  color="success"
                                />
                              </Grid>
                              <Grid item xs={4}>
                                <StatCard
                                  icon={AccessTimeOutlinedIcon}
                                  value={formatearTiempo(u?.tiempo_total)}
                                  label="Tiempo"
                                  color="warning"
                                />
                              </Grid>
                            </Grid>

                            {/* Probability Distribution */}
                            <Box
                              sx={{
                                p: 2.5,
                                borderRadius: 2,
                                bgcolor: alpha("#fff", 0.02),
                                border: "1px solid",
                                borderColor: alpha("#fff", 0.05),
                              }}
                            >
                              <Typography
                                variant="subtitle2"
                                fontWeight={800}
                                sx={{ mb: 2, color: "text.primary", textTransform: "uppercase", letterSpacing: 0.5 }}
                              >
                                Distribución de probabilidades
                              </Typography>

                              <Stack spacing={1.5}>
                                <ProbRow label="No productivo" value={probabilities.no_productivo} color="error" />
                                <ProbRow label="Regular" value={probabilities.regular} color="warning" />
                                <ProbRow label="Productivo" value={probabilities.productivo} color="success" />
                              </Stack>
                            </Box>
                          </Stack>
                        </CardContent>
                      </CardActionArea>
                    </Card>
                  </Grid>
                );
              })
            )}
          </Grid>
        </Stack>
      </Container>
    </Box>
  );
}
