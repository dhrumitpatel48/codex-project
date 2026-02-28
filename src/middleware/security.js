const JSON_METHODS = new Set(['POST', 'PUT', 'PATCH']);

export function requireJsonForApi(req, res, next) {
  if (!req.path.startsWith('/api/')) {
    return next();
  }

  if (!JSON_METHODS.has(req.method)) {
    return next();
  }

  if (!req.is('application/json')) {
    return res.status(415).json({ error: 'Content-Type must be application/json.' });
  }

  return next();
}

export function requireRequestedWith(req, res, next) {
  if (!req.path.startsWith('/api/') || req.method === 'GET') {
    return next();
  }

  const requestedWith = req.get('X-Requested-With');
  if (requestedWith !== 'XMLHttpRequest') {
    return res.status(400).json({ error: 'Missing required X-Requested-With header.' });
  }

  return next();
}
