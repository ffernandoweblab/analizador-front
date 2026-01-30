// src/components/layout/Layout.jsx
import React from "react";
import { Box, useTheme } from "@mui/material";
import Header from "./Header";
import Sidebar, { SIDEBAR_WIDTH } from "./Sidebar";

function Layout({ children, activeView, setActiveView }) {
  const theme = useTheme();

  return (
    <Box sx={{ minHeight: "100vh", width: "100%" }}>
      <Header />

      <Box sx={{ display: "flex", width: "100%" }}>
        <Sidebar activeView={activeView} setActiveView={setActiveView} />

        <Box
          component="main"
          sx={{
            flex: 1,
            minWidth: 0,
            width: "100%",
            maxWidth: "100%",
            ml: { xs: 0, md: `${SIDEBAR_WIDTH}px` },
            px: { xs: 2, md: 3 },
            py: { xs: 2, md: 3 },
            overflowX: "hidden",
          }}
        >
          {/* ✅ CLAVE: esto evita que el Header fixed tape el contenido */}
          <Box sx={theme.mixins.toolbar} />
          {children}
        </Box>
      </Box>
    </Box>
  );
}

export default Layout;