import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Icons } from '../components/Icons';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--surface)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px',
      fontFamily: 'inherit',
      direction: 'rtl'
    }}>
      <div className="form-card" style={{
        width: '100%',
        maxWidth: '480px',
        padding: '48px 32px',
        textAlign: 'center',
        background: '#fff',
        borderRadius: '24px',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow)'
      }}>
        {/* Glow Effects */}
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: 'rgba(32,79,140,0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--brand)',
          margin: '0 auto 24px',
          animation: 'pulse 2s infinite'
        }}>
          <Icons.Search size={36} />
        </div>

        <h1 style={{
          fontSize: '4rem',
          fontWeight: 900,
          color: 'var(--brand-deep)',
          margin: '0 0 10px 0',
          lineHeight: 1,
          letterSpacing: '-0.05em'
        }}>
          404
        </h1>

        <h2 style={{
          fontSize: '1.4rem',
          fontWeight: 800,
          color: 'var(--text-1)',
          margin: '0 0 16px 0'
        }}>
          عذراً، الصفحة غير موجودة!
        </h2>

        <p style={{
          fontSize: '0.92rem',
          color: 'var(--text-3)',
          lineHeight: 1.6,
          margin: '0 0 32px 0',
          fontWeight: 500
        }}>
          الرابط الذي حاولت الوصول إليه قد يكون غير صحيح، أو ربما تم حذفه أو نقله بواسطة إدارة النظام. يرجى التحقق من صحة العنوان والمحاولة مرة أخرى.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <button
            onClick={() => window.location.href = 'https://www.joacademy.com'}
            className="btn btn-primary"
            style={{
              width: '100%',
              height: '46px',
              borderRadius: '12px',
              fontWeight: 800,
              fontSize: '0.9rem',
              justifyContent: 'center',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: 'var(--shadow-brand)'
            }}
          >
            <Icons.Globe size={16} />
            <span>الانتقال لموقع جو أكاديمي الرئيسي</span>
          </button>
        </div>
      </div>
    </div>
  );
}
