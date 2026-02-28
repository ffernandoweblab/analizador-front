import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams, useLocation } from "react-router-dom";

import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  Grid,
  Paper,
  Skeleton,
  Stack,
  Typography,
  alpha,
} from "@mui/material";

import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import ExpandMoreOutlinedIcon from "@mui/icons-material/ExpandMoreOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined";
import ChecklistOutlinedIcon from "@mui/icons-material/ChecklistOutlined";
import AssignmentTurnedInOutlinedIcon from "@mui/icons-material/AssignmentTurnedInOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import { FormControlLabel, Switch, Tooltip } from "@mui/material";

const BACKEND_URL_DETAIL = "https://backend-1-azu0.onrender.com";
// const BACKEND_URL_DETAIL = "http://localhost:3001";

const LABEL_COLORS = {
  productivo: {
    gradient: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    color: "#10b981",
    bg: alpha("#10b981", 0.1),
  },
  regular: {
    gradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
    color: "#f59e0b",
    bg: alpha("#f59e0b", 0.1),
  },
  no_productivo: {
    gradient: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
    color: "#ef4444",
    bg: alpha("#ef4444", 0.1),
  },
};

// Formatter reutilizable con timezone CDMX
const cdmxDateFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/Mexico_City",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

function hoyISO_CDMX() {
  return cdmxDateFormatter.format(new Date());
}

