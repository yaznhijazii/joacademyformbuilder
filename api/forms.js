export default async function handler(req, res) {
  // Set CORS headers for security and flexibility
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, x-admin-password'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const ADMIN_PASSWORD = process.env.VITE_ADMIN_PASSWORD || 'Yazh@101010';
  const BUCKET_URL = 'https://kvdb.io/C4UEARmLD7PdzpXo2jC1VZ/forms';

  // Helper to fetch forms from KV store
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

  // Helper to save forms to KV store
  const saveToKV = async (forms) => {
    try {
      const response = await fetch(BUCKET_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(forms),
      });
      return response.ok;
    } catch (err) {
      console.error('Error writing to KV database:', err);
      return false;
    }
  };

  try {
    const { slug } = req.query;

    // PUBLIC: Fetch single form by slug (for students)
    if (req.method === 'GET' && slug) {
      const forms = await fetchFromKV();
      if (forms === null) {
        return res.status(500).json({ error: 'Failed to read data from cloud database' });
      }
      const form = forms.find((f) => f.slug === slug);
      if (!form) {
        return res.status(404).json({ error: 'Form not found' });
      }
      return res.status(200).json(form);
    }

    // ADMIN ONLY check for other requests
    const clientPassword = req.headers['x-admin-password'];
    if (clientPassword !== ADMIN_PASSWORD) {
      return res.status(401).json({ error: 'Unauthorized admin access required' });
    }

    // GET all forms (Admin only)
    if (req.method === 'GET') {
      const forms = await fetchFromKV();
      if (forms === null) {
        return res.status(500).json({ error: 'Failed to read data from cloud database' });
      }
      return res.status(200).json(forms);
    }

    // POST/PUT save forms list (Admin only)
    if (req.method === 'POST' || req.method === 'PUT') {
      const newForms = req.body;
      if (!Array.isArray(newForms)) {
        return res.status(400).json({ error: 'Invalid forms payload, must be an array' });
      }
      const success = await saveToKV(newForms);
      if (!success) {
        return res.status(500).json({ error: 'Failed to write data to cloud database' });
      }
      return res.status(200).json({ success: true, count: newForms.length });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Serverless Forms Database Error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
