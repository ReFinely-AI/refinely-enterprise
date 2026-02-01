import React from 'react';
import {
  AppBar,
  Toolbar,
  Avatar,
  Typography,
  Box,
  Chip,
  MenuItem,
  Select,
  SelectChangeEvent,
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { useOrganizations } from '../../hooks/useOrganizations';
import { Button } from '../ui/Button';

const TopBar: React.FC = () => {
  const { user, logout, activeOrgId, setActiveOrgId } = useAuth();
  const { organizations } = useOrganizations();

  const handleOrgChange = (e: SelectChangeEvent<string>) => {
    const value = Number(e.target.value);
    if (!Number.isNaN(value)) {
      setActiveOrgId(value);
    }
  };

  return (
    <AppBar
      position="static"
      sx={{
        backgroundColor: 'white',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        borderBottom: '1px solid #E5E7EB',
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar
            sx={{
              width: 40,
              height: 40,
              bgcolor: 'primary.main',
              mr: 2,
              fontSize: '1.1rem',
            }}
          >
            R
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827' }}>
              ReFinely
            </Typography>
            <Typography variant="caption" sx={{ color: '#6B7280' }}>
              Agentic AI Reconciliation
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {organizations.length > 0 && (
            <Select
              size="small"
              value={activeOrgId ? String(activeOrgId) : ''}
              onChange={handleOrgChange}
              displayEmpty
              sx={{
                minWidth: 180,
                backgroundColor: '#EFF6FF',
                borderRadius: 2,
                '& .MuiSelect-select': { py: 0.75, px: 1.5 },
              }}
            >
              {organizations.map((org) => (
                <MenuItem key={org.id} value={org.id}>
                  {org.name} • {org.currency}
                </MenuItem>
              ))}
            </Select>
          )}

          <Chip
            label={`Hi, ${user?.full_name?.split(' ')[0] || 'User'}`}
            size="small"
            sx={{
              height: 32,
              backgroundColor: '#F3F4F6',
              '& .MuiChip-label': { px: 1.5 },
            }}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={logout}
            style={{ borderColor: '#D1D5DB', color: '#374151' }}
          >
            Logout
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default TopBar;
