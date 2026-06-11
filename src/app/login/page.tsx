'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { Eye, EyeOff, Lock, Mail, AlertCircle, Activity, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const { login } = useApp();
  const router = useRouter();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const ok = await login(email, password);
    setLoading(false);
    if (ok) router.push('/dashboard');
    else setError('Invalid email or password. Check your credentials and try again.');
  };

  const demos = [
    { email: 'almaz@health.gov.et',  role: 'Admin',         bg: 'linear-gradient(135deg,#ef4444,#b91c1c)' },
    { email: 'tigist@health.gov.et', role: 'Supervisor',    bg: 'linear-gradient(135deg,#f59e0b,#b45309)' },
    { email: 'abebe@health.gov.et',  role: 'Health Worker', bg: 'linear-gradient(135deg,#6366f1,#4f46e5)' },
  ];

  const inputStyle: React.CSSProperties = {
    width: '100%', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 8, padding: '11px 14px', fontSize: 14,
    background: 'rgba(255,255,255,0.05)', color: '#e6edf3',
    outline: 'none', fontFamily: 'inherit', lineHeight: 1.5,
    transition: 'border-color 0.15s, box-shadow 0.15s',
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      background: '#0d1117', position: 'relative', overflow: 'hidden',
    }}>
      {/* Grid bg */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none',
        backgroundImage:
          'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), ' +
          'linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }} />
      {/* Glows */}
      <div style={{
        position: 'fixed', top: 0, left: 0, width: 700, height: 700, pointerEvents: 'none',
        background: 'radial-gradient(ellipse at 0% 0%, rgba(99,102,241,0.09) 0%, transparent 60%)',
      }} />
      <div style={{
        position: 'fixed', bottom: 0, right: 0, width: 600, height: 600, pointerEvents: 'none',
        background: 'radial-gradient(ellipse at 100% 100%, rgba(16,185,129,0.07) 0%, transparent 60%)',
      }} />

      {/* ── Left panel ── */}
      <div style={{
        display: 'none', // hidden on mobile
        flex: 1, flexDirection: 'column', justifyContent: 'space-between',
        padding: '48px 56px', position: 'relative', zIndex: 1,
      }}
        className="login-left"
      >
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 42, height: 42, borderRadius: 14, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
            boxShadow: '0 0 24px rgba(99,102,241,0.4)',
          }}>
            <Activity size={20} color="white" />
          </div>
          <div>
            <p style={{ color: '#e6edf3', fontWeight: 700, fontSize: 16, margin: 0, lineHeight: 1.3 }}>HealthTrack MCH</p>
            <p style={{ color: '#6366f1', fontSize: 12, fontWeight: 500, margin: 0 }}>Community Health System</p>
          </div>
        </div>

        {/* Hero */}
        <div>
          {/* Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '6px 14px', borderRadius: 999, marginBottom: 24,
            background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)',
            color: '#818cf8', fontSize: 12, fontWeight: 600,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#818cf8', animation: 'pulse 2s infinite' }} />
            Ethiopian Federal Ministry of Health
          </div>

          <h1 style={{
            color: '#e6edf3', fontSize: 48, fontWeight: 900,
            lineHeight: 1.05, letterSpacing: '-0.03em', margin: '0 0 20px',
          }}>
            Digitizing<br />
            <span style={{
              background: 'linear-gradient(135deg, #818cf8, #c084fc)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>
              Maternal &<br />Child Health
            </span>
          </h1>

          <p style={{ color: '#8b949e', fontSize: 15, lineHeight: 1.7, maxWidth: 380, margin: 0 }}>
            Real-time health data collection, risk monitoring, and reporting for community health workers across Ethiopia.
          </p>

          {/* Stats */}
          <div style={{ display: 'flex', gap: 16, marginTop: 40 }}>
            {[
              { value: '1,248', label: 'Households', color: '#818cf8' },
              { value: '330',   label: 'Mothers',    color: '#f472b6' },
              { value: '412',   label: 'Children',   color: '#34d399' },
            ].map(s => (
              <div key={s.label} style={{
                padding: '16px 20px', borderRadius: 14, textAlign: 'center',
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                minWidth: 90,
              }}>
                <p style={{ color: s.color, fontSize: 26, fontWeight: 900, margin: 0, letterSpacing: '-0.03em' }}>{s.value}</p>
                <p style={{ color: '#6b7280', fontSize: 12, fontWeight: 500, margin: '4px 0 0' }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        <p style={{ color: '#484f58', fontSize: 12, margin: 0 }}>© 2024 Ethiopian Federal Ministry of Health</p>
      </div>

      {/* ── Right panel (login form) ── */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24, position: 'relative', zIndex: 1,
      }}>
        <div style={{ width: '100%', maxWidth: 420 }}>

          {/* Mobile logo */}
          <div className="login-mobile-logo" style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
            }}>
              <Activity size={18} color="white" />
            </div>
            <p style={{ color: '#e6edf3', fontWeight: 700, fontSize: 15, margin: 0 }}>HealthTrack MCH</p>
          </div>

          {/* Card */}
          <div style={{
            background: 'linear-gradient(145deg, rgba(28,33,40,0.95), rgba(22,27,34,0.95))',
            backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.09)',
            borderRadius: 20, padding: 36,
            boxShadow: '0 32px 80px rgba(0,0,0,0.5)',
          }}>
            <h2 style={{ color: '#e6edf3', fontSize: 22, fontWeight: 900, margin: '0 0 6px', letterSpacing: '-0.025em' }}>
              Welcome back
            </h2>
            <p style={{ color: '#6b7280', fontSize: 14, margin: '0 0 28px' }}>Sign in to your account to continue</p>

            {error && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                borderRadius: 10, padding: '10px 14px', marginBottom: 20,
                background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
                color: '#fca5a5', fontSize: 13,
              }}>
                <AlertCircle size={14} style={{ flexShrink: 0 }} />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Email */}
              <div>
                <label htmlFor="email" style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#8b949e', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
                  Email Address
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#6b7280', pointerEvents: 'none' }} />
                  <input
                    id="email" type="email" value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@health.gov.et" required autoComplete="email"
                    style={{ ...inputStyle, paddingLeft: 38 }}
                    onFocus={e => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.6)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.12)'; }}
                    onBlur={e =>  { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';  e.currentTarget.style.boxShadow = 'none'; }}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#8b949e', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#6b7280', pointerEvents: 'none' }} />
                  <input
                    id="password" type={showPass ? 'text' : 'password'} value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••" required autoComplete="current-password"
                    style={{ ...inputStyle, paddingLeft: 38, paddingRight: 40 }}
                    onFocus={e => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.6)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.12)'; }}
                    onBlur={e =>  { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';  e.currentTarget.style.boxShadow = 'none'; }}
                  />
                  <button
                    type="button" onClick={() => setShowPass(!showPass)}
                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', display: 'flex' }}
                    aria-label={showPass ? 'Hide password' : 'Show password'}
                  >
                    {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit" disabled={loading}
                style={{
                  width: '100%', padding: '12px', borderRadius: 10, border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                  background: loading ? 'rgba(99,102,241,0.4)' : 'linear-gradient(135deg, #6366f1, #4f46e5)',
                  color: 'white', fontWeight: 700, fontSize: 14,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  boxShadow: loading ? 'none' : '0 4px 20px rgba(99,102,241,0.4)',
                  transition: 'all 0.15s', marginTop: 4,
                }}
              >
                {loading ? (
                  <>
                    <span style={{
                      width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)',
                      borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block',
                    }} />
                    Signing in…
                  </>
                ) : (
                  <>Sign In <ArrowRight size={14} /></>
                )}
              </button>
            </form>

            {/* Demo accounts */}
            <div style={{ marginTop: 24, paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.07)' }}>
              <p style={{ color: '#484f58', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'center', marginBottom: 12 }}>
                Demo Accounts
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {demos.map(acc => (
                  <button
                    key={acc.email}
                    onClick={() => setEmail(acc.email)}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '10px 14px', borderRadius: 10, cursor: 'pointer', textAlign: 'left',
                      background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.07)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.12)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)'; }}
                  >
                    <span style={{ color: '#8b949e', fontSize: 13 }}>{acc.email}</span>
                    <span style={{ color: 'white', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 6, background: acc.bg, flexShrink: 0 }}>
                      {acc.role}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Responsive: show left panel on large screens */}
      <style>{`
        @media (min-width: 1024px) {
          .login-left { display: flex !important; }
          .login-mobile-logo { display: none !important; }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity:0.5; } 50% { opacity:1; } }
      `}</style>
    </div>
  );
}
