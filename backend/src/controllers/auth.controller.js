const authService = require('../services/auth.service');
const { loginSchema, setupSchema } = require('../validators/auth.validator');
const { BadRequestError } = require('../utils/errors/ApiError');

const login = async (req, res, next) => {
    try {
        // Validate request body
        const result = loginSchema.safeParse(req.body);
        if (!result.success) {
            const message = result.error.errors.map(e => e.message).join(', ');
            throw new BadRequestError(message);
        }

        const { email, password } = result.data;
        const { token, user } = await authService.login(email, password);

        res.json({ token, user });
    } catch (err) {
        next(err);
    }
};

const setup = async (req, res, next) => {
    try {
        // Validate request body
        const result = setupSchema.safeParse(req.body);
        if (!result.success) {
            const message = result.error.errors.map(e => e.message).join(', ');
            throw new BadRequestError(message);
        }

        const { email, password } = result.data;
        const response = await authService.setupAdmin(email, password);

        res.json(response);
    } catch (err) {
        next(err);
    }
};

module.exports = {
    login,
    setup,
};
