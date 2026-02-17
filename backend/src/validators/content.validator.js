const { z } = require('zod');

const projectSchema = z.object({
    titleEn: z.string().min(1),
    titleFr: z.string().min(1),
    descEn: z.string().optional(),
    descFr: z.string().optional(),
    imageUrl: z.string().optional(),
    demoLink: z.string().optional(),
    repoLink: z.string().optional(),
    techStack: z.array(z.string()).optional(),
});

const experienceSchema = z.object({
    roleEn: z.string().min(1),
    roleFr: z.string().min(1),
    company: z.string().min(1),
    period: z.string().min(1),
    descEn: z.string().optional(),
    descFr: z.string().optional(),
    logoUrl: z.string().optional(),
});

const educationSchema = z.object({
    degreeEn: z.string().min(1),
    degreeFr: z.string().min(1),
    institution: z.string().min(1),
    startDate: z.string().min(1),
    endDate: z.string().optional().nullable(),
    descriptionEn: z.string().optional(),
    descriptionFr: z.string().optional(),
    logoUrl: z.string().optional(),
});

const skillSchema = z.object({
    nameEn: z.string().min(1),
    nameFr: z.string().min(1),
    category: z.string().min(1),
    level: z.number().min(0).max(100),
    imageUrl: z.string().optional(),
});

const certificationSchema = z.object({
    nameEn: z.string().min(1),
    nameFr: z.string().min(1),
    issuer: z.string().min(1),
    date: z.string().min(1),
    imageUrl: z.string().optional(),
    logoUrl: z.string().optional(),
    url: z.string().optional(),
});

const testimonialSchema = z.object({
    author: z.string().min(1),
    role: z.string().optional(),
    contentEn: z.string().min(1),
    contentFr: z.string().min(1),
    approved: z.boolean().optional(),
});

const contactMessageSchema = z.object({
    name: z.string().min(1),
    email: z.string().email(),
    subject: z.string().optional(),
    message: z.string().min(1),
    read: z.boolean().optional(),
});

module.exports = {
    projectSchema,
    experienceSchema,
    educationSchema,
    skillSchema,
    certificationSchema,
    testimonialSchema,
    contactMessageSchema,
};
