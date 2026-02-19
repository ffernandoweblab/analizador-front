// src/components/layout/Header.jsx
import React from "react";
import { AppBar, Toolbar, Box, Typography, alpha } from "@mui/material";
import { SIDEBAR_WIDTH } from "./Sidebar";
import logo from "../../assets/weblab logo.webp";
import { useConnection } from "../../context/ConnectionContext";

function ConnectionBadge({ isConnected }) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        px: 1.5,
        py: 0.6,
        borderRadius: 2,
        border: "1px solid",
        borderColor: isConnected
          ? alpha("#10b981", 0.35)
          : alpha("#ef4444", 0.35),
        bgcolor: isConnected
          ? alpha("#10b981", 0.08)
          : alpha("#ef4444", 0.08),
        transition: "all 0.4s ease",
      }}
    >
      <Box
        sx={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          bgcolor: isConnected ? "#10b981" : "#ef4444",
          boxShadow: isConnected
            ? "0 0 6px 2px rgba(16, 185, 129, 0.5)"
            : "0 0 6px 2px rgba(239, 68, 68, 0.4)",
          animation: isConnected ? "pulse-green 2s ease-in-out infinite" : "none",
          "@keyframes pulse-green": {
            "0%, 100%": {
              boxShadow: "0 0 4px 1px rgba(16, 185, 129, 0.4)",
            },
            "50%": {
              boxShadow: "0 0 8px 3px rgba(16, 185, 129, 0.7)",
            },
          },
        }}
      />
      <Typography
        variant="caption"
        sx={{
          color: isConnected
            ? alpha("#10b981", 0.95)
            : alpha("#ef4444", 0.85),
          fontWeight: 700,
          fontSize: 12,
          letterSpacing: 0.3,
          whiteSpace: "nowrap",
        }}
      >
        {isConnected ? "Conectado" : "Sin conexión"}
      </Typography>
    </Box>
  );
}

function Header() {
  const { isConnected } = useConnection();

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        bgcolor: "#0f1419",
        borderBottom: "none",
        boxShadow: "none",
        left: { xs: 0, md: `${SIDEBAR_WIDTH}px` },
        width: { xs: "100%", md: `calc(100% - ${SIDEBAR_WIDTH}px)` },
        zIndex: (t) => t.zIndex.drawer + 1,
      }}
    >
      <Toolbar
        sx={{
          minHeight: { xs: 64, sm: 72 },
          px: { xs: 2, sm: 3, md: 4 },
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            pl: { xs: 7, sm: 8, md: 0 },
          }}
        >
          <Box
            component="img"
            src={logo}
            alt="WebLab"
            sx={{
              height: { xs: 40, sm: 48 },
              width: "auto",
              objectFit: "contain",
              filter: "none",
            }}
          />

          <ConnectionBadge isConnected={isConnected} />
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Header;