export default async function handler(req, res) {
  // Set CORS headers for security and flexibility
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { form, answers } = req.body;
    if (!form || !answers) {
      return res.status(400).json({ error: 'Missing form or answers data' });
    }

    const WEBHOOK = process.env.BITRIX_WEBHOOK || process.env.VITE_BITRIX_WEBHOOK;
    const ENTITY_TYPE_ID = Number(process.env.BITRIX_ENTITY_TYPE || process.env.VITE_BITRIX_ENTITY_TYPE || 1720);

    if (!WEBHOOK) {
      return res.status(500).json({ error: 'Bitrix webhook URL is not configured on the server.' });
    }

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
      return res.status(response.status).json({ error: `Bitrix24 CRM API error: status ${response.status}` });
    }

    const data = await response.json();
    if (data.error) {
      return res.status(400).json({ error: data.error_description || data.error });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('Error submitting to Bitrix24:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
