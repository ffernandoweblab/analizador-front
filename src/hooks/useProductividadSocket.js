// src/hooks/useProductividadSocket.js
import { useEffect, useRef, useCallback } from "react";
import { io } from "socket.io-client";

export function useProductividadSocket({
  backendUrl,
  day,
  enabled = true,

  onDayUpdate,
  onPatchUsers,
  onRefetch,
  onConnectionChange,

  patchDebounceMs = 250,
  refetchDebounceMs = 800,
}) {
  const socketRef = useRef(null);
  const mountedRef = useRef(true);

  const patchTimerRef = useRef(null);
  const refetchTimerRef = useRef(null);

  const onDayUpdateRef = useRef(onDayUpdate);
  const onPatchUsersRef = useRef(onPatchUsers);
  const onRefetchRef = useRef(onRefetch);
  const onConnectionChangeRef = useRef(onConnectionChange);
  const dayRef = useRef(day);

  useEffect(() => { onDayUpdateRef.current = onDayUpdate; }, [onDayUpdate]);
  useEffect(() => { onPatchUsersRef.current = onPatchUsers; }, [onPatchUsers]);
  useEffect(() => { onRefetchRef.current = onRefetch; }, [onRefetch]);
  useEffect(() => { onConnectionChangeRef.current = onConnectionChange; }, [onConnectionChange]);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    dayRef.current = day;
    const socket = socketRef.current;
    if (!socket || !socket.connected || !day) return;
    socket.emit("subscribe_day", { day });
    console.log("[ui-socket] subscribe day (day change)", day);
  }, [day]);

  const notifyConnection = useCallback((value) => {
    if (!mountedRef.current) return;
    onConnectionChangeRef.current?.(value);
  }, []);

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
      notifyConnection(true);

      const currentDay = dayRef.current;
      if (currentDay) {
        socket.emit("subscribe_day", { day: currentDay });
        console.log("[ui-socket] subscribe day (connect)", currentDay);
      }
    });

    socket.on("connect_error", (err) => {
      console.log("[ui-socket] connect_error", err?.message || err);
      notifyConnection(false);
    });

    socket.on("disconnect", (reason) => {
      console.log("[ui-socket] disconnected", reason);
      notifyConnection(false);
    });

    const handler = (msg) => {
      if (!msg) return;

      onDayUpdateRef.current?.(msg);

      const userIds = Array.isArray(msg.userIds) ? msg.userIds.filter(Boolean) : [];

      if (userIds.length > 0 && typeof onPatchUsersRef.current === "function") {
        clearTimeout(patchTimerRef.current);
        patchTimerRef.current = setTimeout(() => {
          onPatchUsersRef.current?.(userIds, msg);
        }, patchDebounceMs);
        return;
      }

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
      notifyConnection(false);
    };
  }, [enabled, backendUrl, patchDebounceMs, refetchDebounceMs, notifyConnection]);
}
