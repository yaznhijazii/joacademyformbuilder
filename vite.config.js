/* eslint-env node */
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load all environment variables from local .env files
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react(),
      {
        name: 'local-api-middleware',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            // Route 1: GET /api/webhook-status
            if (req.url && req.url.startsWith('/api/webhook-status')) {
              if (req.method === 'GET') {
                try {
                  const WEBHOOK = env.VITE_BITRIX_WEBHOOK || env.BITRIX_WEBHOOK || '';
                  const ENTITY_TYPE_ID = Number(env.VITE_BITRIX_ENTITY_TYPE || env.BITRIX_ENTITY_TYPE || 1720);

                  if (!WEBHOOK) {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({
                      configured: false,
                      entityTypeId: ENTITY_TYPE_ID,
                      webhook: '— غير معرف (يرجى إعداده في ملف .env) —'
                    }));
                    return;
                  }

                  // Mask webhook
                  let masked = '— غير معرف —';
                  try {
                    const urlObj = new URL(WEBHOOK);
                    const pathParts = urlObj.pathname.split('/').filter(Boolean);
                    if (pathParts.length > 0) {
                      const lastPart = pathParts[pathParts.length - 1];
                      if (lastPart.length > 8) {
                        const maskedToken = lastPart.substring(0, 4) + '••••••••' + lastPart.substring(lastPart.length - 4);
                        pathParts[pathParts.length - 1] = maskedToken;
                      } else {
                        pathParts[pathParts.length - 1] = '••••••••';
                      }
                    }
                    masked = `${urlObj.origin}/${pathParts.join('/')}/`;
                  } catch {
                    masked = WEBHOOK.substring(0, 15) + '••••••••' + WEBHOOK.substring(WEBHOOK.length - 5);
                  }

                  res.statusCode = 200;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({
                    configured: true,
                    entityTypeId: ENTITY_TYPE_ID,
                    webhook: masked
                  }));
                  return;
                } catch (error) {
                  res.statusCode = 500;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ error: error.message }));
                  return;
                }
              }
            }

            // Route 2: POST /api/submit
            if (req.url && req.url.startsWith('/api/submit')) {
              if (req.method === 'POST') {
                try {
                  // Read the raw request body stream
                  let body = '';
                  await new Promise((resolve, reject) => {
                    req.on('data', (chunk) => { body += chunk; });
                    req.on('end', resolve);
                    req.on('error', reject);
                  });

                  const { form, answers } = JSON.parse(body);

                  // Extract Bitrix parameters from the loaded environment variables
                  const WEBHOOK = env.VITE_BITRIX_WEBHOOK || env.BITRIX_WEBHOOK;
                  const ENTITY_TYPE_ID = Number(env.VITE_BITRIX_ENTITY_TYPE || env.BITRIX_ENTITY_TYPE || 1720);

                  if (!WEBHOOK) {
                    res.statusCode = 500;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ error: 'Bitrix CRM webhook URL is not configured in local .env.' }));
                    return;
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
                    res.statusCode = response.status;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ error: `Bitrix24 CRM API error: status ${response.status}` }));
                    return;
                  }

                  const data = await response.json();
                  res.statusCode = 200;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify(data));
                  return;
                } catch (error) {
                  res.statusCode = 500;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ error: error.message }));
                  return;
                }
              }
            }
            next();
          });
        }
      }
    ]
  }
});
