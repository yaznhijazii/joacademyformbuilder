import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Icons } from './Icons';

export default function QRModal({ form, onClose }) {
  const [copied, setCopied] = useState(false);
  const url = `${window.location.origin}/f/${form.slug}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const svg = document.getElementById('qr-svg');
    const serializer = new XMLSerializer();
    const svgStr = serializer.serializeToString(svg);
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 400, 400);
      ctx.drawImage(img, 0, 0, 400, 400);
      const link = document.createElement('a');
      link.download = `qr-${form.slug}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgStr)));
  };

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Icons.QrCode size={20} style={{ color: 'var(--brand)' }} />
            <h2 style={{ margin: 0, fontSize: '1.25rem' }}>رمز الاستجابة السريعة (QR)</h2>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose} id="qr-modal-close">
            <Icons.Cross size={18} />
          </button>
        </div>

        <p style={{ color: 'var(--text-3)', marginBottom: 24, fontSize: '0.9rem' }}>
          {form.name}
        </p>

        <div style={{
          background: '#fff',
          borderRadius: 'var(--r)',
          padding: 20,
          display: 'inline-block',
          marginBottom: 24,
          boxShadow: 'var(--shadow)',
          border: '1.5px solid var(--border)',
        }}>
          <QRCodeSVG
            id="qr-svg"
            value={url}
            size={220}
            bgColor="#ffffff"
            fgColor="#204F8C"
            level="H"
          />
        </div>

        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--r)',
          padding: '10px 14px',
          marginBottom: 20,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          direction: 'ltr',
        }}>
          <span style={{ flex: 1, fontSize: '0.82rem', color: 'var(--text-3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {url}
          </span>
          <button
            className={`btn btn-sm ${copied ? 'btn-secondary' : 'btn-primary'}`}
            onClick={handleCopy}
            id="copy-url-btn"
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            {copied ? <Icons.Check size={14} /> : <Icons.Copy size={14} />}
            <span>{copied ? 'تم النسخ' : 'نسخ'}</span>
          </button>
        </div>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button className="btn btn-primary" onClick={handleDownload} id="download-qr-btn" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Icons.Download size={16} />
            <span>تحميل الرمز</span>
          </button>
          <button className="btn btn-ghost" onClick={onClose}>إغلاق</button>
        </div>
      </div>
    </div>
  );
}
