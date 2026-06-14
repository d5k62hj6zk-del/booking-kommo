exports.handler = async (event) => {
  try {
    const { sms } = JSON.parse(event.body);

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 300,
        messages: [{
          role: 'user',
          content: 'Extrait les donnees de ce SMS Booking.com.\nReponds UNIQUEMENT avec un JSON valide, rien dautre.\nFormat exact: {"nom":"...","checkin":"JJ/MM/AAAA","checkout":"JJ/MM/AAAA","chambre":"...","personnes":"...","montant":"..."}\nSMS:\n' + sms
        }]
      })
    });

    const data = await res.json();
    let text = data.content[0].text.trim();
    text = text.replace(/```json|```/g, '').trim();
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    text = text.slice(start, end + 1);
    const parsed = JSON.parse(text);

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
