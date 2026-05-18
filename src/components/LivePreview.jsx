import React, { useState } from 'react';
import { Icons } from './Icons';

function StarPreview({ field }) {
  const [hovered, setHovered] = useState(0);
  const [selected, setSelected] = useState(0);
  const count = field.count || 5;
  const active = hovered || selected;
  const labels = field.labels || [];

  return (
    <div>
      <div className="star-field" style={{ display: 'flex', gap: 4, direction: 'ltr', justifyContent: 'flex-end', marginBottom: 10 }}>
        {Array.from({ length: count }).map((_, i) => (
          <span
            key={i}
            className={`star-item ${i < active ? 'active' : ''}`}
            onMouseEnter={() => setHovered(i + 1)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => setSelected(i + 1)}
            title={labels[i] || ''}
            style={{ cursor: 'pointer', padding: 2 }}
          >
            <Icons.Star 
              size={22} 
              style={{
                color: i < active ? 'var(--amber)' : 'var(--border-mid)',
                fill: i < active ? 'var(--amber)' : 'none',
                transition: 'all 0.1s ease',
              }}
            />
          </span>
        ))}
      </div>
      {labels.length > 0 && (
        <div className="star-labels" style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-start' }}>
          {labels.slice(0, count).map((l, i) => (
            <span key={i} className="star-label-pill" style={{ opacity: i === active - 1 ? 1 : 0.4, fontSize: '0.72rem', background: 'var(--surface-2)', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
              {l}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function ScalePreview({ field }) {
  const [selected, setSelected] = useState(null);
  const min = field.min ?? 1;
  const max = field.max ?? 10;
  return (
    <div>
      <div className="scale-track">
        {Array.from({ length: max - min + 1 }).map((_, i) => {
          const val = min + i;
          return (
            <button key={val} className={`scale-btn ${selected === val ? 'active' : ''}`}
              onClick={() => setSelected(val)}>{val}</button>
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

function SelectPreview({ field }) {
  const options = field.options || [];
  return (
    <select className="select" defaultValue="">
      <option value="" disabled>— اختر من القائمة —</option>
      {options.map((o, i) => <option key={i} value={o}>{o}</option>)}
    </select>
  );
}

function RadioPreview({ field }) {
  const options = field.options || [];
  const [selected, setSelected] = useState(null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {options.map((o, i) => (
        <label key={i} className={`radio-option ${selected === o ? 'selected' : ''}`} onClick={() => setSelected(o)}>
          <div style={{
            width: 16, height: 16, borderRadius: '50%',
            border: `2px solid ${selected === o ? 'var(--brand)' : 'var(--border-mid)'}`,
            background: selected === o ? 'var(--brand)' : '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, transition: 'all 0.15s ease',
          }}>
            {selected === o && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff' }} />}
          </div>
          <span>{o}</span>
        </label>
      ))}
    </div>
  );
}

function FieldPreview({ field }) {
  const requiredStar = field.required ? <span style={{ color: 'var(--red)', marginRight: 4, fontWeight: 700 }}>*</span> : null;

  return (
    <div style={{ marginBottom: 28 }}>
      <p style={{ fontWeight: 700, marginBottom: 10, fontSize: '0.92rem', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 4 }}>
        <span>{field.question || '(سؤال جديد غير مسمى)'}</span>
        {requiredStar}
      </p>
      {field.type === 'text' && (
        <input className="input" placeholder={field.placeholder || 'اكتب إجابتك هنا...'} readOnly style={{ pointerEvents: 'none' }} />
      )}
      {field.type === 'number' && (
        <input type="number" className="input" placeholder={field.placeholder || 'أدخل الرقم هنا...'} readOnly style={{ pointerEvents: 'none' }} />
      )}
      {field.type === 'phone' && (
        <input type="tel" className="input" placeholder={field.placeholder ? (field.placeholder.startsWith('مثال') ? `\u202B${field.placeholder}\u202C` : field.placeholder) : '\u202Bمثال: 07xxxxxxxx\u202C'} readOnly style={{ direction: 'ltr', textAlign: 'right', pointerEvents: 'none' }} />
      )}
      {field.type === 'textarea' && (
        <textarea className="textarea" placeholder="اكتب إجابتك بالتفصيل هنا..." readOnly style={{ pointerEvents: 'none' }} />
      )}
      {field.type === 'stars' && <StarPreview field={field} />}
      {field.type === 'scale' && <ScalePreview field={field} />}
      {field.type === 'select' && <SelectPreview field={field} />}
      {field.type === 'radio' && <RadioPreview field={field} />}
    </div>
  );
}

export default function LivePreview({ form }) {
  const { title, subtitle, submitButtonText, fields = [] } = form;

  return (
    <div style={{
      background: '#fff',
      border: '1.5px solid var(--border)',
      borderRadius: 'var(--r-xl)',
      overflow: 'hidden',
      boxShadow: 'var(--shadow)',
    }}>
      {/* Phone frame top bar */}
      <div style={{
        background: 'linear-gradient(135deg, #204F8C, #0497D6)',
        padding: '20px 24px',
        textAlign: 'center',
        position: 'relative',
      }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.15)', padding: '3px 10px', borderRadius: '100px', fontSize: '0.65rem', fontWeight: 800, color: '#fff', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 8 }}>
          <Icons.Eye size={10} />
          <span>المعاينة الحية</span>
        </div>
        <h2 style={{ margin: 0, fontSize: '1rem', color: '#fff', fontWeight: 800 }}>
          {title || 'عنوان نموذج التقييم'}
        </h2>
        {subtitle && (
          <p style={{ margin: '6px 0 0', fontSize: '0.78rem', color: 'rgba(255,255,255,0.8)' }}>{subtitle}</p>
        )}
      </div>

      <div style={{ padding: '24px 20px' }}>
        {fields.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-3)', padding: '40px 0' }}>
            <Icons.FileText size={32} style={{ color: 'var(--muted)', marginBottom: 12 }} />
            <p style={{ fontSize: '0.85rem', margin: 0 }}>قم بإضافة أسئلة أو حقول استبيان بالجانب الأيمن للبدء في رؤية المعاينة الحية فوراً.</p>
          </div>
        ) : (
          <>
            {fields.map((f) => <FieldPreview key={f.id} field={f} />)}
            <button className="btn btn-primary" style={{ width: '100%', marginTop: 8, display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }} disabled>
              <Icons.Mail size={16} />
              <span>{submitButtonText || 'إرسال رد التقييم'}</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
