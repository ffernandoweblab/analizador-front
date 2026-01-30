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
  LinearProgress,
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
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";

//const BACKEND_URL_DETAIL = "http://localhost:3001";
const BACKEND_URL_DETAIL = "https://backend-xycc.onrender.com";

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
        <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 600 }}>
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

function InfoRow({ icon: Icon, label, value, iconColor = "#3b82f6" }) {
  return (
    <Stack direction="row" spacing={2} alignItems="center" sx={{ py: 1 }}>
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: 2,
          bgcolor: alpha(iconColor, 0.1),
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon sx={{ fontSize: 20, color: iconColor }} />
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 0.25 }}>
          {label}
        </Typography>
        <Typography variant="body2" fontWeight={700} noWrap>
          {value || "N/A"}
        </Typography>
      </Box>
    </Stack>
  );
}

function StatBox({ icon: Icon, label, value, color = "#3b82f6" }) {
  return (
    <Box
      sx={{
        p: 2.5,
        borderRadius: 2,
        bgcolor: alpha(color, 0.08),
        border: "1px solid",
        borderColor: alpha(color, 0.2),
        textAlign: "center",
        transition: "all 0.3s ease",
        "&:hover": {
          bgcolor: alpha(color, 0.12),
          transform: "translateY(-2px)",
        }
      }}
    >
      <Icon sx={{ fontSize: 32, color: color, mb: 1.5 }} />
      <Typography variant="h5" fontWeight={900} sx={{ color: "text.primary", mb: 0.5 }}>
        {value}
      </Typography>
      <Typography variant="caption" sx={{ color: "text.secondary", textTransform: "uppercase", letterSpacing: 0.5, fontWeight: 600 }}>
        {label}
      </Typography>
    </Box>
  );
}