function isTodayISO(dayISO) {
  return dayISO === hoyISO_CDMX();
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

function normalizePhoneDigits(phone) {
  return String(phone || "").replace(/[^\d]/g, "");
}

function buildWhatsAppUrl(phone) {
  const digits = normalizePhoneDigits(phone);
  if (!digits) return "";
  return `https://wa.me/${digits}`;
}

// Retrocede N días desde hoyISO_CDMX, excluyendo sábados y domingos
function obtenerDiasLaborales(diasRequeridos = 7) {
  const dias = [];
  // Usamos T12:00:00 para evitar problemas de DST al restar días
  const hoyStr = hoyISO_CDMX();
  let fechaActual = new Date(`${hoyStr}T12:00:00`);

  while (dias.length < diasRequeridos) {
    const diaSemana = fechaActual.getDay();

    if (diaSemana !== 0 && diaSemana !== 6) {
      dias.push(fechaActual.toISOString().slice(0, 10));
    }

    fechaActual.setDate(fechaActual.getDate() - 1);
  }

  return dias.reverse();
}

function obtenerNombreDia(fecha) {
  const dias = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
  const fechaObj = new Date(fecha + "T12:00:00");
  return dias[fechaObj.getDay()];
}

function obtenerDiaMes(fecha) {
  const fechaObj = new Date(fecha + "T12:00:00");
  return fechaObj.getDate();
}

function SemaforoVisual({ userId, fechaActual, onFechaClick }) {
  const [historial, setHistorial] = useState([]);
  const [loadingHistorial, setLoadingHistorial] = useState(true);

  useEffect(() => {
    const cargarHistorial = async () => {
      setLoadingHistorial(true);
      const diasLaborales = obtenerDiasLaborales(7);
      const promesas = diasLaborales.map(async (fecha) => {
        try {
          const url = `${BACKEND_URL_DETAIL}/api/productividad/usuario/${encodeURIComponent(userId)}?date=${encodeURIComponent(fecha)}`;
          const res = await fetch(url);
          if (!res.ok) throw new Error("Error al cargar");
          const data = await res.json();

          return {
            fecha,
            label: data?.prediccion?.label || "regular",
            tiempoTotal: data?.resumen?.tiempo_total || 0,
          };
        } catch (error) {
          console.error(`Error cargando ${fecha}:`, error);
          return {
            fecha,
            label: "sin_datos",
            tiempoTotal: 0,
          };
        }
      });

      const resultados = await Promise.all(promesas);
      setHistorial(resultados);
      setLoadingHistorial(false);
    };

    cargarHistorial();
  }, [userId]);

  const obtenerColorSemaforo = (label) => {
    switch (label) {
      case "productivo":
        return { color: "#10b981", bg: alpha("#10b981", 0.15), border: "#10b981", emoji: "✓" };
      case "no_productivo":
        return { color: "#ef4444", bg: alpha("#ef4444", 0.15), border: "#ef4444", emoji: "✗" };
      case "regular":
        return { color: "#f59e0b", bg: alpha("#f59e0b", 0.15), border: "#f59e0b", emoji: "~" };
      default:
        return { color: "#6b7280", bg: alpha("#6b7280", 0.15), border: "#6b7280", emoji: "○" };
    }
  };

  if (loadingHistorial) {
    return (
      <Card sx={{ borderRadius: 3, bgcolor: "background.paper", border: "1px solid", borderColor: "divider" }}>
        <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
            <CalendarTodayOutlinedIcon sx={{ fontSize: 28, color: "#3b82f6" }} />
            <Typography variant="h6" fontWeight={800}>
              Historial de productividad (últimos 7 días laborales)
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1.5} justifyContent="space-between">
            {Array.from({ length: 7 }).map((_, idx) => (
              <Skeleton key={idx} variant="rounded" width="100%" height={80} sx={{ borderRadius: 2 }} />
            ))}
          </Stack>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ borderRadius: 3, bgcolor: "background.paper", border: "1px solid", borderColor: "divider" }}>
      <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
          <CalendarTodayOutlinedIcon sx={{ fontSize: 28, color: "#3b82f6" }} />
          <Typography variant="h6" fontWeight={800}>
            Historial de productividad (últimos 7 días laborales)
          </Typography>
        </Stack>

        <Grid container spacing={1.5}>
          {historial.map((dia) => {
            const estilo = obtenerColorSemaforo(dia.label);
            const esFechaActual = dia.fecha === fechaActual;

            return (
              <Grid item xs key={dia.fecha} sx={{ flex: 1, minWidth: 0 }}>
                <Box
                  onClick={() => onFechaClick(dia.fecha)}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: estilo.bg,
                    border: "2px solid",
                    borderColor: esFechaActual ? estilo.border : "transparent",
                    textAlign: "center",
                    transition: "all 0.3s ease",
                    position: "relative",
                    cursor: "pointer",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: `0 8px 16px ${alpha(estilo.color, 0.3)}`,
                      borderColor: estilo.border,
                    },
                  }}
                >
                  {esFechaActual && (
                    <Chip
                      label="ACTUAL"
                      size="small"
                      sx={{
                        position: "absolute",
                        top: -10,
                        left: "50%",
                        transform: "translateX(-50%)",
                        bgcolor: estilo.color,
                        color: "white",
                        fontWeight: 800,
                        fontSize: 9,
                        height: 18,
                      }}
                    />
                  )}

                  <Typography
                    variant="h4"
                    sx={{ color: estilo.color, fontWeight: 900, mb: 1, fontSize: { xs: 28, sm: 36 } }}
                  >
                    {estilo.emoji}
                  </Typography>

                  <Typography
                    variant="caption"
                    sx={{ color: "text.secondary", display: "block", mb: 0.5, fontWeight: 600, fontSize: { xs: 10, sm: 11 } }}
                  >
                    {obtenerNombreDia(dia.fecha)}
                  </Typography>

                  <Typography
                    variant="body2"
                    sx={{ color: estilo.color, fontWeight: 800, fontSize: { xs: 14, sm: 16 } }}
                  >
                    {obtenerDiaMes(dia.fecha)}
                  </Typography>

                  <Typography
                    variant="caption"
                    sx={{ color: "text.secondary", display: "block", mt: 1, fontSize: 10 }}
                  >
                    {formatearTiempo(dia.tiempoTotal)}
                  </Typography>
                </Box>
              </Grid>
            );
          })}
        </Grid>

        <Box sx={{ mt: 3, pt: 2, borderTop: "1px solid", borderColor: "divider" }}>
          <Stack direction="row" spacing={3} justifyContent="center" flexWrap="wrap">
            {[
              { color: "#10b981", label: "Productivo" },
              { color: "#f59e0b", label: "Regular" },
              { color: "#ef4444", label: "No productivo" },
            ].map(({ color, label }) => (
              <Stack key={label} direction="row" spacing={1} alignItems="center">
                <Box sx={{ width: 12, height: 12, borderRadius: "50%", bgcolor: color }} />
                <Typography variant="caption" sx={{ color: "text.secondary", fontSize: 11 }}>
                  {label}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );
}

function ProbRow({ label, value, color }) {
  const pct = Math.round(value * 1000) / 10;
  const colorMap = { error: "#ef4444", warning: "#f59e0b", success: "#10b981" };

  return (
    <Stack direction={{ xs: "column", sm: "row" }} spacing={{ xs: 1, sm: 2 }} alignItems={{ xs: "stretch", sm: "center" }}>
      <Box sx={{ minWidth: { xs: "auto", sm: 110 } }}>
        <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 600 }}>
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

      <Box sx={{ minWidth: { xs: "auto", sm: 56 }, textAlign: { xs: "left", sm: "right" } }}>
        <Typography variant="body2" sx={{ color: colorMap[color], fontWeight: 800 }}>
          {pct.toFixed(1)}%
        </Typography>
      </Box>
    </Stack>
  );
}

