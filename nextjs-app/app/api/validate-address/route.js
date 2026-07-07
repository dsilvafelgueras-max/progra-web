// POST /api/validate-address
// Body: { address, city }
// Verifica contra Nominatim (OpenStreetMap) que la dirección exista de verdad.
// Se hace del lado del servidor para evitar CORS y poder mandar un User-Agent
// propio (Nominatim lo exige en su política de uso).

export async function POST(request) {
  const { address, city } = await request.json();

  if (!address?.trim()) {
    return Response.json({ valid: false, error: 'Completá la dirección.' }, { status: 400 });
  }

  // Armar la consulta: "dirección, ciudad, Argentina"
  const parts = [address.trim(), city?.trim(), 'Argentina'].filter(Boolean);
  const query = parts.join(', ');

  const url =
    'https://nominatim.openstreetmap.org/search' +
    `?format=json&limit=1&addressdetails=1&countrycodes=ar&q=${encodeURIComponent(query)}`;

  let results;
  try {
    const res = await fetch(url, {
      headers: {
        // Nominatim requiere identificar la app. Sin esto puede bloquear.
        'User-Agent': 'sangria-studio/1.0 (tienda online - validacion de direcciones)',
        'Accept-Language': 'es',
      },
    });
    if (!res.ok) throw new Error(`Nominatim HTTP ${res.status}`);
    results = await res.json();
  } catch (err) {
    console.error('[validate-address] error:', err?.message ?? err);
    // Si el servicio de mapas falla, no bloqueamos por un problema externo:
    // devolvemos "no verificado" para que el checkout decida.
    return Response.json(
      { valid: false, unverified: true, error: 'No pudimos verificar la dirección en este momento.' },
      { status: 503 }
    );
  }

  if (!Array.isArray(results) || results.length === 0) {
    return Response.json({
      valid: false,
      error: 'No encontramos esa dirección. Revisá la calle, altura y ciudad.',
    });
  }

  const match = results[0];
  return Response.json({
    valid: true,
    normalized: match.display_name,
    lat: match.lat,
    lon: match.lon,
  });
}