function Bucket({ title, items, color = "#3b82f6" }) {
  if (!items?.length) return null;
  
  return (
    <Box sx={{ mt: 3 }}>
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
        <Box
          sx={{
            width: 4,
            height: 24,
            borderRadius: 999,
            background: `linear-gradient(180deg, ${color} 0%, ${alpha(color, 0.6)} 100%)`,
          }}
        />
        <Typography variant="subtitle1" fontWeight={800} sx={{ color: "text.primary" }}>
          {title}
        </Typography>
        <Chip
          label={items.length}
          size="small"
          sx={{
            bgcolor: alpha(color, 0.15),
            color: color,
            fontWeight: 800,
            borderRadius: 999,
          }}
        />
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
              "&:hover": {
                borderColor: alpha(color, 0.3),
                bgcolor: alpha(color, 0.03),
              }
            }}
          >
            <CardContent sx={{ py: 2, px: 2.5, "&:last-child": { pb: 2 } }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Stack spacing={0.5}>
                    <Typography variant="caption" sx={{ color: "text.secondary", textTransform: "uppercase", fontSize: 10, letterSpacing: 0.5 }}>
                      Duración
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <AccessTimeOutlinedIcon sx={{ fontSize: 16, color: color }} />
                      <Typography variant="body2" fontWeight={700}>
                        {formatearTiempo(r?.duracionMin)}
                      </Typography>
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
                      <Typography variant="body2" fontWeight={700}>
                        {r?.fechaCreacion || "N/A"}
                      </Typography>
                    </Stack>
                  </Stack>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Stack spacing={0.5}>
                    <Typography variant="caption" sx={{ color: "text.secondary", textTransform: "uppercase", fontSize: 10, letterSpacing: 0.5 }}>
                      Nombre
                    </Typography>
                    <Typography variant="body2" fontWeight={700} noWrap>
                      {r?.nombre || "(Sin nombre)"}
                    </Typography>
                  </Stack>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Stack spacing={0.5}>
                    <Typography variant="caption" sx={{ color: "text.secondary", textTransform: "uppercase", fontSize: 10, letterSpacing: 0.5 }}>
                      Assignees
                    </Typography>
                    <Typography variant="body2" fontWeight={700} noWrap>
                      {(r?.assignees || [])
                        .map((a) => a?.email || a?.name || a?.id)
                        .filter(Boolean)
                        .join(", ") || "N/A"}
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
  const [searchParams] = useSearchParams();

  const [data, setData] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const dateParam = searchParams.get("date") || "";
  const day = useMemo(() => dateParam || new Date().toISOString().slice(0, 10), [dateParam]);

  const cargar = useCallback(async () => {
    setLoading(true);
    setErr("");
    try {
      const qs = dateParam ? `?date=${encodeURIComponent(dateParam)}` : "";
      const url = `${BACKEND_URL_DETAIL}/api/productividad/usuario/${encodeURIComponent(userId)}${qs}`;

      const res = await fetch(url);
      if (!res.ok) throw new Error(await res.text());
      setData(await res.json());
    } catch (e) {
      setErr(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  }, [userId, dateParam]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const pred = data?.prediccion ?? {};
  const label = pred?.label || "regular";
  const probsRaw = pred?.probabilidades ?? pred?.probabilities ?? {};
  const probs = {
    no_productivo: toProb(probsRaw.no_productivo),
    regular: toProb(probsRaw.regular),
    productivo: toProb(probsRaw.productivo),
  };

  const labelStyle = LABEL_COLORS[label] || LABEL_COLORS.regular;

  const from = location.state?.from;

const backUrl = from
  ? from
  : (dateParam ? `/productividad?date=${encodeURIComponent(dateParam)}` : "/productividad");

  return (
    <Box sx={{ bgcolor: "#0a0e1a", minHeight: "100vh", py: 4 }}>
      <Container maxWidth="xl">
        <Stack spacing={4}>
          {/* Header */}
          <Box>
            <Button
              startIcon={<ArrowBackOutlinedIcon />}
              onClick={() => navigate(backUrl)}
              sx={{
                borderRadius: 2,
                mb: 2,
                color: "#3b82f6",
                fontWeight: 600,
                "&:hover": {
                  bgcolor: alpha("#3b82f6", 0.1),
                }
              }}
            >
              Volver
            </Button>

            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
              <PersonOutlineOutlinedIcon sx={{ fontSize: 40, color: "#3b82f6" }} />
              <Typography
                variant="h3"
                fontWeight={900}
                sx={{
                  background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Detalle de usuario
              </Typography>
            </Stack>
            <Typography variant="body1" sx={{ color: "text.secondary", ml: 7 }}>
              Fecha: {day}
            </Typography>
          </Box>

          {err ? (
            <Alert
              severity="error"
              sx={{
                borderRadius: 2,
                bgcolor: alpha("#ef4444", 0.1),
                border: "1px solid",
                borderColor: alpha("#ef4444", 0.3),
              }}
            >
              {err}
            </Alert>
          ) : null}

          {loading && !data ? (
            <Grid container spacing={3}>
              {[1, 2, 3].map((i) => (
                <Grid item xs={12} md={4} key={i}>
                  <Card sx={{ borderRadius: 3, bgcolor: "background.paper", border: "1px solid", borderColor: "divider" }}>
                    <CardContent sx={{ p: 3 }}>
                      <Skeleton width="60%" height={32} sx={{ mb: 2 }} />
                      <Skeleton width="100%" height={20} />
                      <Skeleton width="80%" height={20} />
                      <Skeleton width="90%" height={20} />
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : data ? (
            <>
              {/* User Info & Summary Cards */}
              <Grid container spacing={3}>
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
                      }
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
                        <Avatar
                          sx={{
                            width: 56,
                            height: 56,
                            background: labelStyle.gradient,
                            fontSize: 24,
                            fontWeight: 900,
                            boxShadow: `0 4px 12px ${alpha(labelStyle.color, 0.3)}`,
                          }}
                        >
                          {(data?.user?.colaborador || "U").charAt(0).toUpperCase()}
                        </Avatar>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="h6" fontWeight={800} noWrap sx={{ mb: 0.5 }}>
                            Usuario
                          </Typography>
                          <Chip
                            label={label.replace("_", " ").toUpperCase()}
                            size="small"
                            sx={{
                              background: labelStyle.gradient,
                              color: "white",
                              fontWeight: 800,
                              borderRadius: 999,
                            }}
                          />
                        </Box>
                      </Stack>

                      <Divider sx={{ mb: 2, borderColor: alpha("#fff", 0.05) }} />

                      <Stack spacing={1}>
                        <InfoRow
                          icon={BadgeOutlinedIcon}
                          label="Nombre"
                          value={data?.user?.colaborador}
                          iconColor="#3b82f6"
                        />
                        <InfoRow
                          icon={PersonOutlineOutlinedIcon}
                          label="ID"
                          value={data?.user?.user_id}
                          iconColor="#8b5cf6"
                        />
                        <InfoRow
                          icon={EmailOutlinedIcon}
                          label="Email"
                          value={data?.user?.email}
                          iconColor="#10b981"
                        />
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Summary Stats */}
                <Grid item xs={12} md={8}>
                  <Card
                    sx={{
                      borderRadius: 3,
                      bgcolor: "background.paper",
                      border: "1px solid",
                      borderColor: "divider",
                      height: "100%",
                    }}
                  >
                    <CardContent sx={{ p: 3, height: "100%" }}>
                      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
                        <AssessmentOutlinedIcon sx={{ fontSize: 28, color: "#3b82f6" }} />
                        <Typography variant="h6" fontWeight={800}>
                          Resumen de actividad
                        </Typography>
                      </Stack>

                      <Grid container spacing={2}>
                        <Grid item xs={6} sm={4}>
                          <StatBox
                            icon={ChecklistOutlinedIcon}
                            label="Actividades"
                            value={data?.resumen?.actividades ?? 0}
                            color="#3b82f6"
                          />
                        </Grid>
                        <Grid item xs={6} sm={4}>
                          <StatBox
                            icon={AssignmentTurnedInOutlinedIcon}
                            label="Revisiones"
                            value={data?.resumen?.revisiones ?? 0}
                            color="#8b5cf6"
                          />
                        </Grid>
                        <Grid item xs={6} sm={4}>
                          <StatBox
                            icon={AccessTimeOutlinedIcon}
                            label="Tiempo total"
                            value={formatearTiempo(data?.resumen?.tiempo_total ?? 0)}
                            color="#10b981"
                          />
                        </Grid>
                        <Grid item xs={6} sm={6}>
                          <StatBox
                            icon={AssignmentTurnedInOutlinedIcon}
                            label="Con duración"
                            value={data?.resumen?.revisiones_con_duracion ?? 0}
                            color="#f59e0b"
                          />
                        </Grid>
                        <Grid item xs={6} sm={6}>
                          <StatBox
                            icon={AssignmentTurnedInOutlinedIcon}
                            label="Sin duración"
                            value={data?.resumen?.revisiones_sin_duracion ?? 0}
                            color="#ef4444"
                          />
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Probability Distribution */}
                <Grid item xs={12}>
                  <Card
                    sx={{
                      borderRadius: 3,
                      bgcolor: "background.paper",
                      border: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Typography variant="h6" fontWeight={800} sx={{ mb: 3, textTransform: "uppercase", letterSpacing: 0.5 }}>
                        Distribución de probabilidades
                      </Typography>

                      <Stack spacing={2}>
                        <ProbRow label="No productivo" value={probs.no_productivo} color="error" />
                        <ProbRow label="Regular" value={probs.regular} color="warning" />
                        <ProbRow label="Productivo" value={probs.productivo} color="success" />
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Activities Section */}
              <Box>
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
                  <ChecklistOutlinedIcon sx={{ fontSize: 32, color: "#3b82f6" }} />
                  <Typography variant="h5" fontWeight={900}>
                    Actividades y revisiones
                  </Typography>
                </Stack>

                {Array.isArray(data?.actividades) && data.actividades.length > 0 ? (
                  <Stack spacing={2}>
                    {data.actividades.map((act) => {
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
                            "&:hover": {
                              borderColor: alpha("#3b82f6", 0.3),
                            }
                          }}
                        >
                          <AccordionSummary
                            expandIcon={
                              <ExpandMoreOutlinedIcon
                                sx={{
                                  color: "#3b82f6",
                                  fontSize: 28,
                                }}
                              />
                            }
                            sx={{
                              py: 2,
                              px: 3,
                              "&:hover": {
                                bgcolor: alpha("#3b82f6", 0.03),
                              }
                            }}
                          >
                            <Stack spacing={1} sx={{ width: "100%", pr: 2 }}>
                              <Stack direction="row" spacing={2} alignItems="center">
                                <Typography variant="h6" fontWeight={800}>
                                  {t}
                                </Typography>
                                <Chip
                                  label={`${total} revisiones`}
                                  size="small"
                                  sx={{
                                    bgcolor: alpha("#3b82f6", 0.15),
                                    color: "#3b82f6",
                                    fontWeight: 700,
                                    borderRadius: 999,
                                  }}
                                />
                              </Stack>
                              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                                ID: {act?.id || "N/A"} · Inicio: {act?.dueStart || "N/A"}
                              </Typography>
                            </Stack>
                          </AccordionSummary>

                          <AccordionDetails sx={{ px: 3, pb: 3 }}>
                            <Bucket title="TERMINADAS" items={terminadas} color="#10b981" />
                            <Bucket title="CONFIRMADAS" items={confirmadas} color="#3b82f6" />
                            <Bucket title="PENDIENTES" items={pendientes} color="#f59e0b" />
                          </AccordionDetails>
                        </Accordion>
                      );
                    })}
                  </Stack>
                ) : (
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
                    <ChecklistOutlinedIcon sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
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
