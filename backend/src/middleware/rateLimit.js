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
    message: { error: "Quota atteint. Le changement d'IP (VPN) n'a pas d'effet : votre navigateur est identifié. / Quota reached. IP change (VPN) has no effect: your browser is identified." },
    validate: { default: false },
    standardHeaders: true,
    legacyHeaders: false,
});

// Independent limiter for Testimonials
const testimonialLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 3,
    keyGenerator,
    message: { error: "Quota de témoignages atteint. Le changement d'IP (VPN) est inefficace. / Testimonial quota reached. IP change (VPN) is ineffective." },
    validate: { default: false },
    standardHeaders: true,
    legacyHeaders: false,
});

// Independent limiter for Chat
const chatLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 15,
    keyGenerator,
    message: { error: "Limite de chat atteinte. Identifiant navigateur bloqué (VPN inutile). / Chat limit reached. Browser ID blocked (VPN useless)." },
    validate: { default: false },
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = {
    contactLimiter,
    testimonialLimiter,
    chatLimiter
};
