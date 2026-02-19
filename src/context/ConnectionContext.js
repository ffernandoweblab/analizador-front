// src/context/ConnectionContext.js
import React, { createContext, useContext, useState, useCallback } from "react";

const ConnectionContext = createContext({
  isConnected: false,
  setConnected: () => {},
});

export function ConnectionProvider({ children }) {
  const [isConnected, setIsConnected] = useState(false);

  const setConnected = useCallback((value) => {
    setIsConnected(value);
  }, []);

  return (
    <ConnectionContext.Provider value={{ isConnected, setConnected }}>
      {children}
    </ConnectionContext.Provider>
  );
}

export function useConnection() {
  return useContext(ConnectionContext);
}