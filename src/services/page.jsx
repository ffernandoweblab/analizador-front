"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";

const BACKEND_URL_DETALLE = "http://localhost:3001";

function formatearTiempoDetalle(minutos) {
  if (!minutos || minutos === 0) return "0 min";
  if (minutos >= 60) {
    const horas = Math.floor(minutos / 60);
    const minutosRestantes = minutos % 60;
    if (minutosRestantes === 0) return `${horas}h`;
    return `${horas}h ${minutosRestantes}min`;
  }
  return `${minutos} min`;
}

function toPct(prob) {
  const n = typeof prob === "string" ? Number.parseFloat(prob) : Number(prob);
  if (!Number.isFinite(n)) return 0;
  return Math.min(100, Math.max(0, n * 100));
}

export default function ProductividadUsuarioDetallePage() {
  const params = useParams();
  const search = useSearchParams();
  const router = useRouter();

  const userId = String(params.userId || "");
  const date = search.get("date") || new Date().toISOString().slice(0, 10);

  const [data, setData] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const cargar = useCallback(async () => {
    setLoading(true);
    setErr("");
    try {
      const url = `${BACKEND_URL_DETALLE}/api/productividad/usuario/${encodeURIComponent(
        userId
      )}?date=${encodeURIComponent(date)}`;

      const res = await fetch(url);
      if (!res.ok) throw new Error(await res.text());
      setData(await res.json());
    } catch (e) {
      setErr(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  }, [userId, date]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const probs = useMemo(() => {
    const p = data?.prediccion || {};
    const raw = p.probabilidades ?? p.probabilities ?? {};
    return {
      no_productivo: raw.no_productivo ?? 0,
      regular: raw.regular ?? 0,
      productivo: raw.productivo ?? 0,
    };
  }, [data]);

  if (err) {
    return (
      <div style={{ padding: 16 }}>
        <button onClick={() => router.back()}>← Volver</button>
        <p style={{ marginTop: 12 }}>{err}</p>
      </div>
    );
  }

  return (
    <div style={{ padding: 16, maxWidth: 1100, margin: "0 auto" }}>
      <button onClick={() => router.back()} style={{ marginBottom: 12 }}>
        ← Volver
      </button>

      <h1 style={{ margin: 0 }}>Detalle de usuario</h1>
      <p style={{ marginTop: 6, opacity: 0.8 }}>
        {loading ? "Cargando..." : `Fecha: ${data?.date || date}`}
      </p>

      {data && (
        <>
          <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" }}>
            <div style={{ border: "1px solid #2a2a2a", borderRadius: 12, padding: 12 }}>
              <h3 style={{ marginTop: 0 }}>Usuario</h3>
              <div><b>Nombre:</b> {data.user?.colaborador}</div>
              <div><b>ID:</b> {data.user?.user_id}</div>
              <div><b>Email:</b> {data.user?.email || "-"}</div>
            </div>

            <div style={{ border: "1px solid #2a2a2a", borderRadius: 12, padding: 12 }}>
              <h3 style={{ marginTop: 0 }}>Resumen</h3>
              <div><b>Actividades:</b> {data.resumen?.actividades ?? 0}</div>
              <div><b>Revisiones:</b> {data.resumen?.revisiones ?? 0}</div>
              <div><b>Con duración:</b> {data.resumen?.revisiones_con_duracion ?? 0}</div>
              <div><b>Sin duración:</b> {data.resumen?.revisiones_sin_duracion ?? 0}</div>
              <div><b>Tiempo total:</b> {formatearTiempoDetalle(data.resumen?.tiempo_total ?? 0)}</div>
            </div>

            <div style={{ gridColumn: "1 / -1", border: "1px solid #2a2a2a", borderRadius: 12, padding: 12 }}>
              <h3 style={{ marginTop: 0 }}>Distribución de probabilidades</h3>
              {[
                { k: "no_productivo", t: "No Productivo" },
                { k: "regular", t: "Regular" },
                { k: "productivo", t: "Productivo" },
              ].map((x) => {
                const pct = toPct(probs[x.k]);
                return (
                  <div
                    key={x.k}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "180px 1fr 70px",
                      gap: 10,
                      alignItems: "center",
                      marginBottom: 8,
                    }}
                  >
                    <div>{x.t}</div>
                    <div style={{ height: 10, borderRadius: 999, background: "#222", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: "#5eead4" }} />
                    </div>
                    <div style={{ textAlign: "right" }}>{pct.toFixed(1)}%</div>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ marginTop: 16 }}>
            <h2 style={{ marginBottom: 8 }}>Actividades y revisiones</h2>

            {!loading && (!data.actividades || data.actividades.length === 0) && (
              <p>No hay actividades en este día.</p>
            )}

            {(data.actividades || []).map((a) => {
              const term = a?.revisiones?.terminadas?.length ?? 0;
              const conf = a?.revisiones?.confirmadas?.length ?? 0;
              const pend = a?.revisiones?.pendientes?.length ?? 0;

              return (
                <details
                  key={a.id}
                  style={{ border: "1px solid #2a2a2a", borderRadius: 12, padding: 12, marginBottom: 10 }}
                >
                  <summary style={{ cursor: "pointer" }}>
                    <b>{a.titulo || a.id}</b>{" "}
                    <span style={{ opacity: 0.8 }}>
                      (T: {term} / C: {conf} / P: {pend})
                    </span>
                  </summary>

                  <div style={{ marginTop: 10, opacity: 0.8 }}>
                    <div><b>ID:</b> {a.id}</div>
                    <div><b>dueStart:</b> {a.dueStart || "-"}</div>
                  </div>

                  {["terminadas", "confirmadas", "pendientes"].map((bucket) => {
                    const revs = a?.revisiones?.[bucket] || [];
                    if (!revs.length) return null;

                    return (
                      <div key={bucket} style={{ marginTop: 12 }}>
                        <h4 style={{ margin: "8px 0" }}>{bucket.toUpperCase()}</h4>
                        <div style={{ display: "grid", gap: 8 }}>
                          {revs.map((r, idx) => (
                            <div
                              key={r.id || `${bucket}-${idx}`}
                              style={{ border: "1px solid #333", borderRadius: 10, padding: 10 }}
                            >
                              <div><b>Duración:</b> {formatearTiempoDetalle(r.duracionMin || 0)}</div>
                              <div><b>Fecha creación:</b> {r.fechaCreacion || "-"}</div>
                              <div>
                                <b>Assignees:</b>{" "}
                                {(r.assignees || [])
                                  .map((x) => x?.name || x?.id)
                                  .filter(Boolean)
                                  .join(", ") || "-"}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </details>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}