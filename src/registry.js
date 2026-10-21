import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
export const SKILLS_DIR = join(__dirname, '..', 'skills');

/**
 * Extract simple YAML frontmatter fields like name and description
 */
function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return {};
  
  const rawYaml = match[1];
  const fm = {};
  
  const lines = rawYaml.split(/\r?\n/);
  let currentKey = null;
  let currentValueLines = [];

  for (const line of lines) {
    const keyMatch = line.match(/^([a-zA-Z0-9_-]+):\s*(.*)$/);
    if (keyMatch) {
      if (currentKey) {
        fm[currentKey] = cleanYamlValue(currentValueLines.join(' '));
      }
      currentKey = keyMatch[1].trim();
      currentValueLines = [keyMatch[2].trim()];
    } else if (currentKey && line.startsWith('  ')) {
      currentValueLines.push(line.trim());
    }
  }

  if (currentKey) {
    fm[currentKey] = cleanYamlValue(currentValueLines.join(' '));
  }

  return fm;
}

function cleanYamlValue(val) {
  let cleaned = val.trim();
  if (cleaned.startsWith('>-') || cleaned.startsWith('>')) {
    cleaned = cleaned.replace(/^>[-+]?\s*/, '');
  }
  if ((cleaned.startsWith('"') && cleaned.endsWith('"')) || (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
    cleaned = cleaned.slice(1, -1);
  }
  return cleaned.trim();
}

/**
 * Discover and read all skills packaged inside the repository's skills/ directory
 */
export function getAvailableSkills() {
  if (!existsSync(SKILLS_DIR)) return [];
  return readdirSync(SKILLS_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => {
      const skillDir = join(SKILLS_DIR, d.name);
      const skillMd = join(skillDir, 'SKILL.md');
      if (!existsSync(skillMd)) return null;
      
      const content = readFileSync(skillMd, 'utf-8');
      const fm = parseFrontmatter(content);
      
      return {
        dirName: d.name,
        name: fm.name || d.name,
        description: fm.description || '(no description provided)',
        path: skillDir,
      };
    })
    .filter(Boolean);
}
