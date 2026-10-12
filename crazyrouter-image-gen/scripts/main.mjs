import { writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

export async function generateImage(args, options = {}) {
  if (!args.prompt || !args.output) throw new Error('--prompt and --output (or --image) are required');
  if (args.n !== undefined && args.n !== 1) throw new Error('Only n=1 is supported');
  const key = options.apiKey ?? process.env.CRAZYROUTER_API_KEY;
  if (!key) throw new Error('CRAZYROUTER_API_KEY is required');
  const api = (options.baseURL ?? process.env.CRAZYROUTER_BASE_URL ?? 'https://crazyrouter.com/v1').replace(/\/$/, '');
  const url = new URL(api);
  if (url.search || url.hash || !url.pathname.endsWith('/v1')) throw new Error('Base URL must end with /v1 without query or fragment');
  const request = options.fetch ?? fetch;
  const save = options.writeFile ?? writeFile;
  const model = args.model ?? 'gpt-image-2';
  const metadata = await request(new URL('/api/pricing', url), { signal: AbortSignal.timeout(30000) });
  if (!metadata.ok) throw new Error(`Model metadata failed: HTTP ${metadata.status}`);
  const catalogue = await metadata.json();
  const entry = catalogue.data?.find(row => row.model_name === model);
  const endpoints = entry?.public_endpoint_types ?? entry?.supported_endpoint_types ?? [];
  if (!endpoints.includes('image-generation')) throw new Error('Choose a listed model supporting /v1/images/generations; native task models are not supported');
  const body = { model, prompt: args.prompt, n: 1 };
  if (args.size) body.size = args.size;
  const response = await request(`${api}/images/generations`, {
    method: 'POST', headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body), signal: AbortSignal.timeout(240000),
  });
  if (!response.ok) throw new Error(`Image API failed: HTTP ${response.status}`);
  const result = await response.json();
  const item = result.data?.[0];
  let bytes;
  if (item?.b64_json) bytes = Buffer.from(item.b64_json, 'base64');
  else if (item?.url) {
    const imageURL = new URL(item.url);
    if (!['http:', 'https:'].includes(imageURL.protocol)) throw new Error('Unsupported image URL protocol');
    const download = await request(imageURL, { signal: AbortSignal.timeout(60000) });
    if (!download.ok) throw new Error(`Image download failed: HTTP ${download.status}`);
    bytes = Buffer.from(await download.arrayBuffer());
  }
  if (!bytes?.length) throw new Error('Image API returned no image bytes');
  await save(args.output, bytes);
  return { output: args.output, bytes: bytes.length, model };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const args = {};
  const map = { '--prompt': 'prompt', '-p': 'prompt', '--output': 'output', '-o': 'output', '--image': 'output', '--model': 'model', '-m': 'model', '--size': 'size', '--n': 'n' };
  try {
    for (let i = 2; i < process.argv.length; i++) {
      const flag = process.argv[i];
      if (flag === '--help' || flag === '-h') {
        console.log('Usage: main.mjs --prompt "..." --output image.png [--model gpt-image-2] [--size 1024x1024]');
        process.exit(0);
      }
      if (!map[flag] || !process.argv[i + 1] || process.argv[i + 1].startsWith('--')) throw new Error(`Invalid argument: ${flag}`);
      args[map[flag]] = flag === '--n' ? Number(process.argv[++i]) : process.argv[++i];
    }
    console.log(JSON.stringify(await generateImage(args)));
  } catch (error) {
    const key = process.env.CRAZYROUTER_API_KEY;
    console.error(key ? error.message.split(key).join('[REDACTED]') : error.message);
    process.exitCode = 1;
  }
}
