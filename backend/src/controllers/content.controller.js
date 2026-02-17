const BaseService = require('../services/base.service');
const { BadRequestError } = require('../utils/errors/ApiError');
const validators = require('../validators/content.validator');

class ContentController {
    constructor(modelName, validatorName = null) {
        this.service = new BaseService(modelName);
        this.validator = validatorName ? validators[validatorName] : null;
    }

    getAll = async (req, res, next) => {
        try {
            const where = req.prismaFilter || {}; // Renamed to avoid collisions
            const items = await this.service.getAll(where);
            res.json(items);
        } catch (err) {
            next(err);
        }
    };

    getOne = async (req, res, next) => {
        try {
            const item = await this.service.getOne(req.params.id);
            res.json(item);
        } catch (err) {
            next(err);
        }
    };

    create = async (req, res, next) => {
        try {
            let data = req.body;

            // Honeypot check for messages/testimonials
            if (data.fax || data.website_url) {
                console.warn('[ContentController] Spam detected via honeypot');
                throw new BadRequestError('Spam detected');
            }

            if (this.validator) {
                const result = this.validator.safeParse(data);
                if (!result.success) {
                    const message = result.error.errors.map(e => e.message).join(', ');
                    throw new BadRequestError(message);
                }
                data = result.data;
            }

            const item = await this.service.create(data);
            res.status(201).json(item);
        } catch (err) {
            next(err);
        }
    };

    update = async (req, res, next) => {
        try {
            let data = req.body;
            if (this.validator) {
                const result = this.validator.partial().safeParse(data);
                if (!result.success) {
                    const message = result.error.errors.map(e => e.message).join(', ');
                    throw new BadRequestError(message);
                }
                data = result.data;
            }

            const item = await this.service.update(req.params.id, data);
            res.json(item);
        } catch (err) {
            next(err);
        }
    };

    delete = async (req, res, next) => {
        try {
            await this.service.delete(req.params.id);
            res.json({ message: 'Deleted successfully' });
        } catch (err) {
            next(err);
        }
    };
}

module.exports = ContentController;
