const chatService = require('../services/chat.service');
const { BadRequestError } = require('../utils/errors/ApiError');

const handleChat = async (req, res, next) => {
    try {
        const { message } = req.body;

        if (!message) {
            throw new BadRequestError('Message is required');
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
