// src/components/layout/Sidebar.jsx
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  alpha,
  Stack,
} from '@mui/material';

import MenuIcon from '@mui/icons-material/Menu';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import TodayOutlinedIcon from '@mui/icons-material/TodayOutlined';
import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

export const SIDEBAR_WIDTH = 280;
const HEADER_HEIGHT = { xs: 64, sm: 72 };


function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const menuItems = [
    {
      path: '/prediccionhoy',
      label: 'Informe de hoy',
      icon: <TodayOutlinedIcon />,
      gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
      color: '#3b82f6',
    },
    {
      path: '/reportes',
      label: 'Reportes',
      icon: <BarChartOutlinedIcon />,
      gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
      color: '#8b5cf6',
    },
  ];

  const handleNavigate = (path) => {
    navigate(path);
    setMobileOpen(false); // en mobile siempre cerramos al navegar
  };

  const sidebarContent = (
    <Box
      sx={{
        width: SIDEBAR_WIDTH,
        height: '100%',
        bgcolor: '#0f1419',
        borderRight: '1px solid',
        borderColor: alpha('#fff', 0.08),
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Logo/Header */}
      <Box
        sx={{
          p: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          borderBottom: '1px solid',
          borderColor: alpha('#fff', 0.08),
        }}
      >
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 2,
            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(59, 130, 246, 0.3)',
          }}
        >
          <TrendingUpIcon sx={{ fontSize: 28, color: 'white' }} />
        </Box>

        <Box>
          <Typography
            variant="h6"
            fontWeight={900}
            sx={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Productividad
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Sistema de análisis
          </Typography>
        </Box>
      </Box>

      {/* Navigation */}
      <Box sx={{ flex: 1, overflowY: 'auto', py: 2 }}>
        <List sx={{ px: 2 }}>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;

            return (
              <ListItem key={item.path} disablePadding sx={{ mb: 1 }}>
                <ListItemButton
                  onClick={() => handleNavigate(item.path)}
                  sx={{
                    borderRadius: 2,
                    py: 1.5,
                    px: 2,
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'all 0.3s ease',
                    ...(isActive && {
                      bgcolor: alpha(item.color, 0.12),
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: 4,
                        background: item.gradient,
                        borderRadius: '0 4px 4px 0',
                      },
                    }),
                    '&:hover': {
                      bgcolor: alpha(item.color, isActive ? 0.15 : 0.08),
                      transform: 'translateX(4px)',
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 40,
                      color: isActive ? item.color : 'text.secondary',
                      transition: 'color 0.3s ease',
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>

                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      fontWeight: isActive ? 700 : 600,
                      color: isActive ? 'text.primary' : 'text.secondary',
                      fontSize: '0.95rem',
                    }}
                  />

                  {isActive && (
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: item.gradient,
                        boxShadow: `0 0 8px ${item.color}`,
                      }}
                    />
                  )}
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>

      {/* Footer */}
      <Box
        sx={{
          p: 3,
          borderTop: '1px solid',
          borderColor: alpha('#fff', 0.08),
        }}
      >
        <Box
          sx={{
            p: 2,
            borderRadius: 2,
            bgcolor: alpha('#3b82f6', 0.08),
            border: '1px solid',
            borderColor: alpha('#3b82f6', 0.2),
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <AssessmentOutlinedIcon sx={{ fontSize: 20, color: '#3b82f6' }} />
            <Box>
              <Typography variant="caption" fontWeight={700} sx={{ color: 'text.primary', display: 'block' }}>
                Panel v1.0
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
                Sistema activo
              </Typography>
            </Box>
          </Stack>
        </Box>
      </Box>
    </Box>
  );

  return (
    <>
      {/* ✅ Desktop: permanent SOLO md+ (CSS decide, no isDesktop) */}
      <Drawer
        variant="permanent"
        open
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            width: SIDEBAR_WIDTH,
            boxSizing: 'border-box',
            border: 'none',
            backgroundImage: 'none',
            bgcolor: 'transparent',
          },
        }}
      >
        {sidebarContent}
      </Drawer>

      {/* ✅ Mobile: botón + temporary SOLO xs/sm */}
      <Box sx={{ display: { xs: 'block', md: 'none' } }}>
        <IconButton
          onClick={() => setMobileOpen((v) => !v)}
          aria-label={mobileOpen ? 'Cerrar menú' : 'Abrir menú'}
          sx={{
            position: 'fixed',
            top: 16,
            left: 16,
            zIndex: (t) => t.zIndex.drawer + 2,
            bgcolor: alpha('#0f1419', 0.85),
            border: '1px solid',
            borderColor: alpha('#fff', 0.08),
            backdropFilter: 'blur(8px)',
            '&:hover': { bgcolor: alpha('#0f1419', 0.95) },
          }}
        >
          <MenuIcon />
        </IconButton>

        <Drawer
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          variant="temporary"
          ModalProps={{ keepMounted: true }}
          PaperProps={{
            sx: {
              width: SIDEBAR_WIDTH,
              maxWidth: SIDEBAR_WIDTH,
              border: 'none',
              backgroundImage: 'none',

              // ✅ CLAVE: que empiece debajo del header
              top: { xs: '64px !important', sm: '72px !important' },
              height: { xs: 'calc(100% - 64px)', sm: 'calc(100% - 72px)' },
            },
          }}
        >
          {sidebarContent}
        </Drawer>


      </Box>
    </>
  );
}

export default Sidebar;
