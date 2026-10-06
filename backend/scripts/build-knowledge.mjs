import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '../..');
const pageFiles = [
  ['about', '_pages/about.md'],
  ['experience', '_pages/experience.md'],
  ['skills', '_pages/skills.md'],
  ['projects', '_pages/projects.md']
];

function stripMarkup(source) {
  return source
    .replace(/^---[\s\S]*?---\s*/u, '')
    .replace(/\{\{[\s\S]*?\}\}/gu, ' ')
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/giu, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/giu, ' ')
    .replace(/<a\b[^>]*href=["'](https?:\/\/[^"']+)["'][^>]*>([\s\S]*?)<\/a>/giu, '$2 ($1)')
    .replace(/<[^>]+>/gu, ' ')
    .replace(/&(?:nbsp|mdash|ndash|middot|amp|lt|gt|quot|apos);/giu, (entity) => ({
      '&nbsp;': ' ', '&mdash;': '—', '&ndash;': '–', '&middot;': '·',
      '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&apos;': "'"
    })[entity.toLowerCase()] ?? ' ')
    .replace(/&#(\d+);/gu, (_, value) => String.fromCodePoint(Number(value)))
    .replace(/&#x([\da-f]+);/giu, (_, value) => String.fromCodePoint(parseInt(value, 16)))
    .replace(/\[([^\]]*)\]\((https?:\/\/[^)]+)\)/gu, '$1 ($2)')
    .replace(/[\t ]+/gu, ' ')
    .replace(/\s*\n\s*/gu, '\n')
    .replace(/\n{3,}/gu, '\n\n')
    .trim();
}

const config = await readFile(resolve(root, '_config.yml'), 'utf8');
const email = config.match(/^\s*email\s*:\s*["']?([^"'\r\n#]+)["']?\s*$/mu)?.[1]?.trim() ?? '';
const siteUrl = config.match(/^url\s*:\s*["']?([^"'\r\n#]+)["']?\s*$/mu)?.[1]?.trim() ?? 'https://kevin-bai.com';
const profilePath = resolve(root, '_data/chat-profile.json');
let profile = {};
try { profile = JSON.parse(await readFile(profilePath, 'utf8')); }
catch (error) {
  if (error.code !== 'ENOENT') throw new Error(`Unable to read ${profilePath}: ${error.message}`);
}
if (!profile || typeof profile !== 'object' || Array.isArray(profile) || Object.values(profile).some((value) => typeof value !== 'string')) {
  throw new Error(`${profilePath} must contain a JSON object whose values are strings.`);
}

const pages = await Promise.all(pageFiles.map(async ([id, path]) => {
  const content = stripMarkup(await readFile(resolve(root, path), 'utf8'));
  return { id, title: ({ about: 'About Kevin', experience: 'Experience and education', skills: 'Skills and expertise', projects: 'Projects' })[id], url: new URL(`/${id === 'about' ? 'about' : id}/`, siteUrl).toString(), content };
}));
pages.push({
  id: 'contact', title: 'Contact', url: new URL('/about/', siteUrl).toString(),
  content: [`Name: Kevin Bai`, `Location: Toronto, Ontario`, email ? `Email: ${email}` : '',
    ...Object.entries(profile).filter(([, value]) => typeof value === 'string' && value.trim()).map(([key, value]) => `${key.replaceAll('_', ' ')}: ${value.trim()}`)]
    .filter(Boolean).join('\n')
});

await writeFile(resolve(import.meta.dirname, '../src/knowledge.json'), `${JSON.stringify(pages, null, 2)}\n`, 'utf8');
console.log(`Built chat knowledge from ${pageFiles.length} pages and contact/profile data.`);
