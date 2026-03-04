// src/pages/Productividad.jsx
'use client';

import React, { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";

import { useConnection } from "../context/ConnectionContext";

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

function hoyISO_CDMX() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Mexico_City",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function mananaISO_CDMX() {
  const hoy = new Date();
  const dow = hoy.getDay();
  let delta = 1;
  if (dow === 5) delta = 3;
  if (dow === 6) delta = 2;
  hoy.setDate(hoy.getDate() + delta);
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Mexico_City",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(hoy);
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

function domainFromUserId(userId) {
  const email = String(userId || "").toLowerCase();
  const at = email.lastIndexOf("@");
  return at >= 0 ? email.slice(at + 1) : "";
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
        <Box sx={{ height: 8, borderRadius: 999, bgcolor: alpha(colorMap[color], 0.1), overflow: "hidden" }}>
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
    <Card sx={{ borderRadius: 3, bgcolor: "background.paper", border: "1px solid", borderColor: "divider" }}>
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
            <Grid item xs={12} sm={4}><Skeleton height={80} /></Grid>
            <Grid item xs={12} sm={4}><Skeleton height={80} /></Grid>
            <Grid item xs={12} sm={4}><Skeleton height={80} /></Grid>
          </Grid>
          <Skeleton height={120} />
        </Stack>
      </CardContent>
    </Card>
  );
}

