import rateLimit from 'express-rate-limit';

const RateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 5, 
  message: {
    status: 429,
    error: 'Too many login attempts from this IP, please try again after 15 minutes.',
  },
  standardHeaders: true, 
  legacyHeaders: false, 
});

export default RateLimiter;
