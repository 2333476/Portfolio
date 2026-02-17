/* eslint-disable react-refresh/only-export-components */
// Map skill names to Devicon filenames
// Format: [folder]/[filename]-[type].svg
// Map skill names to Iconify identifiers
// Format: [provider]:[icon-set]:[name]
const SKILL_MAP: Record<string, string> = {
    'html': 'logos:html-5', 'html5': 'logos:html-5',
    'css': 'logos:css-3', 'css3': 'logos:css-3',
    'javascript': 'logos:javascript', 'js': 'logos:javascript',
    'typescript': 'logos:typescript-icon', 'ts': 'logos:typescript-icon',
    'react': 'logos:react', 'reactjs': 'logos:react',
    'nextjs': 'logos:nextjs-icon', 'next': 'logos:nextjs-icon',
    'vue': 'logos:vue',
    'angular': 'logos:angular-icon',
    'svelte': 'logos:svelte-icon',
    'tailwind': 'logos:tailwindcss-icon', 'tailwindcss': 'logos:tailwindcss-icon',
    'node': 'logos:nodejs-icon', 'nodejs': 'logos:nodejs-icon',
    'python': 'logos:python', 'py': 'logos:python',
    'java': 'logos:java',
    'auth0': 'logos:auth0-icon',
    'vercel': 'logos:vercel-icon',
    'azure': 'logos:microsoft-azure',
    'php': 'logos:php',
    'go': 'logos:go',
    'rust': 'logos:rust',
    'csharp': 'logos:c-sharp', 'c#': 'logos:c-sharp',
    'cpp': 'logos:c-plusplus', 'c++': 'logos:c-plusplus',
    'sql': 'logos:mysql',
    'mysql': 'logos:mysql',
    'postgres': 'logos:postgresql', 'postgresql': 'logos:postgresql',
    'mongo': 'logos:mongodb-icon', 'mongodb': 'logos:mongodb-icon',
    'firebase': 'logos:firebase',
    'git': 'logos:git-icon',
    'docker': 'logos:docker-icon',
    'androidstudio': 'logos:android-icon',
    'aws': 'logos:aws',
    'linux': 'logos:linux-tux',
    'flutter': 'logos:flutter',
    'dart': 'logos:dart',
    'vite': 'logos:vitejs',
    'redux': 'logos:redux',
    'spring': 'logos:spring-icon', 'springboot': 'logos:spring-icon', 'spring-boot': 'logos:spring-icon',
    'fastapi': 'logos:fastapi-icon',
    'flask': 'logos:flask',
    'express': 'logos:express',
    'cicd': 'logos:github-actions',
    'pandas': 'logos:pandas-icon',
    'oauth': 'logos:oauth',
};

export const AVAILABLE_SKILLS = Object.keys(SKILL_MAP).sort();

export const getSkillIcon = (skillName: string): string => {
    const normalized = skillName.toLowerCase().replace(/[\s\-_. /]/g, '');
    return SKILL_MAP[normalized] || 'logos:devicon';
};
