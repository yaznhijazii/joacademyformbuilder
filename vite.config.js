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

            // Route 3: GET/POST/PUT /api/forms
            if (req.url && req.url.startsWith('/api/forms')) {
              const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
              const slug = urlObj.searchParams.get('slug');
              const ADMIN_PASSWORD = env.VITE_ADMIN_PASSWORD || 'Yazh@101010';
              const BUCKET_URL = 'https://kvdb.io/joacademy_yazan_forms_2026/forms';

              const fetchFromKV = async () => {
                try {
                  const response = await fetch(BUCKET_URL);
                  if (!response.ok) {
                    if (response.status === 404) return [];
                    throw new Error('KV error');
                  }
                  const data = await response.json();
                  return Array.isArray(data) ? data : [];
                } catch (err) {
                  console.error('Error reading from KV database:', err);
                  return null;
                }
              };

              const saveToKV = async (formsList) => {
                try {
                  const response = await fetch(BUCKET_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formsList),
                  });
                  return response.ok;
                } catch (err) {
                  console.error('Error writing to KV database:', err);
                  return false;
                }
              };

              if (req.method === 'OPTIONS') {
                res.statusCode = 200;
                res.setHeader('Access-Control-Allow-Credentials', 'true');
                res.setHeader('Access-Control-Allow-Origin', '*');
                res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
                res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, x-admin-password');
                res.end();
                return;
              }

              res.setHeader('Access-Control-Allow-Credentials', 'true');
              res.setHeader('Access-Control-Allow-Origin', '*');
              res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
              res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, x-admin-password');
              res.setHeader('Content-Type', 'application/json');

              try {
                // PUBLIC: Fetch single form by slug
                if (req.method === 'GET' && slug) {
                  const formsList = await fetchFromKV();
                  if (formsList === null) {
                    res.statusCode = 500;
                    res.end(JSON.stringify({ error: 'Failed to read data from cloud database' }));
                    return;
                  }
                  const formItem = formsList.find((f) => f.slug === slug);
                  if (!formItem) {
                    res.statusCode = 404;
                    res.end(JSON.stringify({ error: 'Form not found' }));
                    return;
                  }
                  res.statusCode = 200;
                  res.end(JSON.stringify(formItem));
                  return;
                }

                // ADMIN ONLY check
                const clientPassword = req.headers['x-admin-password'];
                if (clientPassword !== ADMIN_PASSWORD) {
                  res.statusCode = 401;
                  res.end(JSON.stringify({ error: 'Unauthorized admin access required' }));
                  return;
                }

                // GET all forms
                if (req.method === 'GET') {
                  const formsList = await fetchFromKV();
                  if (formsList === null) {
                    res.statusCode = 500;
                    res.end(JSON.stringify({ error: 'Failed to read data from cloud database' }));
                    return;
                  }
                  res.statusCode = 200;
                  res.end(JSON.stringify(formsList));
                  return;
                }

                // POST/PUT save forms
                if (req.method === 'POST' || req.method === 'PUT') {
                  let body = '';
                  await new Promise((resolve, reject) => {
                    req.on('data', (chunk) => { body += chunk; });
                    req.on('end', resolve);
                    req.on('error', reject);
                  });

                  const newForms = JSON.parse(body);
                  if (!Array.isArray(newForms)) {
                    res.statusCode = 400;
                    res.end(JSON.stringify({ error: 'Invalid forms payload, must be an array' }));
                    return;
                  }
                  const success = await saveToKV(newForms);
                  if (!success) {
                    res.statusCode = 500;
                    res.end(JSON.stringify({ error: 'Failed to write data to cloud database' }));
                    return;
                  }
                  res.statusCode = 200;
                  res.end(JSON.stringify({ success: true, count: newForms.length }));
                  return;
                }

                res.statusCode = 405;
                res.end(JSON.stringify({ error: 'Method not allowed' }));
                return;
              } catch (error) {
                console.error('Serverless Forms Database Error:', error);
                res.statusCode = 500;
                res.end(JSON.stringify({ error: error.message || 'Internal server error' }));
                return;
              }
            }

            next();
          });
        }
      }
    ]
  }
});
