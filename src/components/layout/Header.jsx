// src/components/layout/Header.jsx
import React from "react";
import { AppBar, Toolbar, Box } from "@mui/material";
import { SIDEBAR_WIDTH } from "./Sidebar";
import logo from "../../assets/weblab logo.webp";

function Header() {
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
        {/* ✅ CLAVE: en mobile deja espacio para el botón hamburguesa flotante */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            flex: 1,
            pl: { xs: 7, sm: 8, md: 0 }, // 7*8=56px, 8*8=64px
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
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Header;
