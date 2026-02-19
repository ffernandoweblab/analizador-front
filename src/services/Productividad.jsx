// src/pages/Productividad.jsx
'use client';

import React, { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";

import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import AssignmentTurnedInOutlinedIcon from "@mui/icons-material/AssignmentTurnedInOutlined";
import ChecklistOutlinedIcon from "@mui/icons-material/ChecklistOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import { useProductividadSocket } from "../hooks/useProductividadSocket";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import LinearProgress from "@mui/material/LinearProgress";
import Tooltip from "@mui/material/Tooltip";


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
  Skeleton,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  Paper,
  IconButton,
  Grid,
  Switch,
  FormControlLabel,
  alpha,
  useMediaQuery,
  useTheme,
  CircularProgress,
  Snackbar,
} from "@mui/material";

const BACKEND_URL = "https://backend-1-azu0.onrender.com";
//const BACKEND_URL = "http://localhost:3001";

// ✅ FUNCIONES DE FECHA CORREGIDAS
function hoyISO() {
  return new Date().toISOString().slice(0, 10);
}

function pasaronLas11AM() {
  const ahora = new Date();
  return ahora.getHours() > 10 || (ahora.getHours() === 10 && ahora.getMinutes() > 0);
}

function msHastaLas11AM() {
  const ahora = new Date();
  const objetivo = new Date();
  objetivo.setHours(11, 0, 0, 0);
  const ms = objetivo.getTime() - ahora.getTime();
  return ms > 0 ? ms : 0;
}

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
        shadowColor: "rgba(16, 185, 129, 0.3)",
      };
    case "no_productivo":
      return {
        chipColor: "error",
        bar: "error",
        avatarBg: "#ef4444",
        gradient: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
        shadowColor: "rgba(239, 68, 68, 0.3)",
      };
    default:
      return {
        chipColor: "warning",
        bar: "warning",
        avatarBg: "#f59e0b",
        gradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
        shadowColor: "rgba(245, 158, 11, 0.3)",
      };
  }
}

function ProbRow({ label, value, color }) {
  const pct = Math.round(value * 1000) / 10;

  const colorMap = {
    error: "#ef4444",
    warning: "#f59e0b",
    success: "#10b981",
  };

  return (
    <Stack direction="row" spacing={{ xs: 1, sm: 2 }} alignItems="center">
      <Box sx={{ minWidth: { xs: 86, sm: 110 } }}>
        <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 500, fontSize: { xs: 12, sm: 14 } }}>
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

      <Box sx={{ minWidth: { xs: 46, sm: 56 }, textAlign: "right" }}>
        <Typography variant="body2" sx={{ color: colorMap[color], fontWeight: 700, fontSize: { xs: 12, sm: 14 } }}>
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
        borderColor: "divider",
      }}
    >
      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
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
            <Grid item xs={12} sm={4}>
              <Skeleton height={80} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Skeleton height={80} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Skeleton height={80} />
            </Grid>
          </Grid>

          <Skeleton height={120} />
        </Stack>
      </CardContent>
    </Card>
  );
}

function StatCard({ icon: Icon, value, label, color = "primary", loading = false }) {
  const colorMap = {
    primary: "#3b82f6",
    success: "#10b981",
    warning: "#f59e0b",
    error: "#ef4444",
  };

  return (
    <Box
      sx={{
        p: { xs: 1.5, sm: 2 },
        borderRadius: 2,
        bgcolor: alpha(colorMap[color], 0.08),
        border: "1px solid",
        borderColor: alpha(colorMap[color], 0.2),
        textAlign: "center",
        transition: "all 0.3s ease",
        "&:hover": {
          bgcolor: alpha(colorMap[color], 0.12),
          transform: "translateY(-2px)",
        },
      }}
    >
      <Icon sx={{ fontSize: { xs: 24, sm: 28 }, color: colorMap[color], mb: 1 }} />
      <Typography
        variant="h5"
        fontWeight={900}
        sx={{ color: "text.primary", mb: 0.5, fontSize: { xs: 18, sm: 22 } }}
      >
        {loading ? <CircularProgress size={20} sx={{ color: colorMap[color] }} /> : value}
      </Typography>
      <Typography
        variant="caption"
        sx={{
          color: "text.secondary",
          textTransform: "uppercase",
          letterSpacing: 0.5,
          fontSize: { xs: 10, sm: 12 },
        }}
      >
        {label}
      </Typography>
    </Box>
  );
}

