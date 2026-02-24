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
                const secret = process.env.TURNSTILE_SECRET_KEY || "1x000000000000000000000000000000AA";
                const turnstileResponse = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        secret,
                        response: turnstile_token
                    })
                });

                const turnstileData = await turnstileResponse.json();
                if (!turnstileData.success) {
                    throw new BadRequestError('Security verification failed. Please try again.');
                }
            } catch (err) {
                console.error('[ChatController] Turnstile API error:', err);
                if (process.env.NODE_ENV === 'production') throw new BadRequestError('Security service unavailable.');
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
