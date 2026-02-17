const rateLimit = require('express-rate-limit');

// Independent limiter for Contact messages
const contactLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3,
    message: {
        error: "Trop de messages de contact. Veuillez réessayer dans une heure. / Too many contact messages. Please try again in an hour."
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Independent limiter for Testimonials
const testimonialLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3,
    message: {
        error: "Trop de témoignages. Veuillez réessayer dans une heure. / Too many testimonials. Please try again in an hour."
    },
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = {
    contactLimiter,
    testimonialLimiter
};
