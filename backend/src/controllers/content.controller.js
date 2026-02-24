const prisma = require('../lib/prisma');
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

            // Honeypot and Advanced Security check for messages/testimonials
            const publicModels = ['contactMessage', 'testimonial'];
            if (publicModels.includes(this.service.modelName)) {

                // 1. Classic Honeypot
                if (data.fax || data.website_url || data.company_name) {
                    console.warn(`[ContentController] Spam detected via honeypot for model: ${this.service.modelName}`);
                    throw new BadRequestError('Spam submission blocked.');
                }

                // 2. Disposable Email Check (Simplified Spam Protection)
                if (data.email) {
                    const disposableDomains = ['yopmail.com', 'temp-mail.org', 'guerrillamail.com', 'mailinator.com', '10minutemail.com'];
                    const domain = data.email.split('@')[1]?.toLowerCase();
                    if (disposableDomains.includes(domain)) {
                        throw new BadRequestError('Temporary email addresses are not allowed. Please use a permanent email.');
                    }
                }

                // 3. Cloudflare Turnstile Verification
                if (!data.turnstile_token && process.env.NODE_ENV === 'production') {
                    throw new BadRequestError('Security verification failed (missing bot protection token)');
                }

                if (data.turnstile_token) {
                    try {
                        const secret = process.env.TURNSTILE_SECRET_KEY || "1x000000000000000000000000000000AA";
                        const turnstileResponse = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                secret,
                                response: data.turnstile_token
                            })
                        });

                        const turnstileData = await turnstileResponse.json();
                        if (!turnstileData.success) {
                            console.warn(`[ContentController] Turnstile verification failed:`, turnstileData['error-codes']);
                            throw new BadRequestError('Security verification failed. Please refresh the page and try again.');
                        }
                    } catch (err) {
                        console.error('[ContentController] Turnstile API error:', err);
                        // Open only in non-prod
                        if (process.env.NODE_ENV === 'production') throw new BadRequestError('Security service unavailable.');
                    }
                }

                // 4. Time-Check (Bot Detection via Speed)
                const MIN_SUBMISSION_TIME_MS = 3000;
                if (data.submission_token) {
                    try {
                        const decodedTime = parseInt(Buffer.from(data.submission_token, 'base64').toString());
                        const duration = Date.now() - decodedTime;

                        if (isNaN(decodedTime) || duration < MIN_SUBMISSION_TIME_MS) {
                            console.warn(`[ContentController] Rapid submission detected (${duration}ms)`);
                            throw new BadRequestError('Form submitted too quickly. Please take your time.');
                        }
                    } catch (e) {
                        // Ignore invalid tokens silently or log
                    }
                }

                // Clean up security fields
                const fieldsToDelete = ['submission_token', 'turnstile_token', 'website_url', 'company_name', 'fax', 'client_uuid'];
                fieldsToDelete.forEach(f => delete data[f]);
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
