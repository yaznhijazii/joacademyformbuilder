/**
 * Sends a completed form submission to the secure serverless backend,
 * which in turn maps and pushes the lead/data to Bitrix24 CRM securely.
 * This completely hides the Bitrix CRM Webhook URL and API details from the student's browser.
 * 
 * @param {object} form - The form definition (title, fields etc.)
 * @param {object} answers - { fieldId: value, ... }
 */
export async function sendToBitrix(form, answers) {
  const response = await fetch('/api/submit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ form, answers }),
  });

  if (!response.ok) {
    let errorMsg = `HTTP Error ${response.status}`;
    try {
      const errData = await response.json();
      errorMsg = errData.error || errorMsg;
    } catch (_) {}
    throw new Error(errorMsg);
  }

  const data = await response.json();
  if (data.error) {
    throw new Error(data.error_description || data.error);
  }
  return data;
}
