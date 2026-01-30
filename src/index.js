// src/index.js
import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { ThemeProvider as AppThemeProvider } from "./context/ThemeContext";
import { BrowserRouter } from "react-router-dom";

// ✅ MUI
import { CssBaseline, ThemeProvider as MuiThemeProvider, createTheme } from "@mui/material";

const muiTheme = createTheme({
  palette: { mode: "dark" }, // "light" si quieres
});

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <MuiThemeProvider theme={muiTheme}>
      <CssBaseline />
      <AppThemeProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </AppThemeProvider>
    </MuiThemeProvider>
  </React.StrictMode>
);

reportWebVitals();
