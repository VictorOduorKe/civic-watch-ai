/**
 * Zero-dependency cookie parser middleware.
 * Parses the incoming HTTP 'Cookie' header into req.cookies object.
 */
export function cookieParser(req, res, next) {
  req.cookies = {};
  const cookieHeader = req.headers.cookie;

  if (cookieHeader) {
    const pairs = cookieHeader.split(';');
    for (let i = 0; i < pairs.length; i++) {
      const pair = pairs[i].trim();
      if (!pair) continue;
      const equalsIndex = pair.indexOf('=');
      if (equalsIndex > 0) {
        const key = pair.substring(0, equalsIndex).trim();
        const value = pair.substring(equalsIndex + 1).trim();
        try {
          req.cookies[key] = decodeURIComponent(value);
        } catch {
          req.cookies[key] = value;
        }
      }
    }
  }

  next();
}

export default cookieParser;
