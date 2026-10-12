import { writeFile } from "node:fs/promises";
import process from "node:process";

const DEFAULT_MODEL = "gpt-4o-mini";
const API_BASE = process.env.CRAZYROUTER_BASE_URL || "https://crazyrouter.com/v1";


function parseArgs(argv) {
  const args = {
    prompt: null, model: DEFAULT_MODEL, system: null,
    temperature: null, maxTokens: null, output: null,
    listModels: false, json: false,
  };
  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    switch (arg) {
      case "--prompt": case "-p": args.prompt = argv[++i]; break;
      case "--model": case "-m": args.model = argv[++i]; break;
      case "--system": case "-s": args.system = argv[++i]; break;
      case "--temperature": case "-t": args.temperature = parseFloat(argv[++i]); break;
      case "--max-tokens": args.maxTokens = parseInt(argv[++i], 10); break;
      case "--output": case "-o": args.output = argv[++i]; break;
      case "--list-models": args.listModels = true; break;
      case "--json": args.json = true; break;
      case "--help": case "-h":
        console.log(`Usage: main.mjs --prompt "..." [--model gpt-4o-mini] [--system "..."] [--temperature 0.7] [--output file.md]
  --list-models  Fetch models available to your API key
  --json         Raw JSON output
Env: CRAZYROUTER_API_KEY (required)`);
        process.exit(0);
    }
  }
  return args;
}

function getApiKey() {
  const key = process.env.CRAZYROUTER_API_KEY;
  if (!key) {
    console.error("Error: CRAZYROUTER_API_KEY not set. Get your key at https://crazyrouter.com");
    process.exit(1);
  }
  return key;
}

async function chat(args) {
  if (args.listModels) {
    const response = await fetch(`${API_BASE}/models`, { headers: { Authorization: `Bearer ${getApiKey()}` } });
    if (!response.ok) throw new Error(`Model discovery failed: HTTP ${response.status}`);
    const result = await response.json();
    if (!Array.isArray(result.data)) throw new Error('Invalid model discovery response');
    console.log(result.data.map(row => row.id).sort().join('\n'));
    console.error('The model catalogue includes other protocols; select a Chat Completions-compatible model.');
    return;
  }
  if (!args.prompt) { console.error("Error: --prompt is required"); process.exit(1); }
  const apiKey = getApiKey();
  const messages = [];
  if (args.system) messages.push({ role: "system", content: args.system });
  messages.push({ role: "user", content: args.prompt });
  const body = { model: args.model, messages };
  if (args.temperature !== null) body.temperature = args.temperature;
  if (args.maxTokens !== null) body.max_tokens = args.maxTokens;
  console.error(`Model: ${args.model}`);
  const response = await fetch(`${API_BASE}/chat/completions`, {
    method: "POST",
    headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    console.error(`API Error: HTTP ${response.status}`);
    process.exit(1);
  }
  const result = await response.json();
  if (args.json) { console.log(JSON.stringify(result, null, 2)); return; }
  const content = result.choices?.[0]?.message?.content ?? "";
  const usage = result.usage;
  if (args.output) {
    await writeFile(args.output, content);
    console.error(`Saved to ${args.output}`);
  } else {
    console.log(content);
  }
  if (usage) {
    console.error(`\n${result.model || args.model} | ${usage.prompt_tokens}->${usage.completion_tokens} (${usage.total_tokens} tokens)`);
  }
}

const args = parseArgs(process.argv);
chat(args).catch((err) => { console.error(`Error: ${process.env.CRAZYROUTER_API_KEY ? err.message.split(process.env.CRAZYROUTER_API_KEY).join("[REDACTED]") : err.message}`); process.exit(1); });
