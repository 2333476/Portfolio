const chatService = require('../services/chat.service');
const { BadRequestError } = require('../utils/errors/ApiError');

const handleChat = async (req, res, next) => {
    try {
        const { message, turnstile_token } = req.body;

        if (!message) {
            throw new BadRequestError('Message is required');
        }

        // Cloudflare Turnstile Verification
        if (!turnstile_token && process.env.NODE_ENV === 'production') {
            throw new BadRequestError('Security verification failed (missing bot protection token)');
        }

        if (turnstile_token) {
            try {
                const turnstileResponse = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        secret: process.env.TURNSTILE_SECRET_KEY,
                        response: turnstile_token
                    })
                });

                const turnstileData = await turnstileResponse.json();
                if (!turnstileData.success) {
                    throw new BadRequestError('Security verification failed. Please try again.');
                }
            } catch (err) {
                console.error('[ChatController] Turnstile API error:', err);
                // Fail open in development, but in production we might want to fail closed
            }
        }

        const reply = await chatService.generateResponse(message);
        res.json({ reply });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    handleChat,
};
