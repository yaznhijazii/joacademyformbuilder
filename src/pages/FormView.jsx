import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getFormBySlug, incrementSubmissions } from '../utils/storage';
import { sendToBitrix } from '../utils/bitrix';
import { Icons } from '../components/Icons';
import { useToast } from '../context/ToastContext';

/* ── Individual field renderers ── */

function StarInput({ field, value, onChange }) {
  const [hover, setHover] = useState(0);
  const count = field.count || 5;
  const labels = field.labels || [];
  const active = hover || value || 0;

  return (
    <div>
      <div className="star-row" style={{ display: 'flex', gap: 4, direction: 'ltr', justifyContent: 'flex-end', marginBottom: 12 }}>
        {Array.from({ length: count }).map((_, i) => (
          <button
            key={i} type="button"
            className={`star-btn ${i < active ? 'lit' : ''}`}
            onMouseEnter={() => setHover(i + 1)}
            onMouseLeave={() => setHover(0)}
            onClick={() => onChange(i + 1)}
            aria-label={labels[i] || `${i + 1} نجوم`}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 6px', outline: 'none' }}
          >
            <Icons.Star 
              size={26} 
              style={{ 
                color: i < active ? 'var(--amber)' : 'var(--border-mid)',
                fill: i < active ? 'var(--amber)' : 'none',
                transition: 'all 0.15s ease',
              }} 
            />
          </button>
        ))}
      </div>
      {labels.length > 0 && (
        <div className="star-labels-row">
          {labels.slice(0, count).map((l, i) => (
            <span key={i} className={`star-chip ${i === active - 1 ? 'active' : ''}`}>{l}</span>
          ))}
        </div>
      )}
    </div>
  );
}

function ScaleInput({ field, value, onChange }) {
  const min = field.min ?? 1, max = field.max ?? 10;
  return (
    <div>
      <div className="scale-row">
        {Array.from({ length: max - min + 1 }).map((_, i) => {
          const v = min + i;
          return (
            <button key={v} type="button"
              className={`scale-num ${value === v ? 'active' : ''}`}
              onClick={() => onChange(v)}>
              {v}
            </button>
          );
        })}
      </div>
      {(field.minLabel || field.maxLabel) && (
        <div className="scale-ends">
          <span>{field.minLabel}</span>
          <span>{field.maxLabel}</span>
        </div>
      )}
    </div>
  );
}

function RadioInput({ field, value, onChange }) {
  const options = field.options || [];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {options.map((o, i) => (
        <label key={i} className={`radio-option ${value === o ? 'selected' : ''}`} onClick={() => onChange(o)}>
          <div style={{
            width: 18, height: 18, borderRadius: '50%',
            border: `2px solid ${value === o ? 'var(--brand)' : 'var(--border-mid)'}`,
            background: value === o ? 'var(--brand)' : '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, transition: 'all var(--t) var(--ease)',
          }}>
            {value === o && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff' }} />}
          </div>
          {o}
        </label>
      ))}
    </div>
  );
}

function SelectInput({ field, value, onChange }) {
  return (
    <select className="select" value={value || ''} onChange={(e) => onChange(e.target.value)}>
      <option value="">— اختر الإجابة المناسبة —</option>
      {(field.options || []).map((o, i) => <option key={i} value={o}>{o}</option>)}
    </select>
  );
}

