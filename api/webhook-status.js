export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const WEBHOOK = process.env.BITRIX_WEBHOOK || process.env.VITE_BITRIX_WEBHOOK || '';
    const ENTITY_TYPE_ID = Number(process.env.BITRIX_ENTITY_TYPE || process.env.VITE_BITRIX_ENTITY_TYPE || 1720);

    if (!WEBHOOK) {
      return res.status(200).json({
        configured: false,
        entityTypeId: ENTITY_TYPE_ID,
        webhook: '— غير معرف (يرجى إعداده في ملف .env) —'
      });
    }

    // Mask the webhook URL for security (protecting the webhook secret key from client leak)
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
      // Fallback masking if it's not a standard URL
      masked = WEBHOOK.substring(0, 15) + '••••••••' + WEBHOOK.substring(WEBHOOK.length - 5);
    }

    return res.status(200).json({
      configured: true,
      entityTypeId: ENTITY_TYPE_ID,
      webhook: masked
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
