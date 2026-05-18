import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Icons } from './Icons';

const DEFAULT_STAR_LABELS = ['سيء', 'ضعيف', 'مقبول', 'جيد', 'ممتاز'];

function StarsEditor({ field, onChange }) {
  const count = field.count || 5;
  const labels = field.labels || DEFAULT_STAR_LABELS.slice(0, count);

  const updateLabel = (idx, val) => {
    const next = [...labels];
    next[idx] = val;
    onChange({ ...field, labels: next });
  };

  const updateCount = (n) => {
    const newLabels = Array.from({ length: n }, (_, i) => labels[i] || '');
    onChange({ ...field, count: n, labels: newLabels });
  };

  return (
    <div style={{ marginTop: 12 }}>
      <div className="form-group" style={{ marginBottom: 12 }}>
        <label className="label">عدد النجوم</label>
        <select
          className="select"
          value={count}
          onChange={(e) => updateCount(Number(e.target.value))}
          style={{ maxWidth: 120 }}
        >
          {[3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
      </div>
      <label className="label">تسمية مستويات التقييم</label>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10 }}>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="form-group" style={{ marginBottom: 0 }}>
            <label className="label" style={{ display: 'flex', gap: 2, alignItems: 'center', marginBottom: 6 }}>
              {Array.from({ length: i + 1 }).map((_, s) => (
                <Icons.Star key={s} size={10} style={{ color: 'var(--amber)', fill: 'var(--amber)' }} />
              ))}
            </label>
            <input
              className="input"
              value={labels[i] || ''}
              onChange={(e) => updateLabel(i, e.target.value)}
              placeholder={`تسمية المستوى ${i + 1}`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function ScaleEditor({ field, onChange }) {
  return (
    <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
      <div className="form-group">
        <label className="label">القيمة الدنيا</label>
        <input className="input" type="number" min={0} max={5}
          value={field.min ?? 1}
          onChange={(e) => onChange({ ...field, min: Number(e.target.value) })}
        />
      </div>
      <div className="form-group">
        <label className="label">القيمة القصوى</label>
        <input className="input" type="number" min={5} max={20}
          value={field.max ?? 10}
          onChange={(e) => onChange({ ...field, max: Number(e.target.value) })}
        />
      </div>
      <div className="form-group" style={{ marginBottom: 0 }}>
        <label className="label">تسمية الحد الأدنى</label>
        <input className="input" value={field.minLabel || ''} placeholder="مثال: غير راضٍ أبداً"
          onChange={(e) => onChange({ ...field, minLabel: e.target.value })}
        />
      </div>
      <div className="form-group" style={{ marginBottom: 0 }}>
        <label className="label">تسمية الحد الأقصى</label>
        <input className="input" value={field.maxLabel || ''} placeholder="مثال: راضٍ تماماً"
          onChange={(e) => onChange({ ...field, maxLabel: e.target.value })}
        />
      </div>
    </div>
  );
}

function OptionsEditor({ field, onChange }) {
  const options = field.options || [];

  const add = () => onChange({ ...field, options: [...options, ''] });
  const remove = (i) => onChange({ ...field, options: options.filter((_, idx) => idx !== i) });
  const update = (i, val) => {
    const next = [...options];
    next[i] = val;
    onChange({ ...field, options: next });
  };

  return (
    <div style={{ marginTop: 12 }}>
      <label className="label">خيارات القائمة</label>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {options.map((opt, i) => (
          <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input className="input" value={opt} onChange={(e) => update(i, e.target.value)} placeholder={`الخيار ${i + 1}`} />
            <button className="btn btn-danger btn-icon btn-sm" onClick={() => remove(i)} title="حذف الخيار" style={{ flexShrink: 0 }}>
              <Icons.Cross size={14} />
            </button>
          </div>
        ))}
        <button 
          className="btn btn-ghost btn-sm" 
          style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }} 
          onClick={add}
        >
          <Icons.Plus size={14} />
          <span>إضافة خيار جديد</span>
        </button>
      </div>
    </div>
  );
}

function FieldCard({ field, index, total, FIELD_TYPES, onChange, onDelete, onMoveUp, onMoveDown }) {
  const [expanded, setExpanded] = useState(true);
  const matched = FIELD_TYPES.find((t) => t.value === field.type);
  const typeLabel = matched ? matched.label : field.type;
  const typeIcon = matched ? matched.icon : null;

  return (
    <div className={`field-card ${expanded ? 'expanded' : ''}`}>
      {/* Header */}
      <div className="field-card-header" onClick={() => setExpanded(!expanded)}>
        {/* Rearrange arrows */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
          <button 
            className="btn btn-ghost btn-icon btn-sm" 
            disabled={index === 0} 
            onClick={onMoveUp} 
            title="نقل للأعلى"
            style={{ padding: 2, height: 20, width: 20 }}
          >
            <Icons.ChevronUp size={14} />
          </button>
          <button 
            className="btn btn-ghost btn-icon btn-sm" 
            disabled={index === total - 1} 
            onClick={onMoveDown} 
            title="نقل للأسفل"
            style={{ padding: 2, height: 20, width: 20 }}
          >
            <Icons.ChevronDown size={14} />
          </button>
        </div>
        
        {/* Title */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {field.question || 'سؤال جديد غير مسمى'}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-3)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ display: 'inline-flex', color: 'var(--brand-mid)' }}>{typeIcon}</span>
            <span>{typeLabel}</span>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
          {field.required && <span className="badge badge-amber" style={{ fontSize: '0.68rem', padding: '2px 8px' }}>مطلوب</span>}
          <button 
            className="btn btn-ghost btn-icon btn-sm" 
            onClick={() => setExpanded(!expanded)}
            style={{ height: 28, width: 28 }}
          >
            {expanded ? <Icons.ChevronUp size={16} /> : <Icons.ChevronDown size={16} />}
          </button>
          <button 
            className="btn btn-ghost btn-icon btn-sm" 
            onClick={onDelete} 
            title="حذف الحقل نهائياً"
            style={{ height: 28, width: 28, color: 'var(--red)' }}
          >
            <Icons.Trash size={16} />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="field-card-body" style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingTop: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 180px', gap: 12 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="label">السؤال / نص الحقل</label>
              <input className="input" value={field.question || ''}
                onChange={(e) => onChange({ ...field, question: e.target.value })}
                placeholder="مثال: ما مدى رضاك عن شرح المعلم؟" />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="label">نوع الحقل</label>
              <select className="select" value={field.type}
                onChange={(e) => onChange({ ...field, type: e.target.value })}>
                {FIELD_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
          </div>

          {/* Type-specific settings */}
          {field.type === 'stars' && <StarsEditor field={field} onChange={onChange} />}
          {field.type === 'scale' && <ScaleEditor field={field} onChange={onChange} />}
          {(field.type === 'select' || field.type === 'radio') && <OptionsEditor field={field} onChange={onChange} />}
          {(field.type === 'text' || field.type === 'number' || field.type === 'phone') && (
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="label">نص تلميح مساعد (Placeholder)</label>
              <input className="input" value={field.placeholder || ''}
                onChange={(e) => onChange({ ...field, placeholder: e.target.value })}
                placeholder={field.type === 'phone' ? "مثال: 07xxxxxxxx" : "تلميح يظهر داخل صندوق الإدخال"} />
            </div>
          )}

          <div className="divider" style={{ margin: '4px 0' }} />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 180px', gap: 12 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="label">كود حقل الربط في Bitrix24</label>
              <input className="input" value={field.bitrixField || ''}
                onChange={(e) => onChange({ ...field, bitrixField: e.target.value })}
                placeholder="مثال: ufCrm186_1778..."
                dir="ltr"
              />
            </div>
            <div className="form-group" style={{ justifyContent: 'flex-end', marginBottom: 0 }}>
              <label className="label">خصائص التحقق</label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', padding: '8px 0' }}>
                <input type="checkbox" checked={!!field.required}
                  onChange={(e) => onChange({ ...field, required: e.target.checked })}
                  style={{ width: 16, height: 16, accentColor: 'var(--brand)', cursor: 'pointer' }} />
                <span style={{ fontSize: '0.88rem', color: 'var(--text-2)', fontWeight: 600 }}>إلزام تعبئة الحقل</span>
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function FieldEditor({ fields, onChange }) {
  const FIELD_TYPES = [
    { value: 'text', label: 'نص قصير', icon: <Icons.Type size={13} /> },
    { value: 'textarea', label: 'نص طويل', icon: <Icons.FileText size={13} /> },
    { value: 'number', label: 'رقم', icon: <Icons.Hash size={13} /> },
    { value: 'phone', label: 'رقم الهاتف', icon: <Icons.Phone size={13} /> },
    { value: 'stars', label: 'تقييم بالنجوم', icon: <Icons.Star size={13} /> },
    { value: 'scale', label: 'مقياس 1–10', icon: <Icons.BarChart size={13} /> },
    { value: 'select', label: 'قائمة منسدلة', icon: <Icons.ChevronDown size={13} /> },
    { value: 'radio', label: 'اختيار واحد', icon: <Icons.Globe size={13} /> },
  ];

  const addField = (type) => {
    const base = { id: uuidv4(), type, question: '', required: false, bitrixField: '' };
    if (type === 'stars') {
      base.count = 5;
      base.labels = [...DEFAULT_STAR_LABELS];
    }
    if (type === 'scale') {
      base.min = 1; base.max = 10;
      base.minLabel = ''; base.maxLabel = '';
    }
    if (type === 'select' || type === 'radio') base.options = [];
    onChange([...fields, base]);
  };

  const update = (idx, updated) => {
    const next = [...fields];
    next[idx] = updated;
    onChange(next);
  };

  const remove = (idx) => onChange(fields.filter((_, i) => i !== idx));

  const moveUp = (idx) => {
    if (idx === 0) return;
    const next = [...fields];
    [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
    onChange(next);
  };

  const moveDown = (idx) => {
    if (idx === fields.length - 1) return;
    const next = [...fields];
    [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
    onChange(next);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <h3 style={{ margin: 0, fontWeight: 800, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Icons.Slider size={18} style={{ color: 'var(--brand)' }} />
          <span>حقول النموذج المتوفرة ({fields.length})</span>
        </h3>
      </div>

      {fields.length === 0 && (
        <div style={{
          textAlign: 'center', padding: '48px 20px',
          border: '1.5px dashed var(--border-mid)', borderRadius: 'var(--r)',
          color: 'var(--text-3)', marginBottom: 20,
          background: 'var(--surface)',
        }}>
          <Icons.Slider size={36} style={{ color: 'var(--muted)', marginBottom: 12 }} />
          <p style={{ margin: 0, fontSize: '0.9rem' }}>لا توجد حقول حتى الآن في مخطط التقييم. اختر أحد العناصر بالأسفل لإضافتها فوراً!</p>
        </div>
      )}

      {fields.map((f, idx) => (
        <FieldCard
          key={f.id}
          field={f}
          index={idx}
          total={fields.length}
          FIELD_TYPES={FIELD_TYPES}
          onChange={(updated) => update(idx, updated)}
          onDelete={() => remove(idx)}
          onMoveUp={() => moveUp(idx)}
          onMoveDown={() => moveDown(idx)}
        />
      ))}

      <div style={{ marginTop: 24, background: 'var(--surface)', padding: 18, borderRadius: 'var(--r)', border: '1.5px solid var(--border)' }}>
        <p className="label" style={{ marginBottom: 12, fontWeight: 800, color: 'var(--text-2)' }}>إضافة حقل استبيان جديد:</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {FIELD_TYPES.map((t) => (
            <button
              key={t.value}
              className="btn btn-secondary btn-sm"
              onClick={() => addField(t.value)}
              id={`add-field-${t.value}`}
              style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff' }}
            >
              <span style={{ display: 'inline-flex', color: 'var(--brand-mid)' }}>{t.icon}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