function FieldItem({ field, value, onChange, error }) {
  return (
    <div style={{ marginBottom: 32, animation: 'slideUp 0.3s var(--ease-out) both' }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'baseline', marginBottom: 12 }}>
        <p style={{ fontWeight: 700, fontSize: '0.98rem', color: 'var(--text)', flex: 1, margin: 0 }}>
          {field.question}
        </p>
        {field.required && (
          <span style={{ color: 'var(--red)', fontSize: '0.8rem', fontWeight: 700 }}>مطلوب *</span>
        )}
      </div>

      {field.type === 'text'     && <input    className="input"    value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder={field.placeholder || 'اكتب هنا...'} style={error ? { borderColor: 'var(--red)' } : {}} />}
      {field.type === 'number'   && <input    type="number" className="input" value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder={field.placeholder || 'أدخل الرقم هنا...'} style={error ? { borderColor: 'var(--red)' } : {}} />}
      {field.type === 'phone'    && <input    type="tel" className="input" value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder={field.placeholder ? (field.placeholder.startsWith('مثال') ? `\u202B${field.placeholder}\u202C` : field.placeholder) : '\u202Bمثال: 07xxxxxxxx\u202C'} style={{ direction: 'ltr', textAlign: 'right', ...(error ? { borderColor: 'var(--red)' } : {}) }} />}
      {field.type === 'textarea' && <textarea className="textarea" value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder="اكتب هنا بالتفصيل..." style={error ? { borderColor: 'var(--red)' } : {}} />}
      {field.type === 'stars'    && <StarInput  field={field} value={value} onChange={onChange} />}
      {field.type === 'scale'    && <ScaleInput field={field} value={value} onChange={onChange} />}
      {field.type === 'radio'    && <RadioInput field={field} value={value} onChange={onChange} />}
      {field.type === 'select'   && <SelectInput field={field} value={value} onChange={onChange} />}

      {error && (
        <p style={{ fontSize: '0.78rem', color: 'var(--red)', marginTop: 6, display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
          <Icons.AlertTriangle size={13} />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}

/* ── Success screen ── */
function SuccessScreen({ onReset }) {
  return (
    <div style={{ textAlign: 'center', padding: '48px 20px', animation: 'scaleIn 0.4s var(--ease-out)' }}>
      <div style={{
        width: 80, height: 80, borderRadius: '50%',
        background: 'linear-gradient(135deg, #188C41, #22b55a)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 24px',
        boxShadow: '0 8px 24px rgba(24,140,65,0.35)',
        animation: 'pulse 2s infinite',
        color: '#fff',
      }}>
        <Icons.Check size={38} />
      </div>
      <h2 style={{ marginBottom: 12, color: 'var(--text)', fontWeight: 800 }}>تم استلام تقييمك بنجاح!</h2>
      <p style={{ color: 'var(--text-3)', maxWidth: 400, margin: '0 auto 32px', fontSize: '0.95rem', lineHeight: 1.6 }}>
        نشكرك على مشاركة تجربتك القيمة معنا. نقدّر وقتك وآرائك ونسعى دائماً لتوفير أفضل تجربة تعليمية.
      </p>
      <button className="btn btn-secondary" onClick={onReset} style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
        <Icons.ArrowRight size={14} />
        <span>إرسال رد جديد</span>
      </button>
    </div>
  );
}

/* ── Main FormView ── */
export default function FormView() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [form, setForm]         = useState(null);
  const [answers, setAnswers]   = useState({});
  const [errors, setErrors]     = useState({});
  const [submitting, setSub]    = useState(false);
  const [submitted, setDone]    = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const f = getFormBySlug(slug);
    if (!f) { setNotFound(true); return; }
    setForm(f);
  }, [slug]);

  const validate = () => {
    const e = {};
    (form.fields || []).forEach((f) => {
      if (f.required && (answers[f.id] == null || answers[f.id] === ''))
        e[f.id] = 'هذا الحقل مطلوب، يرجى تعبئته قبل الإرسال';
    });
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      toast('يرجى تعبئة جميع الحقول الإلزامية المطلوبة', 'error');
      return;
    }
    setSub(true);
    try {
      await sendToBitrix(form, answers);
      incrementSubmissions(form.id);
      setDone(true);
    } catch (err) {
      console.error(err);
      toast('حدث خطأ غير متوقع أثناء إرسال البيانات، يرجى المحاولة مرة أخرى', 'error');
    } finally { setSub(false); }
  };

  const resetForm = () => { setDone(false); setAnswers({}); setErrors({}); };

  /* ── Not found ── */
  if (notFound) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, background: 'var(--surface)' }}>
      <div style={{ textAlign: 'center', padding: 48, background: '#fff', borderRadius: 'var(--r-xl)', boxShadow: 'var(--shadow)', maxWidth: 440, width: '100%', border: '1px solid var(--border)' }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--red-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--red)', margin: '0 auto 20px' }}>
          <Icons.Search size={32} />
        </div>
        <h2 style={{ marginBottom: 12, fontWeight: 800 }}>النموذج غير متوفر</h2>
        <p style={{ color: 'var(--text-3)', marginBottom: 28, fontSize: '0.92rem', lineHeight: 1.5 }}>قد يكون الرابط المباشر غير صحيح أو تم إيقاف ونشر هذا النموذج من قبل الإدارة.</p>
        <button className="btn btn-primary" onClick={() => navigate('/')} style={{ width: '100%', justifyContent: 'center' }}>العودة للرئيسية</button>
      </div>
    </div>
  );

  /* ── Loading ── */
  if (!form) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface)' }}>
      <span className="spinner spinner-brand" style={{ width: 38, height: 38 }} />
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface)', paddingBottom: 80 }}>
      {/* Header */}
      <div className="form-header">
        <div className="form-header-glow-1" />
        <div className="form-header-glow-2" />
        <div style={{ position: 'relative', maxWidth: 800, margin: '0 auto', zIndex: 2 }}>
          <h1 className="premium-title-gradient" style={{ margin: '0', fontSize: 'clamp(1.7rem, 4.5vw, 2.4rem)', fontWeight: 900, textShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
            {form.title}
          </h1>
          {form.subtitle && (
            <p style={{ color: 'rgba(255,255,255,0.92)', maxWidth: 540, margin: '10px auto 0', fontSize: '1rem', lineHeight: 1.6, fontWeight: 500 }}>
              {form.subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Card */}
      <div className="form-container">
        <div className="form-card">
          {submitted ? (
            <SuccessScreen onReset={resetForm} />
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              {(form.fields || []).map((field) => (
                <FieldItem
                  key={field.id}
                  field={field}
                  value={answers[field.id]}
                  error={errors[field.id]}
                  onChange={(val) => {
                    setAnswers((p) => ({ ...p, [field.id]: val }));
                    if (errors[field.id]) setErrors((p) => { const e = {...p}; delete e[field.id]; return e; });
                  }}
                />
              ))}

              {!form.fields?.length && (
                <div style={{ textAlign: 'center', color: 'var(--text-3)', padding: '48px 0' }}>
                  <Icons.FileText size={40} style={{ color: 'var(--muted)', marginBottom: 12 }} />
                  <p>لا توجد أسئلة أو حقول تقييم حالية في هذا النموذج.</p>
                </div>
              )}

              {!!form.fields?.length && (
                <button
                  type="submit" id="submit-btn"
                  className="btn btn-primary btn-lg"
                  style={{ width: '100%', justifyContent: 'center', marginTop: 16, height: 50, display: 'flex', alignItems: 'center', gap: 10, borderRadius: 'var(--r-sm)', boxShadow: 'var(--shadow-brand)', fontWeight: 800 }}
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <span className="spinner" />
                      <span>جاري إرسال ردك...</span>
                    </>
                  ) : (
                    <>
                      <Icons.Mail size={18} />
                      <span>{form.submitButtonText || 'إرسال التقييم النهائي'}</span>
                    </>
                  )}
                </button>
              )}
            </form>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div className="form-footer-badge" style={{ gap: 6, display: 'inline-flex', alignItems: 'center' }}>
            <span>نظام التقييم والاستبيانات مدعوم بواسطة</span>
            <span style={{ color: 'var(--brand)', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <img 
                src="/d018753e-b8d8-4e62-9be1-5991e90071f5_removalai_preview.png" 
                alt="JoAcademy Logo" 
                style={{ height: 16, objectFit: 'contain', display: 'block' }}
              />
              جو أكاديمي
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
