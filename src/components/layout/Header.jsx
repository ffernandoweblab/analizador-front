import React from "react";
// import { useTheme } from "../../context/ThemeContext";
import {
  AppBar,
  Toolbar,
  Box,
  // IconButton,
  // alpha,
  // Container,
} from "@mui/material";
// import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
// import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import logo from "../../assets/weblab logo.webp";

function Header() {
  // const { theme, toggleTheme } = useTheme();

  return (
    <AppBar
  position="fixed"
  elevation={0}
  sx={{
    bgcolor: "#0f1419",
    borderBottom: "none",
    boxShadow: "none",
    zIndex: 1201,
    left: 280,
    width: "calc(100% - 280px)",
  }}
>

      <Toolbar
        sx={{
          minHeight: { xs: 64, sm: 72 },
          px: { xs: 2, sm: 3, md: 4 },
        }}
      >
        {/* Logo */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            flex: 1,
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

        {/* Theme Toggle Button */}
        {/* <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <IconButton
            onClick={toggleTheme}
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2,
              bgcolor: alpha("#fff", 0.05),
              border: "1px solid",
              borderColor: alpha("#fff", 0.08),
              transition: "all 0.3s ease",
              "&:hover": {
                bgcolor: alpha("#fff", 0.1),
                borderColor: alpha("#f59e0b", 0.3),
                transform: "scale(1.05)",
              },
            }}
            title={`Cambiar a tema ${theme === "light" ? "oscuro" : "claro"}`}
            aria-label="Toggle theme"
          >
            {theme === "light" ? (
              <DarkModeOutlinedIcon sx={{ fontSize: 22, color: "#f59e0b" }} />
            ) : (
              <LightModeOutlinedIcon sx={{ fontSize: 22, color: "#fbbf24" }} />
            )}
          </IconButton>
        </Box> */}
      </Toolbar>
    </AppBar>
  );
}

export default Header;
