exports.handler = async (event) => {
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
      messages: [{ role: 'user', content: `Extrait les donnees de ce SMS Booking.com et reponds UNIQUEMENT avec un JSON valide sans texte avant ou apres.\nFormat: {"nom":"...","checkin":"JJ/MM/AAAA","checkout":"JJ/MM/AAAA","chambre":"...","personnes":"...","montant":"..."}\nSMS:\n${sms}` }]
    })
  });

  const data = await res.json();
  const text = data.content[0].text.replace(/```json|```/g, '').trim();
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: text
  };
};