function InfoRow({ icon: Icon, label, value, iconColor = "#3b82f6", href }) {
  return (
    <Stack direction="row" spacing={{ xs: 1.5, sm: 2 }} alignItems="center" sx={{ py: { xs: 0.75, sm: 1 } }}>
      <Box
        sx={{
          width: { xs: 36, sm: 40 },
          height: { xs: 36, sm: 40 },
          borderRadius: 2,
          bgcolor: alpha(iconColor, 0.1),
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Icon sx={{ fontSize: { xs: 18, sm: 20 }, color: iconColor }} />
      </Box>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 0.25, fontSize: { xs: "0.7rem", sm: "0.75rem" } }}>
          {label}
        </Typography>
        <Typography
          variant="body2"
          fontWeight={700}
          sx={{ whiteSpace: { xs: "normal", sm: "nowrap" }, overflow: "hidden", textOverflow: "ellipsis", wordBreak: "break-word" }}
        >
          {href && value ? (
            <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "underline" }}>
              {value}
            </a>
          ) : (
            value || "N/A"
          )}
        </Typography>
      </Box>
    </Stack>
  );
}

function StatBox({ icon: Icon, label, value, total, color = "#3b82f6" }) {
  const getFontSize = (str) => {
    const len = String(str ?? "").length;
    if (len <= 2) return { xs: "1.35rem", sm: "1.5rem" };
    if (len <= 4) return { xs: "1.1rem", sm: "1.35rem" };
    if (len <= 6) return { xs: "0.95rem", sm: "1.1rem" };
    return { xs: "0.8rem", sm: "0.95rem" };
  };

  const longestStr = total != null
    ? (String(value ?? "").length >= String(total ?? "").length ? String(value) : String(total))
    : String(value ?? "");

  const fontSize = getFontSize(longestStr);

  const displayValue = total != null ? (
    <>
      {value}
      <Typography component="span" sx={{ color: "text.disabled", fontWeight: 500, fontSize: "0.72em" }}>
        /{total}
      </Typography>
    </>
  ) : value;

  return (
    <Box
      sx={{
        p: { xs: 2, sm: 2.5 },
        borderRadius: 2,
        bgcolor: alpha(color, 0.08),
        border: "1px solid",
        borderColor: alpha(color, 0.2),
        textAlign: "center",
        transition: "all 0.3s ease",
        "&:hover": { bgcolor: alpha(color, 0.12), transform: "translateY(-2px)" },
      }}
    >
      <Icon sx={{ fontSize: { xs: 26, sm: 32 }, color: color, mb: { xs: 1, sm: 1.5 } }} />
      <Typography
        variant="h5"
        fontWeight={900}
        sx={{ color: "text.primary", mb: 0.5, fontSize: fontSize, lineHeight: 1.1, wordBreak: "break-word" }}
      >
        {displayValue}
      </Typography>
      <Typography variant="caption" sx={{ color: "text.secondary", textTransform: "uppercase", letterSpacing: 0.5, fontWeight: 700, fontSize: { xs: "0.65rem", sm: "0.75rem" } }}>
        {label}
      </Typography>
    </Box>
  );
}

