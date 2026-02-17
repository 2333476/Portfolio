const { z } = require('zod');

const projectSchema = z.object({
    titleEn: z.string().min(1),
    titleFr: z.string().min(1),
    descEn: z.string().optional(),
    descFr: z.string().optional(),
    imageUrl: z.string().optional(),
    liveUrl: z.string().optional(),
    githubUrl: z.string().optional(),
    techStack: z.string().optional(),
    featured: z.boolean().optional(),
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
    period: z.string().min(1),
    descEn: z.string().optional(),
    descFr: z.string().optional(),
    logoUrl: z.string().optional(),
});

const skillSchema = z.object({
    nameEn: z.string().min(1),
    nameFr: z.string().min(1),
    category: z.string().min(1),
    level: z.number().min(0).max(100),
});

const certificationSchema = z.object({
    nameEn: z.string().min(1),
    nameFr: z.string().min(1),
    issuer: z.string().min(1),
    date: z.string().min(1),
    imageUrl: z.string().optional(),
    logoUrl: z.string().optional(),
    credentialUrl: z.string().optional(),
});

const testimonialSchema = z.object({
    name: z.string().min(1),
    role: z.string().optional(),
    message: z.string().min(1),
    approved: z.boolean().optional(),
});

const contactMessageSchema = z.object({
    name: z.string().min(1),
    email: z.string().email(),
    subject: z.string().optional(),
    message: z.string().min(1),
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
