// src/pages/SignUp.tsx
import React, { useState } from 'react';
import {
  Container,
  TextField,
  Paper,
  Typography,
  Box,
  Alert,
  Grid,
  Checkbox,
  FormControlLabel,
  Divider,
} from '@mui/material';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const SignUp: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [orgName, setOrgName] = useState(''); // for now only UI, backend doesn’t use it yet
  const [currency, setCurrency] = useState('PKR'); // UI only for now
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!agree) {
      setError('Please agree to the terms and policy');
      return;
    }

    setLoading(true);
    try {
      await register({
        email,
        password,
        full_name: fullName || undefined,
      });
      // orgName + currency can be used later in onboarding / first organization API call
      navigate('/dashboard');
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#FFFFFF',
        display: 'flex',
        alignItems: 'stretch',
      }}
    >
      <Grid container>
        {/* Left column – form */}
        <Grid
          item
          xs={12}
          md={5}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            py: 6,
          }}
        >
          <Container maxWidth="sm">
            <Typography variant="h4" sx={{ fontWeight: 500, mb: 1 }}>
              Get started now
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
              Create your ReFinely workspace for automated reconciliation and anomaly detection.
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={onSubmit} noValidate>
              <TextField
                fullWidth
                label="Full name"
                margin="normal"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
              <TextField
                fullWidth
                label="Email address"
                type="email"
                margin="normal"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <TextField
                fullWidth
                label="Password"
                type="password"
                margin="normal"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <TextField
                fullWidth
                label="Organization name"
                margin="normal"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                helperText="Used later when creating your first organization"
              />
              <TextField
                fullWidth
                label="Currency"
                margin="normal"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                helperText="e.g. PKR, USD – stored in onboarding later"
              />

              <FormControlLabel
                sx={{ mt: 1 }}
                control={
                  <Checkbox
                    checked={agree}
                    onChange={(e) => setAgree(e.target.checked)}
                    color="primary"
                    size="small"
                  />
                }
                label={
                  <Typography variant="body2">
                    I agree to the{' '}
                    <Box component="span" sx={{ color: 'primary.main', fontWeight: 500 }}>
                      terms &amp; policy
                    </Box>
                  </Typography>
                }
              />

              <Box sx={{ mt: 3 }}>
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  loading={loading}
                  fullWidth
                >
                  Register
                </Button>
              </Box>

              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  my: 3,
                }}
              >
                <Divider sx={{ flexGrow: 1 }} />
                <Typography variant="caption" sx={{ mx: 1.5, color: 'text.secondary' }}>
                  Or
                </Typography>
                <Divider sx={{ flexGrow: 1 }} />
              </Box>

              <Grid container spacing={1}>
                <Grid item xs={12} sm={6}>
                  <Button type="button" variant="outline" size="sm" fullWidth>
                    Sign in with Google
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Button type="button" variant="outline" size="sm" fullWidth>
                    Sign in with Apple
                  </Button>
                </Grid>
              </Grid>

              <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Typography variant="body2">
                  Have an account?{' '}
                  <Box
                    component="button"
                    type="button"
                    onClick={() => navigate('/login')}
                    sx={{
                      border: 'none',
                      background: 'none',
                      color: 'primary.main',
                      cursor: 'pointer',
                      fontWeight: 500,
                      p: 0,
                    }}
                  >
                    Sign in
                  </Box>
                </Typography>
              </Box>
            </Box>
          </Container>
        </Grid>

        {/* Right column – marketing copy */}
        <Grid
          item
          xs={12}
          md={7}
          sx={{
            position: 'relative',
            bgcolor: '#F5F5FA',
            display: { xs: 'none', md: 'flex' },
            alignItems: 'center',
            justifyContent: 'center',
            px: 6,
          }}
        >
          <Box sx={{ maxWidth: 620 }}>
            <Typography variant="h3" sx={{ fontWeight: 500, mb: 3 }}>
              Close your books with confidence.
            </Typography>
            <Typography variant="h5" sx={{ color: '#B1B1B1', fontWeight: 400 }}>
              Automated anomaly detection and reconciliation for the modern enterprise.
              Trust your financial data with AI‑driven auditing.
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SignUp;
