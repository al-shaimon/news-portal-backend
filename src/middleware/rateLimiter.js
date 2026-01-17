import rateLimit from 'express-rate-limit';

const rateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 5 * 60 * 1000, // 5 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 1000, // limit each IP to 1000 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  keyGenerator: (req) => {
    // Check for specific headers that might contain the real IP
    if (req.headers['cf-connecting-ip']) {
      return req.headers['cf-connecting-ip'];
    }
    
    // Check X-Forwarded-For header
    if (req.headers['x-forwarded-for']) {
      // The first IP in the list is the original client IP
      return req.headers['x-forwarded-for'].split(',')[0].trim();
    }
    
    // Check X-Real-IP header
    if (req.headers['x-real-ip']) {
      return req.headers['x-real-ip'];
    }
    
    // Fallback to connection remote address
    return req.ip;
  }
});

export default rateLimiter;
