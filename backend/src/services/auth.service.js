const prisma = require('../lib/prisma');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../middleware/auth');
const { UnauthorizedError, ForbiddenError } = require('../utils/errors/ApiError');

const login = async (email, password) => {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
        throw new UnauthorizedError('Invalid credentials');
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
        throw new UnauthorizedError('Invalid credentials');
    }

    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
        expiresIn: '7d',
    });

    return { token, user: { email: user.email } };
};

const setupAdmin = async (email, password) => {
    const count = await prisma.user.count();
    if (count > 0) {
        throw new ForbiddenError('Admin already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
        data: { email, password: hashedPassword },
    });

    return { message: 'Admin created successfully' };
};

module.exports = {
    login,
    setupAdmin,
};