// ✅ FUNCIÓN OPTIMIZADA: Obtener datos de revisiones terminadas de un usuario
async function obtenerDatosTerminadas(userId, fecha) {
  try {
    const qs = fecha ? `?date=${encodeURIComponent(fecha)}` : "";
    const url = `${BACKEND_URL}/api/productividad/usuario/${encodeURIComponent(userId)}${qs}`;

    const res = await fetch(url);
    if (!res.ok) return { revisiones: 0, actividades: 0, tiempo: 0 };

    const data = await res.json();

    let totalTerminadas = 0;
    let actividadesConTerminadas = 0;
    let tiempoTotalTerminadas = 0;

    if (data?.actividades && Array.isArray(data.actividades)) {
      for (const actividad of data.actividades) {
        const terminadas = actividad?.revisiones?.terminadas || [];

        if (terminadas.length > 0) {
          actividadesConTerminadas++;
          totalTerminadas += terminadas.length;

          for (const revision of terminadas) {
            const duracion = Number(revision?.duracionMin ?? 0) || 0;
            tiempoTotalTerminadas += duracion;
          }
        }
      }
    }

    return {
      revisiones: totalTerminadas,
      actividades: actividadesConTerminadas,
      tiempo: tiempoTotalTerminadas,
    };
  } catch (error) {
    console.error(`Error obteniendo datos terminadas para ${userId}:`, error);
    return { revisiones: 0, actividades: 0, tiempo: 0 };
  }
}

