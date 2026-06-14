const https = require('https');

exports.handler = async (event) => {
  try {
    const { sms } = JSON.parse(event.body);

    const body = JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 300,
      messages: [{ 
        role: 'user', 
        content: 'Extrait les donnees de ce SMS Booking.com. Reponds UNIQUEMENT avec un JSON valide, rien dautre, pas de markdown.\nFormat: {"nom":"...","checkin":"JJ/MM/AAAA","checkout":"JJ/MM/AAAA","chambre":"...","personnes":"...","montant":"..."}\nSMS:\n' + sms 
      }]
    });

    const result = await new Promise((resolve, reject) => {
      const req = https.request({
        hostname: 'api.anthropic.com',
        path: '/v1/messages',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_KEY,
          'anthropic-version': '2023-06-01',
          'Content-Length': Buffer.byteLength(body)
        }
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve(data));
      });
      req.on('error', reject);
      req.write(body);
      req.end();
    });

    const data = JSON.parse(result);
    let text = data.content[0].text.trim();
    text = text.replace(/```json|```/g, '').trim();
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    const parsed = JSON.parse(text.slice(start, end + 1));

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(parsed)
    };
  } catch(e) {
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: e.message })
    };
  }
};