function Bucket({ title, items, color = "#3b82f6" }) {
  if (!items?.length) return null;

  return (
    <Box sx={{ mt: { xs: 2.5, sm: 3 } }}>
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: { xs: 1.5, sm: 2 } }}>
        <Box
          sx={{
            width: 4,
            height: { xs: 20, sm: 24 },
            borderRadius: 999,
            background: `linear-gradient(180deg, ${color} 0%, ${alpha(color, 0.6)} 100%)`,
          }}
        />
        <Typography variant="subtitle1" fontWeight={800} sx={{ color: "text.primary" }}>
          {title}
        </Typography>
        <Chip label={items.length} size="small" sx={{ bgcolor: alpha(color, 0.15), color: color, fontWeight: 800, borderRadius: 999 }} />
      </Stack>

      <Stack spacing={1.5}>
        {items.map((r, idx) => (
          <Card
            key={`${r.id || "rev"}-${idx}`}
            sx={{
              borderRadius: 2,
              bgcolor: "background.paper",
              border: "1px solid",
              borderColor: alpha("#fff", 0.05),
              transition: "all 0.2s ease",
              "&:hover": { borderColor: alpha(color, 0.3), bgcolor: alpha(color, 0.03) },
            }}
          >
            <CardContent sx={{ py: { xs: 1.5, sm: 2 }, px: { xs: 2, sm: 2.5 }, "&:last-child": { pb: { xs: 1.5, sm: 2 } } }}>
              <Grid container spacing={{ xs: 1.5, sm: 2 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <Stack spacing={0.5}>
                    <Typography variant="caption" sx={{ color: "text.secondary", textTransform: "uppercase", fontSize: 10, letterSpacing: 0.5 }}>
                      Duración
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <AccessTimeOutlinedIcon sx={{ fontSize: 16, color: color }} />
                      <Typography variant="body2" fontWeight={700}>{formatearTiempo(r?.duracionMin)}</Typography>
                    </Stack>
                  </Stack>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Stack spacing={0.5}>
                    <Typography variant="caption" sx={{ color: "text.secondary", textTransform: "uppercase", fontSize: 10, letterSpacing: 0.5 }}>
                      Fecha creación
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <CalendarTodayOutlinedIcon sx={{ fontSize: 16, color: color }} />
                      <Typography variant="body2" fontWeight={700}>{r?.fechaCreacion || "N/A"}</Typography>
                    </Stack>
                  </Stack>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Stack spacing={0.5}>
                    <Typography variant="caption" sx={{ color: "text.secondary", textTransform: "uppercase", fontSize: 10, letterSpacing: 0.5 }}>
                      Nombre
                    </Typography>
                    <Typography variant="body2" fontWeight={700} sx={{ whiteSpace: "normal", overflowWrap: "anywhere", wordBreak: "break-word" }}>
                      {r?.nombre || "(Sin nombre)"}
                    </Typography>
                  </Stack>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Stack spacing={0.5}>
                    <Typography variant="caption" sx={{ color: "text.secondary", textTransform: "uppercase", fontSize: 10, letterSpacing: 0.5 }}>
                      Assignees
                    </Typography>
                    <Typography variant="body2" fontWeight={700} sx={{ whiteSpace: "normal", overflowWrap: "anywhere", wordBreak: "break-word" }}>
                      {(r?.assignees || []).map((a) => a?.email || a?.name || a?.id).filter(Boolean).join(", ") || "N/A"}
                    </Typography>
                  </Stack>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Box>
  );
}

export default function ProductividadDetalle() {
  const navigate = useNavigate();
  const location = useLocation();
  const { userId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const [data, setData] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [prevData, setPrevData] = useState(null);
  const [agendaResumen, setAgendaResumen] = useState(null);

  const dateParam = searchParams.get("date") || "";
  const day = useMemo(() => dateParam || hoyISO_CDMX(), [dateParam]);

  const [modeOverride, setModeOverride] = useState(null);
  const modeEffective = modeOverride ?? ((data || prevData)?.meta?.mode ?? null);
  const switchChecked = modeEffective ? modeEffective === "agenda" : true;

  const isCurrentDay = useMemo(() => isTodayISO(day), [day]);

  // Carga datos de agenda en background para tener denominadores (solo si estamos en modo hecho hoy)
  const cargarAgendaBackground = useCallback(async () => {
    if (!isCurrentDay) return;
    const resolvedMode = modeOverride ?? "auto";
    if (resolvedMode === "agenda") return; // ya tenemos los datos completos
    try {
      const params = new URLSearchParams();
      if (dateParam) params.set("date", dateParam);
      params.set("mode", "agenda");
      const qs = `?${params.toString()}`;
      const url = `${BACKEND_URL_DETAIL}/api/productividad/usuario/${encodeURIComponent(userId)}${qs}`;
      const res = await fetch(url);
      if (!res.ok) return;
      const agendaData = await res.json();
      if (agendaData?.resumen) setAgendaResumen(agendaData.resumen);
    } catch (e) {
      console.error("cargarAgendaBackground error:", e);
    }
  }, [isCurrentDay, modeOverride, dateParam, userId]);

  useEffect(() => {
    setAgendaResumen(null);
    cargarAgendaBackground();
  }, [cargarAgendaBackground]);

  const cargar = useCallback(async () => {
    setLoading(true);
    setErr("");
    try {
      const params = new URLSearchParams();

      if (dateParam) params.set("date", dateParam);

      if (isCurrentDay) {
        if (modeOverride) params.set("mode", modeOverride);
      } else {
        params.set("mode", "hecho");
      }

      const qs = params.toString() ? `?${params.toString()}` : "";
      const url = `${BACKEND_URL_DETAIL}/api/productividad/usuario/${encodeURIComponent(userId)}${qs}`;

      const res = await fetch(url);
      if (!res.ok) throw new Error(await res.text());
      const newData = await res.json();

      setData(newData);
      setPrevData(newData);

      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      setErr(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  }, [userId, dateParam, modeOverride, isCurrentDay]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  useEffect(() => {
    if (!isCurrentDay) {
      setModeOverride("hecho");
    } else {
      setModeOverride(null);
    }
  }, [isCurrentDay]);

  const handleFechaClick = useCallback((nuevaFecha) => {
    setSearchParams({ date: nuevaFecha });
  }, [setSearchParams]);

  const handleModeToggle = useCallback((e) => {
    const checked = e.target.checked;
    setModeOverride(checked ? "agenda" : "hecho");
  }, []);

  const pred = (data || prevData)?.prediccion ?? {};
  const label = pred?.label || "regular";
  const probsRaw = pred?.probabilidades ?? pred?.probabilities ?? {};
  const probs = {
    no_productivo: toProb(probsRaw.no_productivo),
    regular: toProb(probsRaw.regular),
    productivo: toProb(probsRaw.productivo),
  };

  const labelStyle = LABEL_COLORS[label] || LABEL_COLORS.regular;

  // Fracción hecho/agenda: solo cuando estamos en modo hecho hoy y tenemos denominador
  const modoEfectivoEsHecho = isCurrentDay && (modeEffective === "hecho" || modeEffective === null);
  const mostrarFraccion = modoEfectivoEsHecho && agendaResumen != null;

  const resumenActual = (data || prevData)?.resumen ?? {};
  const totalActividades = mostrarFraccion ? agendaResumen.actividades : undefined;
  const totalRevisiones  = mostrarFraccion ? agendaResumen.revisiones  : undefined;
  const totalTiempo      = mostrarFraccion ? formatearTiempo(agendaResumen.tiempo_total) : undefined;

  const from = location.state?.from;
  const backUrl = from
    ? from
    : dateParam
      ? `/productividad?date=${encodeURIComponent(dateParam)}`
      : "/productividad";

  return (
    <Box sx={{ bgcolor: "#0a0e1a", minHeight: "100vh", py: { xs: 2, sm: 3, md: 4 } }}>
      <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
        <Stack spacing={{ xs: 2.5, sm: 3.5, md: 4 }}>
          {/* Header */}
          <Box>
            <Button
              startIcon={<ArrowBackOutlinedIcon />}
              onClick={() => navigate(backUrl)}
              sx={{
                borderRadius: 2,
                mb: { xs: 1.5, sm: 2 },
                px: { xs: 1.5, sm: 2 },
                color: "#3b82f6",
                fontWeight: 700,
                alignSelf: "flex-start",
                "&:hover": { bgcolor: alpha("#3b82f6", 0.1) },
              }}
            >
              Volver
            </Button>

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={{ xs: 1.5, sm: 2 }}
              alignItems={{ xs: "flex-start", sm: "center" }}
              sx={{ mb: 1 }}
            >
              <PersonOutlineOutlinedIcon sx={{ fontSize: { xs: 34, sm: 40 }, color: "#3b82f6" }} />
              <Typography
                variant="h3"
                fontWeight={900}
                sx={{
                  fontSize: { xs: "1.6rem", sm: "2.2rem", md: "3rem" },
                  lineHeight: 1.1,
                  background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Detalle de usuario
              </Typography>
            </Stack>

            <Typography variant="body1" sx={{ color: "text.secondary", ml: { xs: 0, sm: 7 }, fontSize: { xs: "0.9rem", sm: "1rem" } }}>
              Fecha: {day}
            </Typography>

            {isCurrentDay && (
              <Stack direction="row" spacing={2} alignItems="center" sx={{ ml: { xs: 0, sm: 7 }, mt: 1 }}>
                <Tooltip title="Agenda: muestra todo (terminadas/confirmadas/pendientes).">
                  <FormControlLabel
                    control={<Switch checked={switchChecked} onChange={handleModeToggle} disabled={loading} />}
                    label={switchChecked ? "Modo agenda (completo)" : "Modo hecho (solo terminadas)"}
                    sx={{ color: "text.secondary" }}
                  />
                </Tooltip>

                {modeOverride && (
                  <Button
                    size="small"
                    variant="text"
                    onClick={() => setModeOverride(null)}
                    disabled={loading}
                    sx={{ color: "#3b82f6", fontWeight: 700 }}
                  >
                    Auto
                  </Button>
                )}
              </Stack>
            )}
          </Box>

          {err ? (
            <Alert severity="error" sx={{ borderRadius: 2, bgcolor: alpha("#ef4444", 0.1), border: "1px solid", borderColor: alpha("#ef4444", 0.3) }}>
              {err}
            </Alert>
          ) : null}

          {loading && !data ? (
            <Grid container spacing={{ xs: 2, sm: 3 }}>
              {[1, 2, 3].map((i) => (
                <Grid item xs={12} md={4} key={i}>
                  <Card sx={{ borderRadius: 3, bgcolor: "background.paper", border: "1px solid", borderColor: "divider" }}>
                    <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
                      <Skeleton width="60%" height={32} sx={{ mb: 2 }} />
                      <Skeleton width="100%" height={20} />
                      <Skeleton width="80%" height={20} />
                      <Skeleton width="90%" height={20} />
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (data || prevData) ? (
            <>
              {loading && (
                <Box
                  sx={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    bgcolor: alpha("#0a0e1a", 0.8),
                    backdropFilter: "blur(4px)",
                    zIndex: 9999,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Stack spacing={3} alignItems="center">
                    <Box
                      sx={{
                        width: 80,
                        height: 80,
                        borderRadius: "50%",
                        border: "4px solid",
                        borderColor: alpha("#3b82f6", 0.2),
                        borderTopColor: "#3b82f6",
                        animation: "spin 1s linear infinite",
                        "@keyframes spin": {
                          "0%": { transform: "rotate(0deg)" },
                          "100%": { transform: "rotate(360deg)" },
                        },
                      }}
                    />
                    <Typography variant="h6" sx={{ color: "#3b82f6", fontWeight: 700, textAlign: "center" }}>
                      Cargando datos....
                    </Typography>
                  </Stack>
                </Box>
              )}

              <Grid container spacing={{ xs: 2, sm: 3 }}>
                {/* User Card */}
                <Grid item xs={12} md={4}>
                  <Card
                    sx={{
                      borderRadius: 3,
                      bgcolor: "background.paper",
                      border: "1px solid",
                      borderColor: "divider",
                      position: "relative",
                      overflow: "hidden",
                      "&::before": {
                        content: '""',
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        height: 4,
                        background: labelStyle.gradient,
                      },
                    }}
                  >
                    <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
                      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: { xs: 2, sm: 3 } }}>
                        <Avatar
                          sx={{
                            width: { xs: 50, sm: 56 },
                            height: { xs: 50, sm: 56 },
                            background: labelStyle.gradient,
                            fontSize: { xs: 20, sm: 24 },
                            fontWeight: 900,
                            boxShadow: `0 4px 12px ${alpha(labelStyle.color, 0.3)}`,
                          }}
                        >
                          {((data || prevData)?.user?.colaborador || "U").charAt(0).toUpperCase()}
                        </Avatar>

                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="h6" fontWeight={800} noWrap sx={{ mb: 0.5 }}>
                            {(data || prevData)?.user?.colaborador || "Usuario"}
                          </Typography>
                          <Chip
                            label={label.replace("_", " ").toUpperCase()}
                            size="small"
                            sx={{ background: labelStyle.gradient, color: "white", fontWeight: 800, borderRadius: 999 }}
                          />
                        </Box>
                      </Stack>

                      <Divider sx={{ mb: 2, borderColor: alpha("#fff", 0.05) }} />

                      <Stack spacing={{ xs: 0.5, sm: 1 }}>
                        <InfoRow icon={PersonOutlineOutlinedIcon} label="ID" value={(data || prevData)?.user?.user_id} iconColor="#8b5cf6" />
                        <InfoRow icon={EmailOutlinedIcon} label="Email" value={(data || prevData)?.user?.email} iconColor="#10b981" />
                        <InfoRow icon={PhoneOutlinedIcon} label="WhatsApp" value={(data || prevData)?.user?.phone} href={buildWhatsAppUrl((data || prevData)?.user?.phone)} iconColor="#22c55e" />
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Summary Stats */}
                <Grid item xs={12} md={8}>
                  <Card sx={{ borderRadius: 3, bgcolor: "background.paper", border: "1px solid", borderColor: "divider", height: "100%" }}>
                    <CardContent sx={{ p: { xs: 2.5, sm: 3 }, height: "100%" }}>
                      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: { xs: 2, sm: 3 } }}>
                        <AssessmentOutlinedIcon sx={{ fontSize: 28, color: "#3b82f6" }} />
                        <Typography variant="h6" fontWeight={800}>Resumen de actividad</Typography>
                      </Stack>

                      <Grid container spacing={{ xs: 1.5, sm: 2 }}>
                        <Grid item xs={6} sm={4}>
                          <StatBox icon={ChecklistOutlinedIcon} label="Actividades" value={resumenActual.actividades ?? 0} total={totalActividades} color="#3b82f6" />
                        </Grid>
                        <Grid item xs={6} sm={4}>
                          <StatBox icon={AssignmentTurnedInOutlinedIcon} label="Revisiones" value={resumenActual.revisiones ?? 0} total={totalRevisiones} color="#8b5cf6" />
                        </Grid>
                        <Grid item xs={6} sm={4}>
                          <StatBox icon={AccessTimeOutlinedIcon} label="Tiempo total" value={formatearTiempo(resumenActual.tiempo_total ?? 0)} total={totalTiempo} color="#10b981" />
                        </Grid>
                        <Grid item xs={6} sm={6}>
                          <StatBox icon={AssignmentTurnedInOutlinedIcon} label="Con duración" value={resumenActual.revisiones_con_duracion ?? 0} color="#f59e0b" />
                        </Grid>
                        <Grid item xs={6} sm={6}>
                          <StatBox icon={AssignmentTurnedInOutlinedIcon} label="Sin duración" value={resumenActual.revisiones_sin_duracion ?? 0} color="#ef4444" />
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Probability Distribution */}
                <Grid item xs={12}>
                  <Card sx={{ borderRadius: 3, bgcolor: "background.paper", border: "1px solid", borderColor: "divider" }}>
                    <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
                      <Typography
                        variant="h6"
                        fontWeight={800}
                        sx={{ mb: { xs: 2, sm: 3 }, textTransform: "uppercase", letterSpacing: 0.5, fontSize: { xs: "0.95rem", sm: "1.1rem" } }}
                      >
                        Distribución de probabilidades
                      </Typography>

                      <Stack spacing={{ xs: 1.5, sm: 2 }}>
                        <ProbRow label="No productivo" value={probs.no_productivo} color="error" />
                        <ProbRow label="Regular" value={probs.regular} color="warning" />
                        <ProbRow label="Productivo" value={probs.productivo} color="success" />
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12}>
                  <SemaforoVisual userId={userId} fechaActual={day} onFechaClick={handleFechaClick} />
                </Grid>
              </Grid>

              {/* Activities Section */}
              <Box>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={{ xs: 1, sm: 2 }}
                  alignItems={{ xs: "flex-start", sm: "center" }}
                  sx={{ mb: { xs: 2, sm: 3 } }}
                >
                  <ChecklistOutlinedIcon sx={{ fontSize: { xs: 28, sm: 32 }, color: "#3b82f6" }} />
                  <Typography variant="h5" fontWeight={900} sx={{ fontSize: { xs: "1.2rem", sm: "1.5rem" } }}>
                    Actividades y revisiones
                  </Typography>
                </Stack>

                {Array.isArray((data || prevData)?.actividades) && (data || prevData).actividades.length > 0 ? (
                  <Stack spacing={{ xs: 1.5, sm: 2 }}>
                    {(data || prevData).actividades.map((act) => {
                      const t = String(act?.titulo || "Actividad");
                      const buckets = act?.revisiones || {};
                      const terminadas = buckets?.terminadas || [];
                      const confirmadas = buckets?.confirmadas || [];
                      const pendientes = buckets?.pendientes || [];
                      const total = terminadas.length + confirmadas.length + pendientes.length;

                      return (
                        <Accordion
                          key={act.id}
                          sx={{
                            borderRadius: "12px !important",
                            overflow: "hidden",
                            bgcolor: "background.paper",
                            border: "1px solid",
                            borderColor: "divider",
                            "&:before": { display: "none" },
                            transition: "all 0.3s ease",
                            "&:hover": { borderColor: alpha("#3b82f6", 0.3) },
                          }}
                        >
                          <AccordionSummary
                            expandIcon={<ExpandMoreOutlinedIcon sx={{ color: "#3b82f6", fontSize: 28 }} />}
                            sx={{ py: { xs: 1.5, sm: 2 }, px: { xs: 2, sm: 3 }, "&:hover": { bgcolor: alpha("#3b82f6", 0.03) } }}
                          >
                            <Stack spacing={1} sx={{ width: "100%", pr: { xs: 1, sm: 2 } }}>
                              <Stack direction={{ xs: "column", sm: "row" }} spacing={{ xs: 1, sm: 2 }} alignItems={{ xs: "flex-start", sm: "center" }}>
                                <Typography variant="h6" fontWeight={800} sx={{ fontSize: { xs: "1rem", sm: "1.1rem" }, wordBreak: "break-word" }}>
                                  {t}
                                </Typography>
                                <Chip
                                  label={`${total} revisiones`}
                                  size="small"
                                  sx={{ bgcolor: alpha("#3b82f6", 0.15), color: "#3b82f6", fontWeight: 700, borderRadius: 999 }}
                                />
                              </Stack>
                              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                                ID: {act?.id || "N/A"} · Inicio: {act?.dueStart || "N/A"}
                              </Typography>
                            </Stack>
                          </AccordionSummary>

                          <AccordionDetails sx={{ px: { xs: 2, sm: 3 }, pb: { xs: 2.5, sm: 3 } }}>
                            <Bucket title="TERMINADAS" items={terminadas} color="#10b981" />
                            <Bucket title="CONFIRMADAS" items={confirmadas} color="#3b82f6" />
                            <Bucket title="PENDIENTES" items={pendientes} color="#f59e0b" />
                          </AccordionDetails>
                        </Accordion>
                      );
                    })}
                  </Stack>
                ) : (
                  <Paper sx={{ borderRadius: 3, p: { xs: 3, sm: 6 }, textAlign: "center", bgcolor: "background.paper", border: "1px solid", borderColor: "divider" }}>
                    <ChecklistOutlinedIcon sx={{ fontSize: { xs: 46, sm: 64 }, color: "text.disabled", mb: 2 }} />
                    <Typography variant="body1" sx={{ color: "text.secondary" }}>
                      No hay actividades registradas en este día
                    </Typography>
                  </Paper>
                )}
              </Box>
            </>
          ) : null}
        </Stack>
      </Container>
    </Box>
  );
}