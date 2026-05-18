import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import FieldEditor from '../components/FieldEditor';
import LivePreview from '../components/LivePreview';
import { Icons } from '../components/Icons';
import { getForms, createForm, updateForm, slugify, makeUniqueSlug } from '../utils/storage';
import { useToast } from '../context/ToastContext';

const BITRIX_DEFAULTS = {
  webhook: import.meta.env.VITE_BITRIX_WEBHOOK || '',
  entityTypeId: import.meta.env.VITE_BITRIX_ENTITY_TYPE || 1720,
};

export default function BuildForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const isEdit = Boolean(id);

  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [submitButtonText, setSubmitButtonText] = useState('');
  const [slug, setSlug] = useState('');
  const [fields, setFields] = useState([]);
  const [tab, setTab] = useState('fields');

  const TABS = [
    { key: 'fields', icon: <Icons.Slider size={16} />, label: 'تخطيط الحقول' },
    { key: 'preview', icon: <Icons.Eye size={16} />, label: 'معاينة النموذج' },
    { key: 'settings', icon: <Icons.Settings size={16} />, label: 'إعدادات النشر' },
  ];

  // Load for edit
  React.useEffect(() => {
    if (isEdit) {
      const f = getForms().find((x) => x.id === id);
      if (f) {
        setName(f.name);
        setTitle(f.title);
        setSubtitle(f.subtitle || '');
        setSubmitButtonText(f.submitButtonText || '');
        setSlug(f.slug);
        setFields(f.fields || []);
      }
    }
  }, [id, isEdit]);

  // Auto-slug on create
  React.useEffect(() => {
    if (!isEdit && name) setSlug(slugify(name));
  }, [name, isEdit]);

  const handleSave = async () => {
    if (!name.trim()) { toast('يرجى إدخال اسم النموذج', 'error'); return; }
    if (!title.trim()) { toast('يرجى إدخال العنوان الرئيسي للمعاينة', 'error'); return; }
    const uSlug = makeUniqueSlug(slug || slugify(name), isEdit ? id : undefined);
    setSaving(true);
    try {
      if (isEdit) {
        updateForm(id, { name: name.trim(), title: title.trim(), subtitle: subtitle.trim(), submitButtonText: submitButtonText.trim(), slug: uSlug, fields });
        toast('تم تحديث النموذج بنجاح', 'success');
      } else {
        createForm({ name: name.trim(), title: title.trim(), subtitle: subtitle.trim(), submitButtonText: submitButtonText.trim(), slug: uSlug, fields });
        toast('تم إنشاء النموذج ونشره بنجاح', 'success');
      }
      navigate('/');
    } catch {
      toast('حدث خطأ غير متوقع أثناء حفظ البيانات', 'error');
    } finally {
      setSaving(false);
    }
  };

  const currentForm = { name, title, subtitle, submitButtonText, slug, fields };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface)' }}>
      {/* ── Sticky Top Bar ── */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'rgba(255,255,255,0.96)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border)',
        boxShadow: 'var(--shadow-xs)',
      }}>
        {/* Row 1: Back + Name + Save */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 24px' }}>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/')} id="back-btn" style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Icons.ArrowRight size={16} />
            <span>رجوع</span>
          </button>
          
          <div style={{ width: 1, height: 20, background: 'var(--border)' }} />

          <input
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="أدخل اسم نموذج التقييم الداخلي..."
            id="form-name-input"
            style={{
              flex: 1, border: 'none', background: 'transparent',
              boxShadow: 'none', fontWeight: 700, fontSize: '1rem',
              padding: '6px 0', color: 'var(--text)',
            }}
          />
          
          <button
            className="btn btn-primary btn-sm"
            onClick={handleSave}
            disabled={saving}
            id="save-btn"
            style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 8 }}
          >
            {saving ? (
              <>
                <span className="spinner" />
                <span>جاري الحفظ...</span>
              </>
            ) : isEdit ? (
              <>
                <Icons.Save size={16} />
                <span>حفظ التغييرات</span>
              </>
            ) : (
              <>
                <Icons.Globe size={16} />
                <span>حفظ ونشر النموذج</span>
              </>
            )}
          </button>
        </div>

        {/* Row 2: Tabs */}
        <div style={{ display: 'flex', gap: 4, borderTop: '1px solid var(--border)', padding: '0 24px' }}>
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              id={`tab-${t.key}`}
              className={`builder-tab ${tab === t.key ? 'active' : ''}`}
            >
              <span className="tab-icon">
                {t.icon}
              </span>
              <span>{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Meta inputs ── */}
      <div style={{ maxWidth: 1140, margin: '0 auto', padding: '24px 24px 0' }}>
        <div className="card" style={{ borderRadius: 'var(--r)', marginBottom: 24, border: '1.5px solid var(--border)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="label">العنوان الرئيسي للنموذج (يظهر للطلاب)</label>
              <input className="input" value={title} onChange={(e) => setTitle(e.target.value)}
                placeholder="مثال: تقييم المحتوى والخدمات التعليمية لجو أكاديمي" id="title-input" />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="label">الوصف أو العنوان الفرعي (اختياري)</label>
              <input className="input" value={subtitle} onChange={(e) => setSubtitle(e.target.value)}
                placeholder="مثال: نسعد بسماع رأيك لتقديم تجربة تعليمية متميزة تليق بطموحاتك" id="subtitle-input" />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="label">نص زر الإرسال المخصص (اختياري)</label>
              <input className="input" value={submitButtonText} onChange={(e) => setSubmitButtonText(e.target.value)}
                placeholder="مثال: إرسال رد التقييم" id="submit-btn-text-input" />
            </div>
          </div>
        </div>

        {/* ── Tab Content ── */}
        {tab === 'fields' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 24, alignItems: 'start' }}>
            <div className="card" style={{ borderRadius: 'var(--r)', padding: 24, border: '1.5px solid var(--border)' }}>
              <FieldEditor fields={fields} onChange={setFields} />
            </div>
            <div style={{ position: 'sticky', top: 120 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                <Icons.Eye size={14} style={{ color: 'var(--brand-mid)' }} />
                <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--brand)' }}>
                  المعاينة الحية الفورية
                </span>
              </div>
              <LivePreview form={currentForm} />
            </div>
          </div>
        )}

        {tab === 'preview' && (
          <div style={{ maxWidth: 580, margin: '0 auto' }}>
            <LivePreview form={currentForm} />
          </div>
        )}

        {tab === 'settings' && (
          <div style={{ maxWidth: 640, display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Slug card */}
            <div className="card" style={{ border: '1.5px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                <div style={{ width: 36, height: 36, borderRadius: '8px', background: 'var(--brand-lighter)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand)' }}>
                  <Icons.Globe size={18} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 800, color: 'var(--text)' }}>عنوان الرابط المخصص (Slug)</h3>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-3)' }}>تخصيص رابط الويب الخاص بنموذج تقييم الطالب</div>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="label">رابط النموذج</label>
                <div style={{ display: 'flex', gap: 0 }}>
                  <div style={{
                    padding: '10px 14px', background: 'var(--surface)',
                    border: '1.5px solid var(--border)', borderRadius: 'var(--r-sm) 0 0 var(--r-sm)',
                    borderLeft: 'none', fontSize: '0.82rem', color: 'var(--muted)',
                    whiteSpace: 'nowrap', display: 'flex', alignItems: 'center',
                    direction: 'ltr', fontWeight: 600,
                  }}>
                    /f/
                  </div>
                  <input className="input" value={slug}
                    onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))}
                    placeholder="form-slug"
                    id="slug-input"
                    dir="ltr"
                    style={{ borderRadius: '0 var(--r-sm) var(--r-sm) 0' }}
                  />
                </div>
                <div style={{
                  marginTop: 12, padding: '8px 12px', background: 'var(--brand-lighter)',
                  border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', fontSize: '0.8rem',
                  display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-2)',
                }}>
                  <Icons.Info size={14} style={{ color: 'var(--brand)', flexShrink: 0 }} />
                  <span>
                    الرابط المباشر للطلاب:{' '}
                    <a 
                      href={`${window.location.origin}/f/${slug}`} 
                      target="_blank" 
                      rel="noreferrer" 
                      style={{ color: 'var(--brand)', fontWeight: 700, textDecoration: 'underline' }}
                    >
                      {window.location.origin}/f/{slug || 'slug'}
                    </a>
                  </span>
                </div>
              </div>
            </div>

            {/* Bitrix card */}
            <div className="card" style={{ border: '1.5px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                <div style={{ width: 36, height: 36, borderRadius: '8px', background: 'var(--brand-lighter)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand)' }}>
                  <Icons.Settings size={18} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 800, color: 'var(--text)' }}>إعدادات الربط مع Bitrix24 CRM</h3>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-3)' }}>تكامل البيانات وتصدير ردود الطلاب تلقائياً</div>
                </div>
              </div>

              <div style={{
                background: 'linear-gradient(135deg, #d6eaf8, #eef7fd)',
                border: '1.5px solid #b0cfe8',
                borderRadius: 'var(--r)',
                padding: '16px 20px',
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.82rem', color: 'var(--text-2)', lineHeight: 1.8 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                    <span style={{ color: 'var(--text-3)', fontWeight: 700, minWidth: 100 }}>عنوان الـ Webhook:</span>
                    <code style={{ fontSize: '0.78rem', color: 'var(--brand-deep)', wordBreak: 'break-all', fontFamily: 'monospace', fontWeight: 600 }}>
                      {BITRIX_DEFAULTS.webhook || '— غير معرف (يرجى إعداده في ملف .env) —'}
                    </code>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span style={{ color: 'var(--text-3)', fontWeight: 700, minWidth: 100 }}>رقم الكيان (EntityType):</span>
                    <code style={{ color: 'var(--brand-deep)', fontFamily: 'monospace', fontWeight: 700 }}>
                      {BITRIX_DEFAULTS.entityTypeId}
                    </code>
                  </div>
                </div>
                
                <div className="divider" style={{ background: '#b0cfe8', margin: '14px 0 10px' }} />
                
                <p style={{ fontSize: '0.75rem', color: 'var(--text-3)', margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Icons.Info size={13} style={{ color: 'var(--brand-mid)' }} />
                  <span>لتغيير هذه الإعدادات، يرجى تحديث متغيرات البيئة في ملف <code>.env</code> بجذر المشروع.</span>
                </p>
              </div>
            </div>
          </div>
        )}

        <div style={{ height: 60 }} />
      </div>
    </div>
  );
}
