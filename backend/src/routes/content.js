const express = require("express");
const router = express.Router();
const prisma = require("../lib/prisma"); // Adjust path if needed
const { requireAuth } = require("../middleware/auth");

// Helper for CRUD
const ContentController = require("../controllers/content.controller");
const { contactLimiter, testimonialLimiter } = require("../middleware/rateLimit");

// Helper to create routes
const registerRoutes = (basePath, controller, customRoutes = null) => {
    router.get(`/${basePath}`, controller.getAll);
    router.get(`/${basePath}/:id`, controller.getOne);
    router.post(`/${basePath}`, requireAuth, controller.create);
    router.put(`/${basePath}/:id`, requireAuth, controller.update);
    router.delete(`/${basePath}/:id`, requireAuth, controller.delete);
};

// Controllers
const projects = new ContentController('project', 'projectSchema');
const experiences = new ContentController('experience', 'experienceSchema');
const educations = new ContentController('education', 'educationSchema');
const skills = new ContentController('skill', 'skillSchema');
const hobbies = new ContentController('hobby'); // No hobby schema defined yet, using raw
const resumes = new ContentController('resume');
const certifications = new ContentController('certification', 'certificationSchema');
const messages = new ContentController('contactMessage', 'contactMessageSchema');
const testimonials = new ContentController('testimonial', 'testimonialSchema');

// Register Standard Routes
registerRoutes('projects', projects);
registerRoutes('experiences', experiences);
registerRoutes('educations', educations);
registerRoutes('skills', skills);
registerRoutes('hobbies', hobbies);
registerRoutes('resumes', resumes);
registerRoutes('certifications', certifications);

// Messages Routes
router.post("/messages", contactLimiter, messages.create);
router.get("/messages", requireAuth, messages.getAll);

// Testimonials Routes
router.post("/testimonials", testimonialLimiter, testimonials.create);
router.get("/testimonials", (req, res, next) => {
    req.prismaFilter = { approved: true };
    next();
}, testimonials.getAll);
router.get("/testimonials/admin", requireAuth, testimonials.getAll); // Admin (all)
router.put("/testimonials/:id", requireAuth, testimonials.update);
router.delete("/testimonials/:id", requireAuth, testimonials.delete);

module.exports = router;
