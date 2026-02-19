// src/hooks/useProductividadSocket.js
import { useEffect, useRef, useState } from "react";
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
  const [isConnected, setIsConnected] = useState(false);

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
  useEffect(() => { dayRef.current = day; }, [day]);

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
      setIsConnected(true);
      onConnectionChangeRef.current?.(true);

      const currentDay = dayRef.current;
      if (currentDay) {
        socket.emit("subscribe_day", { day: currentDay });
        console.log("[ui-socket] re-subscribe day", currentDay);
      }
    });

    socket.on("connect_error", (err) => {
      console.log("[ui-socket] connect_error", err?.message || err);
      setIsConnected(false);
      onConnectionChangeRef.current?.(false);
    });

    socket.on("disconnect", (reason) => {
      console.log("[ui-socket] disconnected", reason);
      setIsConnected(false);
      onConnectionChangeRef.current?.(false);
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
      setIsConnected(false);
    };
  }, [enabled, backendUrl, patchDebounceMs, refetchDebounceMs]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !enabled || !day) return;

    console.log("[ui-socket] subscribe day", day);
    socket.emit("subscribe_day", { day });

    return () => {
      console.log("[ui-socket] unsubscribe day", day);
      try { socket.emit("unsubscribe_day", { day }); } catch {}
    };
  }, [enabled, day]);

  return { isConnected };
}