function StatCard({ icon: Icon, value, total, label, color = "primary", loading = false }) {
  const colorMap = { primary: "#3b82f6", success: "#10b981", warning: "#f59e0b", error: "#ef4444" };

  const getFontSize = (str) => {
    const len = String(str ?? "").length;
    if (len <= 2) return { xs: 20, sm: 24 };
    if (len <= 4) return { xs: 18, sm: 22 };
    if (len <= 6) return { xs: 15, sm: 18 };
    return { xs: 13, sm: 15 };
  };

  const longestStr = total != null
    ? (String(value ?? "").length >= String(total ?? "").length ? String(value) : String(total))
    : String(value ?? "");

  const fontSize = getFontSize(longestStr);

  const displayValue = total != null ? (
    <>
      {value}
      <Typography component="span" sx={{ color: "text.disabled", fontWeight: 500, fontSize: "0.75em" }}>
        /{total}
      </Typography>
    </>
  ) : value;

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
        "&:hover": { bgcolor: alpha(colorMap[color], 0.12), transform: "translateY(-2px)" },
      }}
    >
      <Icon sx={{ fontSize: { xs: 24, sm: 28 }, color: colorMap[color], mb: 1 }} />
      <Typography variant="h5" fontWeight={900} sx={{ color: "text.primary", mb: 0.5, fontSize, lineHeight: 1.1, wordBreak: "break-word" }}>
        {loading ? <CircularProgress size={20} sx={{ color: colorMap[color] }} /> : displayValue}
      </Typography>
      <Typography variant="caption" sx={{ color: "text.secondary", textTransform: "uppercase", letterSpacing: 0.5, fontSize: { xs: 10, sm: 12 } }}>
        {label}
      </Typography>
    </Box>
  );
}

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
            tiempoTotalTerminadas += Number(revision?.duracionMin ?? 0) || 0;
          }
        }
      }
    }

    return { revisiones: totalTerminadas, actividades: actividadesConTerminadas, tiempo: tiempoTotalTerminadas };
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
  const [datosAgendaCache, setDatosAgendaCache] = useState({});

  const [prediccionManana, setPrediccionManana] = useState(null);
  const [loadingPrediccion, setLoadingPrediccion] = useState(false);
  const [userNamesMap, setUserNamesMap] = useState({});

  const [despues4PM, setDespues4PM] = useState(() => new Date().getHours() >= 16);

  const [toast, setToast] = useState({ open: false, msg: "", severity: "info" });
  const isDelete = toast.msg?.eventName === "revision_eliminada";
  const accent = isDelete ? "#f59e0b" : "#3b82f6";
  const notify = useCallback((msg) => { setToast({ open: true, msg, severity: "info" }); }, []);

  const [, setSearchParams] = useSearchParams();
  const location = useLocation();

  const today = useMemo(() => hoyISO_CDMX(), []);
  const manana = useMemo(() => mananaISO_CDMX(), []);

  const [fecha, setFecha] = useState(() => {
    const sp = new URLSearchParams(location.search);
    return sp.get("date") || today;
  });

  useEffect(() => {
    const sp = new URLSearchParams(location.search);
    const d = sp.get("date") || today;
    setFecha(d);
  }, [location.search, today]);

  useEffect(() => {
    if (despues4PM) return;
    const ahora = new Date();
    const objetivo = new Date();
    objetivo.setHours(16, 0, 0, 0);
    const ms = objetivo.getTime() - ahora.getTime();
    if (ms <= 0) { setDespues4PM(true); return; }
    const id = setTimeout(() => setDespues4PM(true), ms);
    return () => clearTimeout(id);
  }, [despues4PM]);

  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [filtroTipo, setFiltroTipo] = useState("todos");
  const [busqueda, setBusqueda] = useState("");
  const [mostrarTodasLasRevisiones, setMostrarTodasLasRevisiones] = useState(false);
  const [userTocoSwitch, setUserTocoSwitch] = useState(false);

  const mostrarRef = useRef(mostrarTodasLasRevisiones);
  useEffect(() => { mostrarRef.current = mostrarTodasLasRevisiones; }, [mostrarTodasLasRevisiones]);

  const fechaRef = useRef(fecha);
  useEffect(() => { fechaRef.current = fecha; }, [fecha]);

  const [datosTerminadasCache, setDatosTerminadasCache] = useState({});
  const [usuariosCargando, setUsuariosCargando] = useState(new Set());
  const cargarRef = useRef(() => { });
  const patchAbortRef = useRef(null);

  const esHoy = useMemo(() => fecha === today, [fecha, today]);
  const esManana = useMemo(() => fecha === manana, [fecha, manana]);

  useEffect(() => {
    if (!esManana) {
      setPrediccionManana(null);
      return;
    }
    setLoadingPrediccion(true);
    Promise.all([
      fetch(`${BACKEND_URL}/api/productividad/prediccion-manana`).then((r) => r.json()),
      fetch(`${BACKEND_URL}/api/productividad/hoy`).then((r) => r.json()).catch(() => null),
    ])
      .then(([pred, hoy]) => {
        setPrediccionManana(pred);
        if (hoy?.users) {
          const map = {};
          for (const u of hoy.users) {
            if (u.user_id && u.colaborador) map[u.user_id] = u.colaborador;
          }
          setUserNamesMap(map);
        }
      })
      .catch(() => setPrediccionManana(null))
      .finally(() => setLoadingPrediccion(false));
  }, [esManana]);

  const patchUsers = useCallback(async (userIds, msg) => {
    if (!Array.isArray(userIds) || userIds.length === 0) return;
    const mode = mostrarRef.current ? "agenda" : "hecho";
    if (Array.isArray(msg?.updatedUsers) && msg.updatedUsers.length > 0) {
      const modoEvento = msg?.useFechaCreacion === false ? "agenda" : "hecho";
      if (mode !== modoEvento) return;
    }
    if (patchAbortRef.current) patchAbortRef.current.abort();
    const controller = new AbortController();
    patchAbortRef.current = controller;
    setUsuariosCargando((prev) => { const s = new Set(prev); userIds.forEach((id) => s.add(id)); return s; });

    try {
      const fechaActual = fechaRef.current;
      const qs = `?date=${encodeURIComponent(fechaActual)}&mode=${mode}`;
      const updates = await Promise.all(
        userIds.map(async (uid) => {
          const res = await fetch(`${BACKEND_URL}/api/productividad/usuario/${encodeURIComponent(uid)}${qs}`, { signal: controller.signal });
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
        for (const u of valid) byId.set(u.user_id, { ...(byId.get(u.user_id) || {}), ...u });
        return { ...prev, users: Array.from(byId.values()).sort((a, b) => (b.tiempo_total || 0) - (a.tiempo_total || 0)) };
      });
      if (mode === "agenda") {
        setDatosAgendaCache((prev) => {
          const next = { ...prev };
          for (const u of valid) next[u.user_id] = { actividades: u.actividades ?? 0, revisiones: u.revisiones ?? 0, tiempo: u.tiempo_total ?? 0 };
          return next;
        });
      }
    } catch (e) {
      if (e?.name !== "AbortError") console.error("patchUsers fetch error:", e);
    } finally {
      setUsuariosCargando((prev) => { const s = new Set(prev); userIds.forEach((id) => s.delete(id)); return s; });
    }
  }, []);

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
    setUserTocoSwitch(false);
    setMostrarTodasLasRevisiones(false);
    setDatosTerminadasCache({});
    setDatosAgendaCache({});
    setUsuariosCargando(new Set());
    setFiltroTipo("todos");
  };

  useEffect(() => {
    if (!esHoy) {
      if (!userTocoSwitch) setMostrarTodasLasRevisiones(false);
      return;
    }
    if (!userTocoSwitch) setMostrarTodasLasRevisiones(!pasaronLas11AM());
    if (pasaronLas11AM()) return;
    const ms = msHastaLas11AM();
    const id = setTimeout(() => { setMostrarTodasLasRevisiones((prev) => (userTocoSwitch ? prev : false)); }, ms);
    return () => clearTimeout(id);
  }, [fecha, today, userTocoSwitch, esHoy]);

  const debeRestringirRevisiones = false;

  const cargarAgendaBackground = useCallback(async () => {
    if (!esHoy) return;
    try {
      const res = await fetch(`${BACKEND_URL}/api/productividad/hoy`);
      if (!res.ok) return;
      const agendaData = await res.json();
      if (!agendaData?.users) return;
      const cache = {};
      for (const u of agendaData.users) {
        cache[u.user_id] = { actividades: Number(u.actividades ?? 0), revisiones: Number(u.revisiones ?? 0), tiempo: Number(u.tiempo_total ?? 0) };
      }
      setDatosAgendaCache(cache);
    } catch (e) {
      console.error("cargarAgendaBackground error:", e);
    }
  }, [esHoy]);

  const cargar = useCallback(async () => {
    if (esManana) return;
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
      if (mostrarTodasLasRevisiones && newData?.users) {
        const cache = {};
        for (const u of newData.users) {
          cache[u.user_id] = { actividades: Number(u.actividades ?? 0), revisiones: Number(u.revisiones ?? 0), tiempo: Number(u.tiempo_total ?? 0) };
        }
        setDatosAgendaCache(cache);
      }
      setDatosTerminadasCache({});
      setUsuariosCargando(new Set());
    } catch (e) {
      setErr(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  }, [fecha, mostrarTodasLasRevisiones, esManana]);

  const onRefetchStable = useCallback((...args) => { cargarRef.current?.(...args); }, []);
  const { setConnected } = useConnection();

  useProductividadSocket({
    backendUrl: BACKEND_URL,
    day: fecha,
    enabled: true,
    onDayUpdate: notify,
    onPatchUsers: patchUsers,
    onRefetch: onRefetchStable,
    onConnectionChange: setConnected,
    patchDebounceMs: 250,
  });

  useEffect(() => { cargarRef.current = cargar; }, [cargar]);
  useEffect(() => { cargarAgendaBackground(); }, [cargarAgendaBackground, mostrarTodasLasRevisiones]);
  useEffect(() => {
    cargar();
    const id = setInterval(cargar, 5 * 60 * 1000);
    return () => clearInterval(id);
  }, [cargar]);

  const cargarDatosUsuario = useCallback(async (userId) => {
    if (datosTerminadasCache[userId] !== undefined || usuariosCargando.has(userId)) return;
    setUsuariosCargando((prev) => new Set(prev).add(userId));
    const datos = await obtenerDatosTerminadas(userId, fecha);
    setDatosTerminadasCache((prev) => ({ ...prev, [userId]: datos }));
    setUsuariosCargando((prev) => { const newSet = new Set(prev); newSet.delete(userId); return newSet; });
  }, [fecha, datosTerminadasCache, usuariosCargando]);

  const counts = useMemo(() => {
    const base = { todos: 0, productivo: 0, regular: 0, no_productivo: 0, sin_actividad: 0 };
    if (!data?.users) return base;

    let usuariosFiltradosPorTipo = data.users;
    if (filtroTipo !== "todos") {
      usuariosFiltradosPorTipo = data.users.filter((u) => {
        const domain = u?.dominio || domainFromUserId(u?.user_id);
        if (filtroTipo === "print") return domain === "pprin.com";
        if (filtroTipo === "practicante") return domain === "practicante.com";
        return true;
      });
    }

    base.todos = usuariosFiltradosPorTipo.length;
    for (const u of usuariosFiltradosPorTipo) {
      if ((Number(u?.tiempo_total ?? 0) || 0) === 0) base.sin_actividad += 1;
      else base[u?.prediccion?.label || "regular"] += 1;
    }
    return base;
  }, [data, filtroTipo]);

  const usuarios = useMemo(() => {
    if (!data?.users) return [];
    let usuariosRaw = data.users;

    if (filtroTipo !== "todos") {
      usuariosRaw = usuariosRaw.filter((u) => {
        const domain = u?.dominio || domainFromUserId(u?.user_id);
        if (filtroTipo === "print") return domain === "pprin.com";
        if (filtroTipo === "practicante") return domain === "practicante.com";
        return true;
      });
    }

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
  }, [data, busqueda, filtroEstado, filtroTipo]);

  useEffect(() => {
    if (debeRestringirRevisiones && usuarios.length > 0) {
      usuarios.forEach((u) => { cargarDatosUsuario(u.user_id); });
    }
  }, [usuarios, debeRestringirRevisiones, cargarDatosUsuario]);

  const onGoDetalle = useCallback((userId) => {
    const base = `/productividad/${encodeURIComponent(userId)}`;
    const url = fecha === today ? base : `${base}?date=${encodeURIComponent(fecha)}`;
    const from = location.pathname + location.search;
    navigate(url, { state: { from } });
  }, [navigate, fecha, today, location.pathname, location.search]);

  const parpadeoSx = {
    "@keyframes parpadeo": {
      "0%, 100%": { opacity: 1, boxShadow: "0 0 0 0 rgba(139, 92, 246, 0)" },
      "50%": { opacity: 0.85, boxShadow: "0 0 12px 4px rgba(139, 92, 246, 0.6)" },
    },
    animation: "parpadeo 1.8s ease-in-out infinite",
  };

  const toggleButtonGroupSx = {
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
        "&:hover": { background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)" },
      },
    },
  };

  if (err) {
    return (
      <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 4 } }}>
        <Paper sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3, bgcolor: alpha("#ef4444", 0.1), border: "1px solid", borderColor: alpha("#ef4444", 0.3) }}>
          <Typography color="error" variant="body1" fontWeight={600}>{err}</Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Box sx={{ bgcolor: "#0a0e1a", width: "100%", py: { xs: 2, sm: 3, md: 4 } }}>
      <Container maxWidth="xl" disableGutters={isMobile} sx={{ px: { xs: 2, sm: 3, md: 0 }, maxWidth: "100%" }}>
        <Stack spacing={{ xs: 2.5, sm: 3.5, md: 4 }}>

          {/* Header */}
          <Stack direction={{ xs: "column", md: "row" }} spacing={{ xs: 2, md: 3 }} alignItems={{ md: "center" }} justifyContent="space-between">
            <Box sx={{ minWidth: 0 }}>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1, minWidth: 0 }}>
                <TrendingUpIcon sx={{ fontSize: { xs: 28, sm: 36, md: 40 }, color: "#3b82f6" }} />
                <Typography variant="h3" fontWeight={900} sx={{ fontSize: { xs: 28, sm: 40, md: 52 }, lineHeight: 1.1, background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", wordBreak: "break-word" }}>
                  Panel de Productividad
                </Typography>
              </Stack>
              <Typography variant="body1" sx={{ color: "text.secondary", ml: { xs: 0, sm: 7 }, fontSize: { xs: 13, sm: 16 } }}>
                {esManana
                  ? `Predicción para mañana: ${fecha}`
                  : data ? `Predicción del día: ${data.date}` : "Cargando datos..."}
              </Typography>
            </Box>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems={{ sm: "center" }} sx={{ width: { xs: "100%", md: "auto" } }}>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ width: { xs: "100%", sm: "auto" } }}>
                <IconButton onClick={() => setFechaAndUrl(addDaysISO(fecha, -1))} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2, flex: "0 0 auto" }} aria-label="Día anterior">
                  <ChevronLeftRoundedIcon />
                </IconButton>
                <TextField
                  type="date" size="small" value={fecha}
                  onChange={(e) => setFechaAndUrl(e.target.value)}
                  sx={{ flex: 1, minWidth: { xs: 0, sm: 170 }, "& .MuiOutlinedInput-root": { bgcolor: "background.paper", borderRadius: 2, "&:hover": { bgcolor: alpha("#fff", 0.05) } } }}
                />
                <IconButton onClick={() => setFechaAndUrl(addDaysISO(fecha, 1))} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2, flex: "0 0 auto" }} aria-label="Día siguiente">
                  <ChevronRightRoundedIcon />
                </IconButton>
              </Stack>

              {esHoy && (
                <FormControlLabel
                  control={
                    <Switch
                      checked={mostrarTodasLasRevisiones}
                      onChange={() => { setUserTocoSwitch(true); setMostrarTodasLasRevisiones((prev) => !prev); setData(null); setDatosTerminadasCache({}); setUsuariosCargando(new Set()); }}
                      sx={{ "& .MuiSwitch-switchBase.Mui-checked": { color: "#3b82f6", "&:hover": { bgcolor: alpha("#3b82f6", 0.08) } }, "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { backgroundColor: "#3b82f6" } }}
                    />
                  }
                  label={<Typography variant="body2" sx={{ color: "text.secondary", fontSize: { xs: "0.85rem", sm: "0.9rem" } }}>{mostrarTodasLasRevisiones ? "Modo agenda (completo)" : "Modo hecho (solo terminadas)"}</Typography>}
                  sx={{ m: 0, ml: { xs: 0, sm: 1 } }}
                />
              )}

              {!esManana && (
                <Button
                  fullWidth={isMobile} variant="contained" startIcon={<RefreshOutlinedIcon />}
                  onClick={cargar} disabled={loading}
                  sx={{ borderRadius: 2, px: { xs: 2.5, sm: 3 }, py: { xs: 1.1, sm: 1.15 }, background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)", textTransform: "none", fontWeight: 700, boxShadow: "0 4px 14px rgba(59, 130, 246, 0.3)", "&:hover": { background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)", boxShadow: "0 6px 20px rgba(59, 130, 246, 0.4)" }, "&:disabled": { background: alpha("#3b82f6", 0.3) }, whiteSpace: "nowrap" }}
                >
                  {loading ? "Cargando..." : "Actualizar"}
                </Button>
              )}

              {(despues4PM || esManana) && (
                <Button
                  fullWidth={isMobile}
                  variant={esManana ? "contained" : "outlined"}
                  onClick={() => setFechaAndUrl(esManana ? today : manana)}
                  sx={{
                    borderRadius: 2,
                    px: { xs: 2.5, sm: 3 },
                    py: { xs: 1.1, sm: 1.15 },
                    background: esManana
                      ? "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)"
                      : "transparent",
                    borderColor: "#8b5cf6",
                    color: esManana ? "white" : "#8b5cf6",
                    textTransform: "none",
                    fontWeight: 700,
                    whiteSpace: "nowrap",
                    "&:hover": {
                      background: "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)",
                      color: "white",
                      borderColor: "#8b5cf6",
                    },
                    ...(!esManana ? parpadeoSx : {}),
                  }}
                >
                  {esManana ? "Ver hoy" : "Predicción mañana"}
                </Button>
              )}
            </Stack>
          </Stack>

          {/* Filters */}
          {!esManana && data && (
            <Card sx={{ borderRadius: 3, bgcolor: "background.paper", border: "1px solid", borderColor: "divider", boxShadow: "0 4px 20px rgba(0,0,0,0.3)" }}>
              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Stack spacing={{ xs: 2, sm: 3 }}>

                  {/* Filtro por tipo de usuario */}
                  <Box>
                    <Typography variant="caption" sx={{ color: "text.disabled", textTransform: "uppercase", letterSpacing: 0.8, fontWeight: 700, fontSize: 11, mb: 1, display: "block" }}>
                      Tipo de usuario
                    </Typography>
                    <Box sx={{ overflowX: { xs: "auto", sm: "visible" }, WebkitOverflowScrolling: "touch", pb: { xs: 0.5, sm: 0 } }}>
                      <ToggleButtonGroup
                        value={filtroTipo} exclusive onChange={(_, v) => v && setFiltroTipo(v)}
                        sx={{ ...toggleButtonGroupSx, width: { xs: "max-content", sm: "auto" } }}
                      >
                        <ToggleButton value="todos">Todos</ToggleButton>
                        <ToggleButton value="print">Print</ToggleButton>
                        <ToggleButton value="practicante">Practicantes</ToggleButton>
                      </ToggleButtonGroup>
                    </Box>
                  </Box>

                  <Divider sx={{ borderColor: alpha("#fff", 0.06) }} />

                  {/* Filtro por estado de productividad */}
                  <Box>
                    <Typography variant="caption" sx={{ color: "text.disabled", textTransform: "uppercase", letterSpacing: 0.8, fontWeight: 700, fontSize: 11, mb: 1, display: "block" }}>
                      Estado de productividad
                    </Typography>
                    <Box sx={{ overflowX: { xs: "auto", sm: "visible" }, WebkitOverflowScrolling: "touch", pb: { xs: 0.5, sm: 0 } }}>
                      <ToggleButtonGroup
                        value={filtroEstado} exclusive onChange={(_, v) => v && setFiltroEstado(v)}
                        sx={toggleButtonGroupSx}
                      >
                        <ToggleButton value="todos">Todos ({counts.todos})</ToggleButton>
                        <ToggleButton value="productivo">Productivo ({counts.productivo})</ToggleButton>
                        <ToggleButton value="regular">Regular ({counts.regular})</ToggleButton>
                        <ToggleButton value="no_productivo">No productivo ({counts.no_productivo})</ToggleButton>
                        <ToggleButton value="sin_actividad">Sin actividad ({counts.sin_actividad})</ToggleButton>
                      </ToggleButtonGroup>
                    </Box>
                  </Box>

                  {/* Buscador */}
                  <TextField
                    size={isMobile ? "small" : "medium"} value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
                    placeholder="Buscar usuario por nombre..."
                    InputProps={{ startAdornment: <SearchOutlinedIcon sx={{ mr: 1.5, color: "text.secondary" }} /> }}
                    sx={{ width: "100%", "& .MuiOutlinedInput-root": { borderRadius: 2, bgcolor: alpha("#fff", 0.03), "&:hover": { bgcolor: alpha("#fff", 0.05) } } }}
                  />
                </Stack>
              </CardContent>
            </Card>
          )}

          {/* Grid de tarjetas */}
          <Grid container spacing={{ xs: 2, sm: 3 }}>

            {esManana ? (
              loadingPrediccion ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <Grid item key={`pred-loading-${i}`} xs={12} sm={6} md={4}>
                    <LoadingCard />
                  </Grid>
                ))
              ) : !prediccionManana || prediccionManana.mensaje !== "ok" ? (
                <Grid item xs={12}>
                  <Paper sx={{ borderRadius: 3, p: { xs: 3, sm: 6 }, textAlign: "center", bgcolor: "background.paper", border: "1px solid", borderColor: "divider" }}>
                    <TrendingUpIcon sx={{ fontSize: { xs: 44, sm: 64 }, color: "text.disabled", mb: 2 }} />
                    <Typography variant="h6" sx={{ color: "text.secondary", fontSize: { xs: 14, sm: 18 } }}>
                      {prediccionManana?.detalle || "No hay suficiente historial para predecir mañana."}
                    </Typography>
                  </Paper>
                </Grid>
              ) : (
                <>
                  <Grid item xs={12}>
                    <Paper sx={{ borderRadius: 3, p: { xs: 2, sm: 3 }, bgcolor: "background.paper", border: "1px solid", borderColor: alpha("#3b82f6", 0.3), background: `linear-gradient(135deg, ${alpha("#3b82f6", 0.08)} 0%, ${alpha("#8b5cf6", 0.08)} 100%)` }}>
                      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ sm: "center" }} justifyContent="space-between">
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <TrendingUpIcon sx={{ color: "#3b82f6", fontSize: 28 }} />
                          <Box>
                            <Typography variant="h6" fontWeight={800} sx={{ color: "text.primary", fontSize: { xs: 15, sm: 18 } }}>
                              Predicción para mañana — {fecha}
                            </Typography>
                            <Typography variant="caption" sx={{ color: "text.secondary" }}>
                              Basada en los últimos {prediccionManana.predicciones[0]?.n_observaciones || "?"} días de historial por usuario
                            </Typography>
                          </Box>
                        </Stack>
                        <Stack direction="row" spacing={1} flexWrap="wrap">
                          <Chip label={`${prediccionManana.resumen_equipo.productivos} productivos`} sx={{ bgcolor: alpha("#10b981", 0.15), color: "#10b981", fontWeight: 700 }} />
                          <Chip label={`${prediccionManana.resumen_equipo.regulares} regulares`} sx={{ bgcolor: alpha("#f59e0b", 0.15), color: "#f59e0b", fontWeight: 700 }} />
                          <Chip label={`${prediccionManana.resumen_equipo.no_productivos} no productivos`} sx={{ bgcolor: alpha("#ef4444", 0.15), color: "#ef4444", fontWeight: 700 }} />
                        </Stack>
                      </Stack>
                    </Paper>
                  </Grid>

                  {prediccionManana.predicciones.map((pred) => {
                    const palette = getPredPalette(pred.label);
                    const pct = Math.round(pred.score_predicho * 100);
                    return (
                      <Grid item key={pred.user_id} xs={12} sm={6} md={4}>
                        <Card
                          sx={{
                            borderRadius: 3, bgcolor: "background.paper", border: "1px solid", borderColor: "divider",
                            position: "relative", overflow: "hidden", transition: "all 0.3s ease",
                            "&:hover": { transform: "translateY(-4px)", boxShadow: `0 12px 32px ${palette.shadowColor}`, borderColor: palette.avatarBg },
                            "&::before": { content: '""', position: "absolute", top: 0, left: 0, right: 0, height: 4, background: palette.gradient },
                          }}
                        >
                          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                            <Stack spacing={2}>
                              <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
                                <Stack direction="row" spacing={2} alignItems="center" sx={{ flex: 1, minWidth: 0 }}>
                                  <Avatar sx={{ width: { xs: 44, sm: 48 }, height: { xs: 44, sm: 48 }, background: palette.gradient, fontWeight: 900, fontSize: { xs: 18, sm: 20 }, boxShadow: `0 4px 12px ${palette.shadowColor}` }}>
                                    {(userNamesMap[pred.user_id] || pred.user_id).charAt(0).toUpperCase()}
                                  </Avatar>
                                  <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Typography variant="h6" fontWeight={800} noWrap sx={{ color: "text.primary", fontSize: { xs: 15, sm: 17 } }}>
                                      {userNamesMap[pred.user_id] || pred.user_id.slice(0, 8) + "..."}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: "text.secondary", fontSize: 12 }}>
                                      Score hoy: <strong style={{ color: "white" }}>{pred.score_hoy.toFixed(2)}</strong>
                                    </Typography>
                                  </Box>
                                </Stack>
                                <Chip
                                  label={prettyLabel(pred.label)} size="small"
                                  sx={{ fontWeight: 800, borderRadius: 999, background: palette.gradient, color: "white", border: "none", boxShadow: `0 2px 8px ${palette.shadowColor}` }}
                                />
                              </Stack>

                              <Divider sx={{ borderColor: alpha("#fff", 0.08) }} />

                              <Box>
                                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                                  <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>
                                    Score predicho mañana
                                  </Typography>
                                  <Typography variant="body2" fontWeight={800} sx={{ color: palette.avatarBg }}>
                                    {pct}%
                                  </Typography>
                                </Stack>
                                <Box sx={{ height: 8, borderRadius: 999, bgcolor: alpha(palette.avatarBg, 0.1), overflow: "hidden" }}>
                                  <Box sx={{ height: "100%", width: `${pct}%`, background: palette.gradient, borderRadius: 999, transition: "width 0.8s ease-in-out" }} />
                                </Box>
                              </Box>
                            </Stack>
                          </CardContent>
                        </Card>
                      </Grid>
                    );
                  })}
                </>
              )
            ) : (
              loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <Grid item key={`loading-${i}`} xs={12} sm={6} md={4}>
                    <LoadingCard />
                  </Grid>
                ))
              ) : data && usuarios.length === 0 ? (
                <Grid item xs={12}>
                  <Paper sx={{ borderRadius: 3, p: { xs: 3, sm: 6 }, textAlign: "center", bgcolor: "background.paper", border: "1px solid", borderColor: "divider" }}>
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
                  const datosOriginales = { actividades: Number(u?.actividades ?? 0) || 0, revisiones: Number(u?.revisiones ?? 0) || 0, tiempo: Number(u?.tiempo_total ?? 0) || 0 };
                  const datosTerminadas = datosTerminadasCache[u.user_id];
                  const estaCargando = usuariosCargando.has(u.user_id);
                  const mostrarRestringido = debeRestringirRevisiones;
                  const actividadesAMostrar = mostrarRestringido ? (datosTerminadas?.actividades ?? 0) : datosOriginales.actividades;
                  const agendaRef = datosAgendaCache[u.user_id];
                  const mostrarFraccion = esHoy && !mostrarTodasLasRevisiones && !!agendaRef;
                  const totalActividades = mostrarFraccion ? agendaRef.actividades : undefined;
                  const totalRevisiones = mostrarFraccion ? agendaRef.revisiones : undefined;
                  const totalTiempo = mostrarFraccion ? formatearTiempo(agendaRef.tiempo) : undefined;
                  const revisionesAMostrar = mostrarRestringido ? (datosTerminadas?.revisiones ?? 0) : datosOriginales.revisiones;
                  const tiempoAMostrar = mostrarRestringido ? (datosTerminadas?.tiempo ?? 0) : datosOriginales.tiempo;
                  const labelRevisiones = mostrarRestringido ? "Terminadas" : "Revisiones";

                  return (
                    <Grid item key={u.user_id} xs={12} sm={6} md={4}>
                      <Card
                        sx={{
                          borderRadius: 3, bgcolor: "background.paper", border: "1px solid", borderColor: "divider",
                          transition: "all 0.3s ease", position: "relative", overflow: "hidden",
                          "&:hover": { transform: isTablet ? "none" : "translateY(-4px)", boxShadow: `0 12px 32px ${palette.shadowColor}`, borderColor: palette.avatarBg },
                          "&::before": { content: '""', position: "absolute", top: 0, left: 0, right: 0, height: 4, background: palette.gradient },
                        }}
                      >
                        <CardActionArea onClick={() => onGoDetalle(u.user_id)}>
                          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                            <Stack spacing={{ xs: 2, sm: 2.5 }}>
                              <Stack direction="row" spacing={2} alignItems="flex-start" justifyContent="space-between">
                                <Stack direction="row" spacing={2} alignItems="center" sx={{ flex: 1, minWidth: 0 }}>
                                  <Avatar sx={{ width: { xs: 44, sm: 48 }, height: { xs: 44, sm: 48 }, background: palette.gradient, fontWeight: 900, fontSize: { xs: 18, sm: 20 }, boxShadow: `0 4px 12px ${palette.shadowColor}` }}>
                                    {(u?.colaborador || "U").charAt(0).toUpperCase()}
                                  </Avatar>
                                  <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Typography variant="h6" fontWeight={800} noWrap sx={{ color: "text.primary", mb: 0.5, fontSize: { xs: 16, sm: 18 } }}>
                                      {u?.colaborador || "Usuario"}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: "text.secondary", display: "block", lineHeight: 1.4, fontSize: { xs: 11, sm: 12 } }}>
                                      {DESCRIPTIONS[label] || ""}
                                    </Typography>
                                  </Box>
                                </Stack>
                                <Chip label={prettyLabel(label)} size={isMobile ? "small" : "medium"} sx={{ fontWeight: 800, borderRadius: 999, background: palette.gradient, color: "white", border: "none", boxShadow: `0 2px 8px ${palette.shadowColor}`, ml: 1 }} />
                              </Stack>

                              <Divider sx={{ borderColor: alpha("#fff", 0.08) }} />

                              <Grid container spacing={1.5}>
                                <Grid item xs={12} sm={4}><StatCard icon={ChecklistOutlinedIcon} value={actividadesAMostrar} total={totalActividades} label="Actividades" color="primary" loading={estaCargando && mostrarRestringido} /></Grid>
                                <Grid item xs={12} sm={4}><StatCard icon={AssignmentTurnedInOutlinedIcon} value={revisionesAMostrar} total={totalRevisiones} label={labelRevisiones} color="success" loading={estaCargando && mostrarRestringido} /></Grid>
                                <Grid item xs={12} sm={4}><StatCard icon={AccessTimeOutlinedIcon} value={formatearTiempo(tiempoAMostrar)} total={totalTiempo} label="Tiempo" color="warning" loading={estaCargando && mostrarRestringido} /></Grid>
                              </Grid>

                              <Box sx={{ p: { xs: 2, sm: 2.5 }, borderRadius: 2, bgcolor: alpha("#fff", 0.02), border: "1px solid", borderColor: alpha("#fff", 0.05) }}>
                                <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 2, color: "text.primary", textTransform: "uppercase", letterSpacing: 0.5, fontSize: { xs: 12, sm: 13 } }}>
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
              )
            )}
          </Grid>

        </Stack>
      </Container>

      <Snackbar open={toast.open} autoHideDuration={4000} onClose={() => setToast((p) => ({ ...p, open: false }))} anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
        <Box sx={{ position: "relative", minWidth: 300, maxWidth: 420, borderRadius: 3, overflow: "hidden", border: "1px solid", borderColor: alpha("#fff", 0.08), bgcolor: alpha("#0b1220", 0.78), backdropFilter: "blur(10px)", boxShadow: "0 18px 60px rgba(0,0,0,.55)" }}>
          <Box sx={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 4, bgcolor: accent }} />
          <LinearProgress variant="determinate" value={100} sx={{ position: "absolute", left: 0, top: 0, width: "100%", height: 3, opacity: 0.6, bgcolor: alpha("#fff", 0.08), "& .MuiLinearProgress-bar": { bgcolor: alpha(accent, 0.9) } }} />
          <Stack direction="row" spacing={1.5} sx={{ p: 2, pl: 2.2 }} alignItems="flex-start">
            <Box sx={{ width: 38, height: 38, borderRadius: 2, flexShrink: 0, display: "grid", placeItems: "center", bgcolor: alpha(accent, 0.14), border: "1px solid", borderColor: alpha(accent, 0.25) }}>
              {isDelete ? <DeleteOutlineRoundedIcon sx={{ fontSize: 20, color: alpha(accent, 0.95) }} /> : <EditOutlinedIcon sx={{ fontSize: 20, color: alpha(accent, 0.95) }} />}
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 0.6 }}>
                <Box sx={{ px: 1, py: 0.4, borderRadius: 99, bgcolor: alpha(accent, 0.14), border: "1px solid", borderColor: alpha(accent, 0.25) }}>
                  <Typography sx={{ color: alpha(accent, 0.95), fontWeight: 900, fontSize: 11, letterSpacing: 0.6, textTransform: "uppercase", lineHeight: 1 }}>
                    {isDelete ? "Revisión eliminada" : "Revisión actualizada"}
                  </Typography>
                </Box>
                <IconButton size="small" onClick={() => setToast((p) => ({ ...p, open: false }))} sx={{ color: alpha("#fff", 0.35), mt: -0.8, mr: -0.8, "&:hover": { color: alpha("#fff", 0.9), bgcolor: alpha("#fff", 0.08) } }}>
                  <CloseRoundedIcon fontSize="small" />
                </IconButton>
              </Stack>
              {toast.msg?.revisionInfo?.nombreActividad && (
                <Typography sx={{ color: alpha("#fff", 0.92), fontWeight: 800, fontSize: 14, lineHeight: 1.2, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", textOverflow: "ellipsis", mb: 0.35 }}>
                  {toast.msg.revisionInfo.nombreActividad}
                </Typography>
              )}
              {toast.msg?.revisionInfo?.nombreRevision && (
                <Tooltip title={toast.msg.revisionInfo.nombreRevision} arrow>
                  <Typography noWrap sx={{ color: alpha("#fff", 0.68), fontSize: 12, fontWeight: 600 }}>
                    {toast.msg.revisionInfo.nombreRevision}
                  </Typography>
                </Tooltip>
              )}
              {toast.msg?.revisionInfo?.horario && (
                <Stack direction="row" spacing={0.6} alignItems="center" sx={{ mt: 0.9 }}>
                  <AccessTimeOutlinedIcon sx={{ fontSize: 14, color: alpha("#fff", 0.35) }} />
                  <Typography sx={{ color: alpha("#fff", 0.42), fontSize: 11, fontWeight: 600 }}>
                    {(() => { try { return new Date(toast.msg.revisionInfo.horario).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit", timeZone: "America/Mexico_City" }); } catch { return ""; } })()}
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
