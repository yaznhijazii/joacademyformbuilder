import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getForms, deleteForm } from '../utils/storage';
import { Icons } from '../components/Icons';
import QRModal from '../components/QRModal';
import { useToast } from '../context/ToastContext';

function StatCard({ icon, label, value, color }) {
  return (
    <div className="stat-card-modern" style={{ '--card-accent': color }}>
      <div>
        <div style={{ fontSize: '2.1rem', fontWeight: 900, lineHeight: 1.1, color: 'var(--text)', letterSpacing: '-0.02em' }}>
          {value}
        </div>
        <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-2)', marginTop: 6 }}>
          {label}
        </div>
      </div>
      <div className="stat-icon-wrapper" style={{ background: color + '12', color: color }}>
        {icon}
      </div>
    </div>
  );
}

function FormCard({ form, onDelete, onQR }) {
  const navigate = useNavigate();
  const toast = useToast();
  const [confirmDel, setConfirmDel] = useState(false);

  const formUrl = `${window.location.origin}/f/${form.slug}`;

  const copyUrl = () => {
    navigator.clipboard.writeText(formUrl);
    toast('تم نسخ الرابط بنجاح', 'success');
  };

  return (
    <div className="modern-grid-card">
      {/* Top stripe */}
      <div className="form-card-premium-header" style={{ padding: '22px 24px' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <Icons.FileText size={14} style={{ color: 'var(--brand-mid)' }} />
            <span style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--brand)' }}>
              نموذج تقييم فعال
            </span>
          </div>
          <h3 className="form-card-title" style={{ fontSize: '1.1rem', fontWeight: 800 }}>
            {form.name}
          </h3>
          {form.title && (
            <p style={{ margin: '6px 0 0', fontSize: '0.85rem', color: 'var(--text-3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {form.title}
            </p>
          )}
        </div>
        <span className="badge badge-sky" style={{ padding: '6px 12px', fontSize: '0.8rem', borderRadius: '100px', fontWeight: 800 }}>
          {form.submissionsCount || 0} إجابة
        </span>
      </div>

      <div style={{ padding: '0 24px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* URL chip */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 'var(--r-sm)', padding: '8px 14px',
        }}>
          <span style={{
            flex: 1, fontSize: '0.78rem', color: 'var(--text-3)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            direction: 'ltr', textAlign: 'left', fontFamily: 'monospace',
          }}>
            /f/{form.slug}
          </span>
          <button className="btn btn-xs btn-ghost" onClick={copyUrl} title="نسخ الرابط" id={`copy-${form.id}`} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Icons.Copy size={12} />
            <span>نسخ</span>
          </button>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <a
            href={`/f/${form.slug}`} target="_blank" rel="noreferrer"
            className="btn btn-secondary btn-sm"
            style={{ justifyContent: 'center', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}
            id={`preview-${form.id}`}
          >
            <Icons.Eye size={14} />
            <span>معاينة</span>
          </a>
          <button className="btn btn-secondary btn-sm" onClick={() => onQR(form)} id={`qr-${form.id}`} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Icons.QrCode size={14} />
            <span>رمز QR</span>
          </button>
        </div>

        <div className="divider" style={{ margin: '4px 0' }} />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/build/${form.id}`)} id={`edit-${form.id}`} style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
            <Icons.Edit size={14} />
            <span>تعديل</span>
          </button>
          {confirmDel ? (
            <div style={{ display: 'flex', gap: 4 }}>
              <button className="btn btn-danger btn-sm" style={{ flex: 1 }} onClick={() => onDelete(form.id)} id={`confirm-del-${form.id}`}>تأكيد!</button>
              <button className="btn btn-ghost btn-sm" onClick={() => setConfirmDel(false)}>إلغاء</button>
            </div>
          ) : (
            <button className="btn btn-ghost btn-sm" onClick={() => setConfirmDel(true)} id={`del-${form.id}`} style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center', color: 'var(--red)' }}>
              <Icons.Trash size={14} style={{ color: 'var(--red)' }} />
              <span>حذف</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const toast = useToast();
  const [forms, setForms] = useState([]);
  const [qrForm, setQrForm] = useState(null);
  const [search, setSearch] = useState('');

  const load = () => setForms(getForms());
  useEffect(() => { load(); }, []);

  const handleDelete = (id) => {
    deleteForm(id);
    load();
    toast('تم حذف النموذج بنجاح', 'info');
  };

  const filtered = forms.filter((f) =>
    (f.name + f.title).toLowerCase().includes(search.toLowerCase())
  );

  const totalSubmissions = forms.reduce((s, f) => s + (f.submissionsCount || 0), 0);

  const handleLogout = () => {
    localStorage.removeItem('jo_admin_session');
    toast('تم تسجيل الخروج بنجاح', 'success');
    navigate('/portal-login');
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface)', paddingBottom: 60 }}>
      {/* ── Top Navbar ── */}
      <nav className="dashboard-nav-modern" style={{
        padding: '0 28px',
        height: 72,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <img 
            src="/d018753e-b8d8-4e62-9be1-5991e90071f5_removalai_preview.png" 
            alt="JoAcademy Logo" 
            style={{ height: 42, objectFit: 'contain', display: 'block', filter: 'drop-shadow(0 2px 8px rgba(32,79,140,0.08))' }}
          />
          <div style={{ width: 1.5, height: 28, background: 'var(--border)' }} />
          <div>
            <div style={{ fontWeight: 900, fontSize: '1rem', color: 'var(--brand)', lineHeight: 1.1, letterSpacing: '0.02em' }}>JO ACADEMY</div>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--brand-mid)', lineHeight: 1, marginTop: 2 }}>مُنشئ نماذج التقييم الفاخرة</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {/* Admin User Profile */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            background: 'var(--surface)',
            border: '1.5px solid var(--border)',
            padding: '6px 14px',
            borderRadius: '12px',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--brand) 0%, var(--brand-mid) 100%)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '0.82rem'
            }}>
              YH
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'right' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-1)', lineHeight: 1.2 }}>يزن حجازي</span>
              <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--brand-mid)', lineHeight: 1 }}>المدير العام</span>
            </div>
            <div style={{ width: 1, height: 18, background: 'var(--border)', margin: '0 4px' }} />
            <button
              onClick={handleLogout}
              style={{
                background: 'none',
                border: 'none',
                color: '#ef4444',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 4,
                borderRadius: '8px',
                transition: 'all var(--t) var(--ease)'
              }}
              title="تسجيل الخروج"
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#fef2f2';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'none';
              }}
            >
              <Icons.LogOut size={16} />
            </button>
          </div>

          <button className="btn btn-primary" onClick={() => navigate('/build')} id="new-form-btn" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 22px', borderRadius: 'var(--r-sm)', boxShadow: 'var(--shadow-brand)' }}>
            <Icons.Plus size={16} />
            <span>إنشاء نموذج</span>
          </button>
        </div>
      </nav>

      {/* ── Hero ── */}
      <div className="dashboard-hero-modern">
        <div className="dashboard-hero-glow-1" />
        <div className="dashboard-hero-glow-2" />

        <div style={{ maxWidth: 1080, margin: '0 auto', position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', padding: '5px 14px', borderRadius: '100px', width: 'fit-content', marginBottom: 16, border: '1px solid rgba(255,255,255,0.1)' }}>
            <Icons.Globe size={13} style={{ color: '#fff' }} />
            <span style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.04em', color: '#fff' }}>
              لوحة الإدارة والمتابعة الشاملة
            </span>
          </div>
          <h1 className="premium-title-gradient" style={{ margin: '0 0 14px', fontSize: 'clamp(2rem, 4vw, 2.6rem)', fontWeight: 900, lineHeight: 1.2 }}>
            منشئ نماذج تقييم جو أكاديمي
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.9)', maxWidth: 580, fontSize: '1.05rem', lineHeight: 1.65, fontWeight: 500 }}>
            صمم نماذج تقييم احترافية متكاملة لطلابك، شارك الروابط التفاعلية بكبسة زر، واستقبل البيانات والتقارير التحليلية مباشرة وبشكل فوري داخل حساب Bitrix24 CRM الخاص بك.
          </p>
        </div>
      </div>

      {/* ── Stats ── */}
      <div style={{ maxWidth: 1080, margin: '-36px auto 0', padding: '0 28px', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <StatCard 
            icon={<Icons.FileText size={24} />} 
            label="إجمالي النماذج النشطة" 
            value={forms.length} 
            color="#204F8C" 
          />
          <StatCard 
            icon={<Icons.Mail size={24} />} 
            label="إجمالي ردود الطلاب" 
            value={totalSubmissions} 
            color="#188C41" 
          />
          <StatCard 
            icon={<Icons.BarChart size={24} />} 
            label="معدل استجابة النماذج" 
            value={forms.length ? (totalSubmissions / forms.length).toFixed(1) : '0'} 
            color="#F2A25C" 
          />
        </div>
      </div>

      {/* ── Content ── */}
      <main style={{ maxWidth: 1080, margin: '36px auto 0', padding: '0 28px' }}>

        {forms.length > 0 && (
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 28, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 260, position: 'relative' }}>
              <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', display: 'inline-flex', alignItems: 'center', pointerEvents: 'none' }}>
                <Icons.Search size={16} style={{ color: 'var(--muted)' }} />
              </span>
              <input 
                className="input" 
                value={search} 
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ابحث عن نموذج بالاسم أو العنوان..." 
                style={{ paddingRight: 40, height: 44 }} 
                id="search-input" 
              />
            </div>
            <span className="badge badge-sky" style={{ fontSize: '0.85rem', padding: '6px 16px', borderRadius: '100px', fontWeight: 700 }}>
              {filtered.length} نموذج متوفر
            </span>
          </div>
        )}

        {/* Empty state */}
        {forms.length === 0 && (
          <div className="empty-state-modern">
            <div className="empty-state-icon-bg">
              <Icons.FileText size={40} style={{ color: 'var(--brand)' }} />
            </div>
            <h2 style={{ marginBottom: 12, color: 'var(--text)', fontWeight: 800, fontSize: '1.6rem' }}>لا توجد نماذج تقييم نشطة</h2>
            <p style={{ color: 'var(--text-3)', maxWidth: 460, margin: '0 auto 32px', fontSize: '0.98rem', lineHeight: 1.6 }}>
              ابدأ الآن بتصميم نموذجك التفاعلي الأول لجمع ردود الطلاب وإحصاءات التقييم وتصديرها مباشرة إلى حساب Bitrix24 الخاص بك بلمسة واحدة!
            </p>
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/build')} id="create-first-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, boxShadow: 'var(--shadow-brand)' }}>
              <Icons.Plus size={18} />
              <span>إنشاء نموذج التقييم الأول لجو أكاديمي</span>
            </button>
          </div>
        )}

        {/* Grid */}
        {filtered.length > 0 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))',
            gap: 24,
          }}>
            {filtered.map((f) => (
              <FormCard key={f.id} form={f} onDelete={handleDelete} onQR={setQrForm} />
            ))}
          </div>
        )}

        {filtered.length === 0 && forms.length > 0 && (
          <div style={{ 
            textAlign: 'center', padding: '60px 20px', color: 'var(--text-3)',
            background: '#fff', borderRadius: 'var(--r)', border: '1px solid var(--border)',
          }}>
            <Icons.Search size={32} style={{ color: 'var(--muted)', marginBottom: 12 }} />
            <div>لا توجد نتائج مطابقة لبحثك: "<strong>{search}</strong>"</div>
          </div>
        )}
      </main>

      {qrForm && <QRModal form={qrForm} onClose={() => setQrForm(null)} />}
    </div>
  );
}
