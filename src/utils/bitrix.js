const WEBHOOK = import.meta.env.VITE_BITRIX_WEBHOOK;
const ENTITY_TYPE_ID = Number(import.meta.env.VITE_BITRIX_ENTITY_TYPE || 1720);

/**
 * Sends a completed form submission to Bitrix24 CRM.
 * @param {object} form - The form definition (title, fields etc.)
 * @param {object} answers - { fieldId: value, ... }
 */
export async function sendToBitrix(form, answers) {
  const now = new Date().toLocaleString('ar-JO', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  // Build a human-readable summary of all answers
  const summaryLines = form.fields.map((field) => {
    const val = answers[field.id];
    if (val === undefined || val === null || val === '') return null;
    let display = val;
    if (field.type === 'stars' && field.labels) {
      display = `${val} نجوم — ${field.labels[val - 1] || ''}`;
    } else if (field.type === 'scale') {
      display = `${val} / ${field.max || 10}`;
    }
    return `${field.question}: ${display}`;
  }).filter(Boolean).join('\n');

  // Build the CRM fields object
  const crmFields = {
    title: `${form.name} — ${now}`,
    assignedById: 1,
    comments: summaryLines,
  };

  // Map each form field to its Bitrix24 field key
  form.fields.forEach((field) => {
    if (field.bitrixField && answers[field.id] !== undefined) {
      crmFields[field.bitrixField] = String(answers[field.id]);
    }
  });

  const url = `${WEBHOOK}crm.item.add`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ entityTypeId: ENTITY_TYPE_ID, fields: crmFields }),
  });

  if (!response.ok) {
    throw new Error(`Bitrix24 API error: ${response.status}`);
  }
  const data = await response.json();
  if (data.error) {
    throw new Error(data.error_description || data.error);
  }
  return data;
}
