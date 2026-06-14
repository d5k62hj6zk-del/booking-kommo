exports.handler = async (event) => {
  const d = JSON.parse(event.body);
  
  const nom = d.nom || '';
  const checkin = d.checkin || '';
  const checkout = d.checkout || '';
  const chambre = d.chambre || '';
  const montant = d.montant || '';
  const prix = parseInt(montant.replace(/[^0-9]/g, '')) || 0;
  const leadName = `${nom} - ${chambre} (${checkin} au ${checkout})`;

  const res = await fetch(`https://kommocompencil295.kommo.com/api/v4/leads/complex`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.KOMMO_TOKEN}`
    },
    body: JSON.stringify([{
      name: leadName,
      price: prix,
      _embedded: {
        contacts: [{ name: nom, custom_fields_values: [] }]
      }
    }])
  });

  if (res.ok) {
    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  } else {
    const err = await res.text();
    return { statusCode: 200, body: JSON.stringify({ error: err }) };
  }
};

