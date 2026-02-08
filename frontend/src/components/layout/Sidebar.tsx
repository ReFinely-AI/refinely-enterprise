import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material';
import { LayoutDashboard, Banknote, ListChecks, Building2 } from 'lucide-react';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const items = [
    { label: 'Dashboard', icon: <LayoutDashboard size={18} />, to: '/dashboard' },
    { label: 'Organizations', icon: <Building2 size={18} />, to: '/organizations' },
    { label: 'Bank Accounts', icon: <Banknote size={18} />, to: '/bank-accounts' },
    { label: 'Reconciliations', icon: <ListChecks size={18} />, to: '/reconciliations' },
  ];

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 2 }}>
      <Typography
        variant="overline"
        sx={{ letterSpacing: 1, color: 'text.secondary', mb: 1, px: 1.5 }}
      >
        Navigation
      </Typography>
      <List sx={{ flexGrow: 1 }}>
        {items.map((item) => {
          const active = location.pathname.startsWith(item.to);
          return (
            <ListItemButton
              key={item.label}
              selected={active}
              onClick={() => navigate(item.to)}
              sx={{
                mb: 0.5,
                borderRadius: 2,
                '&.Mui-selected': {
                  bgcolor: '#EFF6FF',
                  '&:hover': { bgcolor: '#DBEAFE' },
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 32,
                  color: active ? '#1D4ED8' : '#6B7280',
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  fontSize: 14,
                  fontWeight: active ? 600 : 500,
                }}
              />
            </ListItemButton>
          );
        })}
      </List>
    </Box>
  );
};

export default Sidebar;
