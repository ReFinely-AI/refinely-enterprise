import React from 'react';
import { Box, useMediaQuery } from '@mui/material';

interface AppLayoutProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children, sidebar }) => {
  const isMobile = useMediaQuery('(max-width: 768px)');

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#FAFBFC' }}>
      {!isMobile && sidebar && (
        <Box
          component="aside"
          sx={{
            width: 280,
            borderRight: '1px solid #E5E7EB',
            bgcolor: 'white',
          }}
        >
          {sidebar}
        </Box>
      )}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          overflow: 'auto',
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default AppLayout;
