#!/usr/bin/env node

import { existsSync, mkdirSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

const REPO_RAW = 'https://raw.githubusercontent.com/xujfcn/crazyrouter-skills/main';
const SKILLS_DIR = join(homedir(), '.openclaw', 'skills');

const REGISTRY = {
  'crazyrouter-chat':      { desc: 'Chat with 627+ AI models', files: ['SKILL.md', 'scripts/main.mjs'] },
  'crazyrouter-image-gen':  { desc: 'AI image generation (DALL-E 3, GPT Image, Gemini)', files: ['SKILL.md', 'scripts/main.mjs'] },
  'crazyrouter-tts':        { desc: 'Text-to-speech (OpenAI TTS voices)', files: ['SKILL.md', 'scripts/main.mjs'] },
  'crazyrouter-stt':        { desc: 'Speech-to-text transcription (Whisper)', files: ['SKILL.md', 'scripts/main.mjs'] },
  'crazyrouter-ocr':        { desc: 'Image-to-text / OCR (GPT-4o, Gemini, Claude)', files: ['SKILL.md', 'scripts/main.mjs'] },
  'crazyrouter-translate':  { desc: 'AI translation (multi-model)', files: ['SKILL.md', 'scripts/main.mjs'] },
  'crazyrouter-music-gen':  { desc: 'AI music generation (Suno)', files: ['SKILL.md', 'scripts/main.mjs'] },
  'crazyrouter-video-gen':  { desc: 'AI video generation (Sora 2, Kling, Veo 3)', files: ['SKILL.md', 'scripts/main.mjs'] },
};

const args = process.argv.slice(2);
const command = args[0];
const skillName = args[1];

function printHelp() {
  console.log(`
⚡ CrazyRouter Skills — AI Agent Skills Installer
  https://skills.crazyrouter.com

Usage:
  npx crazyrouter-skills install <skill-name>   Install a skill
  npx crazyrouter-skills list                    List available skills
  npx crazyrouter-skills installed               Show installed skills
  npx crazyrouter-skills uninstall <skill-name>  Remove a skill

Examples:
  npx crazyrouter-skills install crazyrouter-chat
  npx crazyrouter-skills install crazyrouter-image-gen
`);
}

function listSkills() {
  console.log('\n⚡ Available CrazyRouter Skills:\n');
  for (const [name, info] of Object.entries(REGISTRY)) {
    const installed = existsSync(join(SKILLS_DIR, name, 'SKILL.md'));
    const status = installed ? '✅' : '  ';
    console.log(`  ${status} ${name.padEnd(28)} ${info.desc}`);
  }
  console.log(`\nInstall: npx crazyrouter-skills install <name>`);
  console.log(`Docs:    https://skills.crazyrouter.com\n`);
}

function listInstalled() {
  console.log('\n📦 Installed Skills:\n');
  let count = 0;
  if (existsSync(SKILLS_DIR)) {
    for (const dir of readdirSync(SKILLS_DIR, { withFileTypes: true })) {
      if (dir.isDirectory() && existsSync(join(SKILLS_DIR, dir.name, 'SKILL.md'))) {
        const info = REGISTRY[dir.name];
        const desc = info ? info.desc : '(custom skill)';
        console.log(`  ✅ ${dir.name.padEnd(28)} ${desc}`);
        count++;
      }
    }
  }
  if (count === 0) {
    console.log('  No skills installed yet.');
    console.log('  Run: npx crazyrouter-skills install crazyrouter-chat');
  }
  console.log('');
}

async function fetchFile(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  return await res.text();
}

async function installSkill(name) {
  if (!REGISTRY[name]) {
    console.error(`\n❌ Unknown skill: ${name}`);
    console.log('Run "npx crazyrouter-skills list" to see available skills.\n');
    process.exit(1);
  }

  const info = REGISTRY[name];
  const targetDir = join(SKILLS_DIR, name);

  console.log(`\n⚡ Installing ${name}...`);
  console.log(`   ${info.desc}\n`);

  // Create directories
  mkdirSync(join(targetDir, 'scripts'), { recursive: true });

  // Download files
  for (const file of info.files) {
    const url = `${REPO_RAW}/${name}/${file}`;
    process.stdout.write(`   📥 ${file}...`);
    try {
      const content = await fetchFile(url);
      writeFileSync(join(targetDir, file), content);
      console.log(' ✅');
    } catch (err) {
      console.log(` ❌ ${err.message}`);
      process.exit(1);
    }
  }

  console.log(`\n✅ ${name} installed to ${targetDir}`);
  console.log(`\n💡 Set your API key:`);
  console.log(`   export CRAZYROUTER_API_KEY="your-key-here"`);
  console.log(`   Get one free at https://crazyrouter.com\n`);
}

function uninstallSkill(name) {
  const targetDir = join(SKILLS_DIR, name);
  if (!existsSync(targetDir)) {
    console.error(`\n❌ Skill not installed: ${name}\n`);
    process.exit(1);
  }

  // Use rm -rf equivalent
  import('fs').then(fs => {
    fs.rmSync(targetDir, { recursive: true, force: true });
    console.log(`\n🗑️  Uninstalled ${name}\n`);
  });
}

// Main
switch (command) {
  case 'install':
    if (!skillName) { console.error('\n❌ Specify a skill name.\n'); printHelp(); process.exit(1); }
    await installSkill(skillName);
    break;
  case 'list':
    listSkills();
    break;
  case 'installed':
    listInstalled();
    break;
  case 'uninstall':
  case 'remove':
    if (!skillName) { console.error('\n❌ Specify a skill name.\n'); process.exit(1); }
    uninstallSkill(skillName);
    break;
  default:
    printHelp();
}
