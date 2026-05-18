import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { Icons } from '../components/Icons';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  // Redirect if already logged in
  useEffect(() => {
    const session = localStorage.getItem('jo_admin_session');
    if (session) {
      navigate('/');
    }
  }, [navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    // Get password from environment variables, fallback to the exact value in .env
    const envPassword = import.meta.env.VITE_ADMIN_PASSWORD || 'Yazh@101010';
    const targetEmail = 'yazan.hijazi@joacademy.com';

    setTimeout(() => {
      if (email.trim().toLowerCase() === targetEmail && password === envPassword) {
        // Save session
        const sessionData = {
          name: 'يزن حجازي',
          email: targetEmail,
          loggedInAt: Date.now(),
        };
        localStorage.setItem('jo_admin_session', JSON.stringify(sessionData));
        toast('تم تسجيل الدخول بنجاح.', 'success');
        navigate('/');
      } else {
        toast('عذراً! البريد الإلكتروني أو كلمة المرور غير صحيحة.', 'error');
      }
      setLoading(false);
    }, 600);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at 50% 0%, var(--brand-deep) 0%, var(--brand) 60%, var(--brand-mid) 100%)',
      padding: '24px 16px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Dynamic Background Glows */}
      <div style={{
        position: 'absolute',
        top: '-10%',
        right: '10%',
        width: '450px',
        height: '450px',
        background: 'radial-gradient(circle, rgba(245,158,11,0.12) 0%, transparent 70%)',
        zIndex: 1,
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-10%',
        left: '10%',
        width: '500px',
        height: '500px',
        background: 'radial-gradient(circle, rgba(32,79,140,0.15) 0%, transparent 70%)',
        zIndex: 1,
        pointerEvents: 'none'
      }} />

      {/* Login Card */}
      <div className="form-card" style={{
        width: '100%',
        maxWidth: '460px',
        zIndex: 2,
        padding: '40px 32px',
        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.25)',
        background: 'rgba(255, 255, 255, 0.98)',
        borderRadius: '24px',
        position: 'relative'
      }}>
        {/* Header Branding */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 18px',
            background: 'var(--surface)',
            borderRadius: '100px',
            border: '1px solid rgba(32,79,140,0.08)',
            marginBottom: '20px',
            boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.02)'
          }}>
            <img 
              src="/d018753e-b8d8-4e62-9be1-5991e90071f5_removalai_preview.png" 
              alt="JoAcademy Logo" 
              style={{ height: '24px', objectFit: 'contain' }}
            />
            <div style={{ width: '1.5px', height: '16px', background: 'rgba(32,79,140,0.15)' }} />
            <span style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--brand)' }}>
              بوابة المسؤولين
            </span>
          </div>

          <h2 style={{
            fontSize: '1.6rem',
            fontWeight: 900,
            color: 'var(--brand-deep)',
            margin: '0 0 8px 0',
            fontFamily: 'inherit'
          }}>
            تسجيل دخول المسؤولين
          </h2>
          <p style={{
            fontSize: '0.88rem',
            color: 'var(--text-3)',
            margin: 0,
            fontWeight: 500
          }}>
            يرجى تسجيل الدخول للوصول إلى لوحة التحكم وإدارة النماذج
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Email Field */}
          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{
              fontWeight: 700,
              fontSize: '0.85rem',
              color: 'var(--brand-deep)',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}>
              <Icons.Mail size={16} style={{ color: 'var(--brand-mid)' }} />
              البريد الإلكتروني
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                required
                placeholder="admin@joacademy.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  height: '46px',
                  padding: '0 16px',
                  borderRadius: '12px',
                  border: '1.5px solid var(--border)',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  color: 'var(--text-1)',
                  outline: 'none',
                  transition: 'all 0.25s ease',
                  textAlign: 'left',
                  direction: 'ltr',
                  background: '#fcfdfe'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--brand)';
                  e.target.style.boxShadow = '0 0 0 4px rgba(32,79,140,0.08)';
                  e.target.style.background = '#fff';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--border)';
                  e.target.style.boxShadow = 'none';
                  e.target.style.background = '#fcfdfe';
                }}
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{
              fontWeight: 700,
              fontSize: '0.85rem',
              color: 'var(--brand-deep)',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}>
              <Icons.Lock size={16} style={{ color: 'var(--brand-mid)' }} />
              كلمة المرور
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  height: '46px',
                  padding: '0 44px 0 16px', // Extra padding on right for password toggle
                  borderRadius: '12px',
                  border: '1.5px solid var(--border)',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  color: 'var(--text-1)',
                  outline: 'none',
                  transition: 'all 0.25s ease',
                  textAlign: 'left',
                  direction: 'ltr',
                  background: '#fcfdfe'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--brand)';
                  e.target.style.boxShadow = '0 0 0 4px rgba(32,79,140,0.08)';
                  e.target.style.background = '#fff';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--border)';
                  e.target.style.boxShadow = 'none';
                  e.target.style.background = '#fcfdfe';
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 0
                }}
              >
                {showPassword ? <Icons.EyeOff size={18} /> : <Icons.Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{
              width: '100%',
              height: '48px',
              borderRadius: '12px',
              fontSize: '0.95rem',
              fontWeight: 800,
              gap: 8,
              justifyContent: 'center',
              boxShadow: 'var(--shadow-brand)',
              marginTop: '8px'
            }}
          >
            {loading ? (
              <>
                <span className="spinner" />
                <span>جاري التحقق من الهوية...</span>
              </>
            ) : (
              <>
                <Icons.Check size={18} />
                <span>تسجيل الدخول الآمن</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
