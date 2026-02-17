const prisma = require('../lib/prisma');
const fs = require('fs');
const path = require('path');
const { NotFoundError } = require('../utils/errors/ApiError');

class BaseService {
    constructor(modelName) {
        this.modelName = modelName;
    }

    async getAll(where = {}, orderBy = null) {
        if (!orderBy) {
            const sortField = this.modelName === 'resume' ? 'updatedAt' : 'createdAt';
            orderBy = { [sortField]: 'desc' };
        }
        return await prisma[this.modelName].findMany({ where, orderBy });
    }

    async getOne(id) {
        const item = await prisma[this.modelName].findUnique({ where: { id } });
        if (!item) throw new NotFoundError(`${this.modelName} not found`);
        return item;
    }

    async create(data) {
        // Single Resume Policy
        if (this.modelName === 'resume') {
            const existing = await prisma.resume.findMany();
            for (const res of existing) {
                if (res.fileUrl) this.deleteFile(res.fileUrl);
                await prisma.resume.delete({ where: { id: res.id } });
            }
        }
        return await prisma[this.modelName].create({ data });
    }

    async update(id, data) {
        const oldItem = await this.getOne(id);

        // File cleanup logic
        this.handleFileCleanup(oldItem, data);

        const { id: _, createdAt, updatedAt, ...cleanData } = data;
        return await prisma[this.modelName].update({
            where: { id },
            data: cleanData,
        });
    }

    async delete(id) {
        const item = await this.getOne(id);

        // Cleanup files
        const files = [item.fileUrl, item.imageUrl, item.logoUrl, item.image].filter(Boolean);
        files.forEach(f => this.deleteFile(f));

        return await prisma[this.modelName].delete({ where: { id } });
    }

    handleFileCleanup(oldItem, newData) {
        const fileFields = ['fileUrl', 'imageUrl', 'logoUrl', 'image'];
        fileFields.forEach(field => {
            if (newData[field] && oldItem[field] && newData[field] !== oldItem[field]) {
                this.deleteFile(oldItem[field]);
            }
        });
    }

    deleteFile(relativePah) {
        const fullPath = path.join(__dirname, '../../public', relativePah);
        if (fs.existsSync(fullPath)) {
            try {
                fs.unlinkSync(fullPath);
                console.log(`[FileService] Deleted: ${fullPath}`);
            } catch (err) {
                console.error(`[FileService] Error deleting ${fullPath}:`, err);
            }
        }
    }
}

module.exports = BaseService;
