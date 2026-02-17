const { GoogleGenerativeAI } = require('@google/generative-ai');
const prisma = require('../lib/prisma');
const pdf = require('pdf-parse');
const path = require('path');
const fs = require('fs');
const { InternalServerError } = require('../utils/errors/ApiError');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const generateResponse = async (message) => {
    try {
        // 1. Fetch Structured Context
        const [skills, projects, experience, education, certifications, resume] = await Promise.all([
            prisma.skill.findMany(),
            prisma.project.findMany(),
            prisma.experience.findMany(),
            prisma.education.findMany(),
            prisma.certification.findMany(),
            prisma.resume.findFirst()
        ]);

        // 2. Parse Resume PDF
        let resumeText = 'Resume not available.';
        if (resume && resume.fileUrl) {
            try {
                const response = await fetch(resume.fileUrl);
                if (response.ok) {
                    const arrayBuffer = await response.arrayBuffer();
                    const dataBuffer = Buffer.from(arrayBuffer);
                    const data = await pdf(dataBuffer);
                    resumeText = data.text;
                } else {
                    console.warn(`[ChatService] Failed to fetch resume PDF: ${response.statusText}`);
                }
            } catch (fetchErr) {
                console.error('[ChatService] Error fetching remote PDF:', fetchErr);
            }
        }

        // 3. Construct System Prompt
        const context = `
      You are an AI assistant for Isaac's Portfolio, named Lumi. 
      Your goal is to answer questions about Isaac based on his REAL resume and portfolio data.
      
      Here is the raw text extracted directly from Isaac's Resume PDF:
      === RESUME START ===
      ${resumeText}
      === RESUME END ===

      Here is additional structured data from the database:
      
      [SKILLS]
      ${skills.map(s => `- ${s.nameEn} (${s.category}, Level: ${s.level}%)`).join('\n')}
      
      [PROJECTS]
      ${projects.map(p => `- ${p.titleEn}: ${p.descEn || p.titleFr} (Tech: ${p.techStack})`).join('\n')}
      
      [EXPERIENCE]
      ${experience.map(e => `- ${e.roleEn} at ${e.company} (${e.period}): ${e.descEn}`).join('\n')}
      
      [EDUCATION]
      ${education.map(e => `- ${e.degreeEn} at ${e.institution} (${e.period})`).join('\n')}
      
      [CERTIFICATIONS]
      ${certifications.map(c => `- ${c.nameEn} from ${c.issuer} (${c.date})`).join('\n')}
      
      INSTRUCTIONS:
      - Answer in the same language as the user (English or French). 
      - Be professional, enthusiastic, and friendly.
      - Use the Resume Content as the primary source for his Bio, Background, Contact Info, and Summary.
      - Use the Structured Data to supplement details about projects or specific skills if the resume is vague.
      - If you don't know the answer based on the data, strictly say you don't have that information.
    `;

        // 4. Call Gemini
        const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });
        const chat = model.startChat({
            history: [
                {
                    role: 'user',
                    parts: [{ text: context }],
                },
                {
                    role: 'model',
                    parts: [{ text: 'Understood. I have read Isaac\'s resume and portfolio data. I am ready to answer questions.' }],
                }
            ],
            generationConfig: {
                maxOutputTokens: 500,
            },
        });

        const result = await chat.sendMessage(message);
        const response = await result.response;
        return response.text();
    } catch (err) {
        console.error('[ChatService] Error:', err);
        throw new InternalServerError('Failed to generate AI response');
    }
};

module.exports = {
    generateResponse,
};
