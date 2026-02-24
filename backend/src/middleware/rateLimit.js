const rateLimit = require('express-rate-limit');

// Helper to identify user by UUID (if sent) or IP
const keyGenerator = (req) => {
    // We look for client_uuid in body (POST) or headers
    return req.body.client_uuid || req.headers['x-client-uuid'] || req.ip;
};

// Independent limiter for Contact messages
const contactLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 3,
    keyGenerator,
    message: { error: "Trop de messages. / Too many messages." },
    validate: { default: false },
    standardHeaders: true,
    legacyHeaders: false,
});

// Independent limiter for Testimonials
const testimonialLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 3,
    keyGenerator,
    message: { error: "Trop de témoignages. / Too many testimonials." },
    validate: { default: false },
    standardHeaders: true,
    legacyHeaders: false,
});

// Independent limiter for Chat
const chatLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 15,
    keyGenerator,
    message: { error: "Trop de messages au chat. / Too many chat messages." },
    validate: { default: false },
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = {
    contactLimiter,
    testimonialLimiter,
    chatLimiter
};
