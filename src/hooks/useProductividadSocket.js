// src/hooks/useProductividadSocket.js
import { useEffect, useRef } from "react";
import { io } from "socket.io-client";

export function useProductividadSocket({
  backendUrl,
  day,
  enabled = true,

  onDayUpdate,     // (msg) => void  (toast, etc)
  onPatchUsers,    // (userIds, msg) => void  (patch fino)
  onRefetch,       // () => void  (fallback)

  patchDebounceMs = 250,
  refetchDebounceMs = 800,
}) {
  const socketRef = useRef(null);

  const patchTimerRef = useRef(null);
  const refetchTimerRef = useRef(null);

  const onDayUpdateRef = useRef(onDayUpdate);
  const onPatchUsersRef = useRef(onPatchUsers);
  const onRefetchRef = useRef(onRefetch);

  const dayRef = useRef(day);

  // mantener refs actualizados
  useEffect(() => { onDayUpdateRef.current = onDayUpdate; }, [onDayUpdate]);
  useEffect(() => { onPatchUsersRef.current = onPatchUsers; }, [onPatchUsers]);
  useEffect(() => { onRefetchRef.current = onRefetch; }, [onRefetch]);
  useEffect(() => { dayRef.current = day; }, [day]);

  // 1) crear socket una sola vez (mientras enabled/backendUrl existan)
  useEffect(() => {
    if (!enabled || !backendUrl) return;

    const socket = io(backendUrl, {
      transports: ["websocket"],
      withCredentials: true,
      reconnection: true,
      reconnectionDelayMax: 2000,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("[ui-socket] connected", socket.id);

      // ✅ al conectar/reconectar, re-suscribe al día actual
      const currentDay = dayRef.current;
      if (currentDay) {
        socket.emit("subscribe_day", { day: currentDay });
        console.log("[ui-socket] re-subscribe day", currentDay);
      }
    });

    socket.on("connect_error", (err) => {
      console.log("[ui-socket] connect_error", err?.message || err);
    });

    socket.on("disconnect", (reason) => {
      console.log("[ui-socket] disconnected", reason);
    });

    // ✅ handler global (una sola vez)
    const handler = (msg) => {
      if (!msg) return;

      onDayUpdateRef.current?.(msg);

      // 2) patch fino (si el server manda userIds)
      const userIds = Array.isArray(msg.userIds) ? msg.userIds.filter(Boolean) : [];

      if (userIds.length > 0 && typeof onPatchUsersRef.current === "function") {
        clearTimeout(patchTimerRef.current);
        patchTimerRef.current = setTimeout(() => {
          onPatchUsersRef.current?.(userIds, msg);
        }, patchDebounceMs);
        return; // si parchamos, normalmente NO necesitas refetch
      }

      // 3) fallback: refetch (si no hay userIds o no hay patcher)
      if (typeof onRefetchRef.current === "function") {
        clearTimeout(refetchTimerRef.current);
        refetchTimerRef.current = setTimeout(() => {
          onRefetchRef.current?.();
        }, refetchDebounceMs);
      }
    };

    socket.on("day_update", handler);

    return () => {
      clearTimeout(patchTimerRef.current);
      clearTimeout(refetchTimerRef.current);
      patchTimerRef.current = null;
      refetchTimerRef.current = null;

      try { socket.off("day_update", handler); } catch {}
      try { socket.disconnect(); } catch {}
      socketRef.current = null;
    };
  }, [enabled, backendUrl, patchDebounceMs, refetchDebounceMs]);

  // 2) subscribe/unsubscribe cuando cambia el day
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !enabled || !day) return;

    // subscribe inmediato (si ya está conectado)
    console.log("[ui-socket] subscribe day", day);
    socket.emit("subscribe_day", { day });

    return () => {
      // al cambiar day o desmontar
      console.log("[ui-socket] unsubscribe day", day);
      try { socket.emit("unsubscribe_day", { day }); } catch {}
    };
  }, [enabled, day]);
}