export default function Productividad() {




  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const [toast, setToast] = useState({
  open: false,
  msg: "",
  severity: "info",
});
const isDelete = toast.msg?.eventName === "revision_eliminada";
const accent = isDelete ? "#f59e0b" : "#3b82f6";
const notify = useCallback((msg) => {
  setToast({ open: true, msg, severity: "info" });
}, []);
  const [, setSearchParams] = useSearchParams();
  const location = useLocation();

  const today = useMemo(() => hoyISO(), []);

  const [fecha, setFecha] = useState(() => {
    const sp = new URLSearchParams(location.search);
    return sp.get("date") || today;
  });

  useEffect(() => {
    const sp = new URLSearchParams(location.search);
    const d = sp.get("date") || today;
    setFecha(d);
  }, [location.search, today]);

  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [busqueda, setBusqueda] = useState("");

  // ✅ Este switch ahora controla el modo:
  // true  -> /api/productividad/hoy (planeado/proyección)
  // false -> /api/productividad/hoy?date=YYYY-MM-DD (real/hecho)
  const [mostrarTodasLasRevisiones, setMostrarTodasLasRevisiones] = useState(false);

  // ✅ SWITCH DEFAULT POR HORA (solo default, respeta al usuario)
  const [userTocoSwitch, setUserTocoSwitch] = useState(false);

  // ✅ AGREGA ESTO: ref siempre fresco para closures del socket/debounce
const mostrarRef = useRef(mostrarTodasLasRevisiones);
useEffect(() => {
  mostrarRef.current = mostrarTodasLasRevisiones;
}, [mostrarTodasLasRevisiones]);

  const [datosTerminadasCache, setDatosTerminadasCache] = useState({});
  const [usuariosCargando, setUsuariosCargando] = useState(new Set());

  const cargarRef = useRef(() => {});

  const patchTimerRef = useRef(null);
const patchAbortRef = useRef(null);
const pendingUserIdsRef = useRef(new Set());

const patchUsers = useCallback(async (userIds, msg) => {
  if (!Array.isArray(userIds) || userIds.length === 0) return;

  // acumula ids en la cola
  userIds.forEach((id) => pendingUserIdsRef.current.add(id));

  if (patchTimerRef.current) clearTimeout(patchTimerRef.current);

  patchTimerRef.current = setTimeout(async () => {
    const ids = Array.from(pendingUserIdsRef.current);
    pendingUserIdsRef.current.clear();

    // ✅ captura el modo AQUÍ dentro, cuando el timer ejecuta (no afuera)
    const mode = mostrarRef.current ? "agenda" : "hecho";

    // ✅ filtra por modo: si el evento es de otro modo, no apliques métricas
    if (Array.isArray(msg?.updatedUsers) && msg.updatedUsers.length > 0) {
      const modoEvento = msg?.useFechaCreacion === false ? "agenda" : "hecho";
      if (mode !== modoEvento) return; // modo incorrecto, ignorar
    }

    if (patchAbortRef.current) patchAbortRef.current.abort();
    const controller = new AbortController();
    patchAbortRef.current = controller;

    setUsuariosCargando((prev) => {
      const s = new Set(prev);
      ids.forEach((id) => s.add(id));
      return s;
    });

    try {
      const qs = `?date=${encodeURIComponent(fecha)}&mode=${mode}`;

      const updates = await Promise.all(
        ids.map(async (uid) => {
          const res = await fetch(
            `${BACKEND_URL}/api/productividad/usuario/${encodeURIComponent(uid)}${qs}`,
            { signal: controller.signal }
          );
          if (!res.ok) return null;
          const detalle = await res.json();
          return {
            user_id: uid,
            colaborador: detalle?.user?.colaborador,
            actividades: detalle?.resumen?.actividades ?? 0,
            revisiones: detalle?.resumen?.revisiones ?? 0,
            revisiones_con_duracion: detalle?.resumen?.revisiones_con_duracion ?? 0,
            revisiones_sin_duracion: detalle?.resumen?.revisiones_sin_duracion ?? 0,
            tiempo_total: detalle?.resumen?.tiempo_total ?? 0,
            prediccion: detalle?.prediccion ?? null,
          };
        })
      );

      const valid = updates.filter(Boolean);
      setData((prev) => {
        if (!prev?.users) return prev;
        const byId = new Map(prev.users.map((u) => [u.user_id, u]));
        for (const u of valid) {
          byId.set(u.user_id, { ...(byId.get(u.user_id) || {}), ...u });
        }
        return {
          ...prev,
          users: Array.from(byId.values()).sort((a, b) => (b.tiempo_total || 0) - (a.tiempo_total || 0)),
        };
      });
    } catch (e) {
      if (e?.name !== "AbortError") console.error("patchUsers fetch error:", e);
    } finally {
      setUsuariosCargando((prev) => {
        const s = new Set(prev);
        ids.forEach((id) => s.delete(id));
        return s;
      });
    }
  }, 0); // ✅ sin debounce aquí, el hook ya lo hace
}, [fecha]);


  const addDaysISO = (iso, delta) => {
    const d = new Date(`${iso}T00:00:00`);
    d.setDate(d.getDate() + delta);
    return d.toISOString().slice(0, 10);
  };

  const setFechaAndUrl = (next) => {
    setFecha(next);
    if (!next || next === today) {
      setSearchParams({}, { replace: true });
    } else {
      setSearchParams({ date: next }, { replace: true });
    }

    // ✅ SWITCH DEFAULT POR HORA: al cambiar fecha, vuelve a default
    setUserTocoSwitch(false);

    // Default a modo "real" al cambiar fecha (mantengo tu comportamiento)
    setMostrarTodasLasRevisiones(false);
    setDatosTerminadasCache({});
    setUsuariosCargando(new Set());
  };

  // ✅ SWITCH DEFAULT POR HORA:
  // - Hoy + antes de 11 => ON por default
  // - Hoy + después de 11 => OFF por default
  // - Si el usuario lo tocó, no se le pisa
  // - Si llegan las 11 con la página abierta, se apaga SOLO si no lo tocó
  useEffect(() => {
    const esHoy = fecha === today;

    if (!esHoy) {
      if (!userTocoSwitch) setMostrarTodasLasRevisiones(false);
      return;
    }

    if (!userTocoSwitch) {
      setMostrarTodasLasRevisiones(!pasaronLas11AM());
    }

    if (pasaronLas11AM()) return;

    const ms = msHastaLas11AM();
    const id = setTimeout(() => {
      setMostrarTodasLasRevisiones((prev) => (userTocoSwitch ? prev : false));
    }, ms);

    return () => clearTimeout(id);
  }, [fecha, today, userTocoSwitch]);
  const esHoy = useMemo(() => fecha === today, [fecha, today]);


  // ✅ FIX: siempre mostrar lo que venga de la API principal (hoy vs hoy?date)
  const debeRestringirRevisiones = false;


  const cargar = useCallback(async () => {
    setLoading(true);
    setErr("");
    try {
      const url = mostrarTodasLasRevisiones
        ? `${BACKEND_URL}/api/productividad/hoy`
        : `${BACKEND_URL}/api/productividad/hoy?date=${encodeURIComponent(fecha)}`;

      const res = await fetch(url);
      if (!res.ok) throw new Error(await res.text());
      const newData = await res.json();
      setData(newData);

      setDatosTerminadasCache({});
      setUsuariosCargando(new Set());
    } catch (e) {
      setErr(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  }, [fecha, mostrarTodasLasRevisiones]);

  useProductividadSocket({
  backendUrl: BACKEND_URL,
  day: fecha,
  enabled: true,
  onDayUpdate: notify,        // toast
  onPatchUsers: patchUsers,   // ✅ patch local
  onRefetch: cargar,          // fallback
  patchDebounceMs: 250,
});


useEffect(() => {
  cargarRef.current = cargar;
}, [cargar]);


  useEffect(() => {
    cargar();
    const id = setInterval(cargar, 5 * 60 * 1000);
    return () => clearInterval(id);
  }, [cargar]);

  const cargarDatosUsuario = useCallback(
    async (userId) => {
      if (datosTerminadasCache[userId] !== undefined || usuariosCargando.has(userId)) {
        return;
      }

      setUsuariosCargando((prev) => new Set(prev).add(userId));

      const datos = await obtenerDatosTerminadas(userId, fecha);

      setDatosTerminadasCache((prev) => ({
        ...prev,
        [userId]: datos,
      }));

      setUsuariosCargando((prev) => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    },
    [fecha, datosTerminadasCache, usuariosCargando]
  );

  const counts = useMemo(() => {
    const base = { todos: 0, productivo: 0, regular: 0, no_productivo: 0, sin_actividad: 0 };
    if (!data?.users) return base;

    base.todos = data.users.length;
    for (const u of data.users) {
      if ((Number(u?.tiempo_total ?? 0) || 0) === 0) base.sin_actividad += 1;
      else base[u?.prediccion?.label || "regular"] += 1;
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

  useEffect(() => {
    if (debeRestringirRevisiones && usuarios.length > 0) {
      usuarios.forEach((u) => {
        cargarDatosUsuario(u.user_id);
      });
    }
  }, [usuarios, debeRestringirRevisiones, cargarDatosUsuario]);

  const onGoDetalle = useCallback(
    (userId) => {
      const base = `/productividad/${encodeURIComponent(userId)}`;
      const url = fecha === today ? base : `${base}?date=${encodeURIComponent(fecha)}`;
      const from = location.pathname + location.search;
      navigate(url, { state: { from } });
    },
    [navigate, fecha, today, location.pathname, location.search]
  );

  if (err) {
    return (
      <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 4 } }}>
        <Paper
          sx={{
            p: { xs: 2, sm: 3 },
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
    <Box
      sx={{
        bgcolor: "#0a0e1a",
        width: "100%",
        py: { xs: 2, sm: 3, md: 4 },
      }}
    >
      <Container
        maxWidth="xl"
        disableGutters={isMobile}
        sx={{
          px: { xs: 2, sm: 3, md: 0 },
          maxWidth: "100%",
        }}
      >
        <Stack spacing={{ xs: 2.5, sm: 3.5, md: 4 }}>
          {/* Header */}
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={{ xs: 2, md: 3 }}
            alignItems={{ md: "center" }}
            justifyContent="space-between"
          >
            <Box sx={{ minWidth: 0 }}>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1, minWidth: 0 }}>
                <TrendingUpIcon sx={{ fontSize: { xs: 28, sm: 36, md: 40 }, color: "#3b82f6" }} />
                <Typography
                  variant="h3"
                  fontWeight={900}
                  sx={{
                    fontSize: { xs: 28, sm: 40, md: 52 },
                    lineHeight: 1.1,
                    background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    wordBreak: "break-word",
                  }}
                >
                  Panel de Productividad
                </Typography>
              </Stack>

              <Typography
                variant="body1"
                sx={{
                  color: "text.secondary",
                  ml: { xs: 0, sm: 7 },
                  fontSize: { xs: 13, sm: 16 },
                }}
              >
                {data ? `Predicción del día: ${data.date}` : "Cargando datos..."}
              </Typography>
            </Box>

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1.5}
              alignItems={{ sm: "center" }}
              sx={{ width: { xs: "100%", md: "auto" } }}
            >
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{
                  width: { xs: "100%", sm: "auto" },
                }}
              >
                <IconButton
                  onClick={() => setFechaAndUrl(addDaysISO(fecha, -1))}
                  sx={{
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 2,
                    flex: "0 0 auto",
                  }}
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
                    flex: 1,
                    minWidth: { xs: 0, sm: 170 },
                    "& .MuiOutlinedInput-root": {
                      bgcolor: "background.paper",
                      borderRadius: 2,
                      "&:hover": { bgcolor: alpha("#fff", 0.05) },
                    },
                  }}
                />

                <IconButton
                  onClick={() => setFechaAndUrl(addDaysISO(fecha, 1))}
                  sx={{
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 2,
                    flex: "0 0 auto",
                  }}
                  aria-label="Día siguiente"
                >
                  <ChevronRightRoundedIcon />
                </IconButton>
              </Stack>

              {esHoy && (
                <FormControlLabel
                  control={
                    <Switch
                      checked={mostrarTodasLasRevisiones}
                      onChange={() => {
                        setUserTocoSwitch(true);
                        setMostrarTodasLasRevisiones((prev) => !prev);
                        setData(null);
                      }}
                      sx={{
                        "& .MuiSwitch-switchBase.Mui-checked": {
                          color: "#3b82f6",
                          "&:hover": { bgcolor: alpha("#3b82f6", 0.08) },
                        },
                        "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                          backgroundColor: "#3b82f6",
                        },
                      }}
                    />
                  }
                  label={
                    <Typography
                      variant="body2"
                      sx={{ color: "text.secondary", fontSize: { xs: "0.85rem", sm: "0.9rem" } }}
                    >
                      {mostrarTodasLasRevisiones ? "Modo agenda (completo)" : "Modo hecho (solo terminadas)"}
                    </Typography>
                  }
                  sx={{ m: 0, ml: { xs: 0, sm: 1 } }}
                />
              )}



              <Button
                fullWidth={isMobile}
                variant="contained"
                startIcon={<RefreshOutlinedIcon />}
                onClick={cargar}
                disabled={loading}
                sx={{
                  borderRadius: 2,
                  px: { xs: 2.5, sm: 3 },
                  py: { xs: 1.1, sm: 1.15 },
                  background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
                  textTransform: "none",
                  fontWeight: 700,
                  boxShadow: "0 4px 14px rgba(59, 130, 246, 0.3)",
                  "&:hover": {
                    background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)",
                    boxShadow: "0 6px 20px rgba(59, 130, 246, 0.4)",
                  },
                  "&:disabled": { background: alpha("#3b82f6", 0.3) },
                  whiteSpace: "nowrap",
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
                boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
              }}
            >
              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Stack spacing={{ xs: 2, sm: 3 }}>
                  <Box
                    sx={{
                      overflowX: { xs: "auto", sm: "visible" },
                      WebkitOverflowScrolling: "touch",
                      pb: { xs: 0.5, sm: 0 },
                    }}
                  >
                    <ToggleButtonGroup
                      value={filtroEstado}
                      exclusive
                      onChange={(_, v) => v && setFiltroEstado(v)}
                      sx={{
                        flexWrap: { xs: "nowrap", sm: "wrap" },
                        gap: 1,
                        width: { xs: "max-content", sm: "100%" },
                        "& .MuiToggleButton-root": {
                          borderRadius: 2,
                          border: "1px solid",
                          borderColor: "divider",
                          textTransform: "none",
                          fontWeight: 600,
                          px: { xs: 2, sm: 2.5 },
                          py: 1,
                          whiteSpace: "nowrap",
                          "&.Mui-selected": {
                            background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
                            color: "white",
                            borderColor: "transparent",
                            "&:hover": {
                              background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)",
                            },
                          },
                        },
                      }}
                    >
                      <ToggleButton value="todos">Todos ({counts.todos})</ToggleButton>
                      <ToggleButton value="productivo">✓ Productivo ({counts.productivo})</ToggleButton>
                      <ToggleButton value="regular">~ Regular ({counts.regular})</ToggleButton>
                      <ToggleButton value="no_productivo">✗ No productivo ({counts.no_productivo})</ToggleButton>
                      <ToggleButton value="sin_actividad">○ Sin actividad ({counts.sin_actividad})</ToggleButton>
                    </ToggleButtonGroup>
                  </Box>

                  <TextField
                    size={isMobile ? "small" : "medium"}
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    placeholder="Buscar usuario por nombre..."
                    InputProps={{
                      startAdornment: <SearchOutlinedIcon sx={{ mr: 1.5, color: "text.secondary" }} />,
                    }}
                    sx={{
                      width: "100%",
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                        bgcolor: alpha("#fff", 0.03),
                        "&:hover": { bgcolor: alpha("#fff", 0.05) },
                      },
                    }}
                  />
                </Stack>
              </CardContent>
            </Card>
          )}

          {/* User Cards Grid */}
          <Grid container spacing={{ xs: 2, sm: 3 }}>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <Grid item key={`loading-${i}`} xs={12} sm={6} md={4}>
                  <LoadingCard />
                </Grid>
              ))
            ) : data && usuarios.length === 0 ? (
              <Grid item xs={12}>
                <Paper
                  sx={{
                    borderRadius: 3,
                    p: { xs: 3, sm: 6 },
                    textAlign: "center",
                    bgcolor: "background.paper",
                    border: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <SearchOutlinedIcon sx={{ fontSize: { xs: 44, sm: 64 }, color: "text.disabled", mb: 2 }} />
                  <Typography variant="h6" sx={{ color: "text.secondary", fontSize: { xs: 14, sm: 18 } }}>
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

                const datosOriginales = {
                  actividades: Number(u?.actividades ?? 0) || 0,
                  revisiones: Number(u?.revisiones ?? 0) || 0,
                  tiempo: Number(u?.tiempo_total ?? 0) || 0,
                };

                const datosTerminadas = datosTerminadasCache[u.user_id];
                const estaCargando = usuariosCargando.has(u.user_id);

                const mostrarRestringido = debeRestringirRevisiones;

                const actividadesAMostrar = mostrarRestringido ? (datosTerminadas?.actividades ?? 0) : datosOriginales.actividades;
                const revisionesAMostrar = mostrarRestringido ? (datosTerminadas?.revisiones ?? 0) : datosOriginales.revisiones;
                const tiempoAMostrar = mostrarRestringido ? (datosTerminadas?.tiempo ?? 0) : datosOriginales.tiempo;

                const labelRevisiones = mostrarRestringido ? "Terminadas" : "Revisiones";

                return (
                  <Grid item key={u.user_id} xs={12} sm={6} md={4}>
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
                          transform: isTablet ? "none" : "translateY(-4px)",
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
                        },
                      }}
                    >
                      <CardActionArea onClick={() => onGoDetalle(u.user_id)}>
                        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                          <Stack spacing={{ xs: 2, sm: 2.5 }}>
                            <Stack direction="row" spacing={2} alignItems="flex-start" justifyContent="space-between">
                              <Stack direction="row" spacing={2} alignItems="center" sx={{ flex: 1, minWidth: 0 }}>
                                <Avatar
                                  sx={{
                                    width: { xs: 44, sm: 48 },
                                    height: { xs: 44, sm: 48 },
                                    background: palette.gradient,
                                    fontWeight: 900,
                                    fontSize: { xs: 18, sm: 20 },
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
                                    sx={{ color: "text.primary", mb: 0.5, fontSize: { xs: 16, sm: 18 } }}
                                  >
                                    {u?.colaborador || "Usuario"}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      color: "text.secondary",
                                      display: "block",
                                      lineHeight: 1.4,
                                      fontSize: { xs: 11, sm: 12 },
                                    }}
                                  >
                                    {DESCRIPTIONS[label] || ""}
                                  </Typography>
                                </Box>
                              </Stack>

                              <Chip
                                label={prettyLabel(label)}
                                size={isMobile ? "small" : "medium"}
                                sx={{
                                  fontWeight: 800,
                                  borderRadius: 999,
                                  background: palette.gradient,
                                  color: "white",
                                  border: "none",
                                  boxShadow: `0 2px 8px ${palette.shadowColor}`,
                                  ml: 1,
                                }}
                              />
                            </Stack>

                            <Divider sx={{ borderColor: alpha("#fff", 0.08) }} />

                            <Grid container spacing={1.5}>
                              <Grid item xs={12} sm={4}>
                                <StatCard
                                  icon={ChecklistOutlinedIcon}
                                  value={actividadesAMostrar}
                                  label="Actividades"
                                  color="primary"
                                  loading={estaCargando && mostrarRestringido}
                                />
                              </Grid>
                              <Grid item xs={12} sm={4}>
                                <StatCard
                                  icon={AssignmentTurnedInOutlinedIcon}
                                  value={revisionesAMostrar}
                                  label={labelRevisiones}
                                  color="success"
                                  loading={estaCargando && mostrarRestringido}
                                />
                              </Grid>
                              <Grid item xs={12} sm={4}>
                                <StatCard
                                  icon={AccessTimeOutlinedIcon}
                                  value={formatearTiempo(tiempoAMostrar)}
                                  label="Tiempo"
                                  color="warning"
                                  loading={estaCargando && mostrarRestringido}
                                />
                              </Grid>
                            </Grid>

                            <Box
                              sx={{
                                p: { xs: 2, sm: 2.5 },
                                borderRadius: 2,
                                bgcolor: alpha("#fff", 0.02),
                                border: "1px solid",
                                borderColor: alpha("#fff", 0.05),
                              }}
                            >
                              <Typography
                                variant="subtitle2"
                                fontWeight={800}
                                sx={{
                                  mb: 2,
                                  color: "text.primary",
                                  textTransform: "uppercase",
                                  letterSpacing: 0.5,
                                  fontSize: { xs: 12, sm: 13 },
                                }}
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
    <Snackbar
  open={toast.open}
  autoHideDuration={4000}
  onClose={() => setToast((p) => ({ ...p, open: false }))}
  anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
>
  <Box
    sx={{
      position: "relative",
      minWidth: 300,
      maxWidth: 420,
      borderRadius: 3,
      overflow: "hidden",
      border: "1px solid",
      borderColor: alpha("#fff", 0.08),
      bgcolor: alpha("#0b1220", 0.78),
      backdropFilter: "blur(10px)",
      boxShadow: "0 18px 60px rgba(0,0,0,.55)",
    }}
  >
    {/* Acento izquierdo */}
    <Box
      sx={{
        position: "absolute",
        left: 0,
        top: 0,
        bottom: 0,
        width: 4,
        bgcolor: accent,
      }}
    />

    {/* Barra de progreso sutil arriba */}
    <LinearProgress
      variant="determinate"
      value={100}
      sx={{
        position: "absolute",
        left: 0,
        top: 0,
        width: "100%",
        height: 3,
        opacity: 0.6,
        bgcolor: alpha("#fff", 0.08),
        "& .MuiLinearProgress-bar": { bgcolor: alpha(accent, 0.9) },
      }}
    />

    <Stack direction="row" spacing={1.5} sx={{ p: 2, pl: 2.2 }} alignItems="flex-start">
      {/* Icono */}
      <Box
        sx={{
          width: 38,
          height: 38,
          borderRadius: 2,
          flexShrink: 0,
          display: "grid",
          placeItems: "center",
          bgcolor: alpha(accent, 0.14),
          border: "1px solid",
          borderColor: alpha(accent, 0.25),
        }}
      >
        {isDelete ? (
          <DeleteOutlineRoundedIcon sx={{ fontSize: 20, color: alpha(accent, 0.95) }} />
        ) : (
          <EditOutlinedIcon sx={{ fontSize: 20, color: alpha(accent, 0.95) }} />
        )}
      </Box>

      {/* Texto */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        {/* Header: etiqueta + cerrar */}
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 0.6 }}>
          <Box
            sx={{
              px: 1,
              py: 0.4,
              borderRadius: 99,
              bgcolor: alpha(accent, 0.14),
              border: "1px solid",
              borderColor: alpha(accent, 0.25),
            }}
          >
            <Typography
              sx={{
                color: alpha(accent, 0.95),
                fontWeight: 900,
                fontSize: 11,
                letterSpacing: 0.6,
                textTransform: "uppercase",
                lineHeight: 1,
              }}
            >
              {isDelete ? "Revisión eliminada" : "Revisión actualizada"}
            </Typography>
          </Box>

          <IconButton
            size="small"
            onClick={() => setToast((p) => ({ ...p, open: false }))}
            sx={{
              color: alpha("#fff", 0.35),
              mt: -0.8,
              mr: -0.8,
              "&:hover": { color: alpha("#fff", 0.9), bgcolor: alpha("#fff", 0.08) },
            }}
          >
            <CloseRoundedIcon fontSize="small" />
          </IconButton>
        </Stack>

        {/* Actividad (2 líneas) */}
        {toast.msg?.revisionInfo?.nombreActividad && (
          <Typography
            sx={{
              color: alpha("#fff", 0.92),
              fontWeight: 800,
              fontSize: 14,
              lineHeight: 1.2,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              textOverflow: "ellipsis",
              mb: 0.35,
            }}
          >
            {toast.msg.revisionInfo.nombreActividad}
          </Typography>
        )}

        {/* Revisión (1 línea + tooltip) */}
        {toast.msg?.revisionInfo?.nombreRevision && (
          <Tooltip title={toast.msg.revisionInfo.nombreRevision} arrow>
            <Typography
              noWrap
              sx={{
                color: alpha("#fff", 0.68),
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              {toast.msg.revisionInfo.nombreRevision}
            </Typography>
          </Tooltip>
        )}

        {/* Hora */}
        {toast.msg?.revisionInfo?.horario && (
          <Stack direction="row" spacing={0.6} alignItems="center" sx={{ mt: 0.9 }}>
            <AccessTimeOutlinedIcon sx={{ fontSize: 14, color: alpha("#fff", 0.35) }} />
            <Typography sx={{ color: alpha("#fff", 0.42), fontSize: 11, fontWeight: 600 }}>
              {(() => {
                try {
                  return new Date(toast.msg.revisionInfo.horario).toLocaleTimeString("es-MX", {
                    hour: "2-digit",
                    minute: "2-digit",
                    timeZone: "America/Mexico_City",
                  });
                } catch {
                  return "";
                }
              })()}
            </Typography>
          </Stack>
        )}
      </Box>
    </Stack>
  </Box>
</Snackbar>

    </Box>
  );
}
