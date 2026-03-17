# ⚡ CrazyRouter Skills

Production-tested AI agent skills powered by [Crazyrouter API](https://crazyrouter.com).

## Install

```bash
npx crazyrouter-skills install <skill-name>
```

## Available Skills

| Skill | Description |
|-------|-------------|
| `crazyrouter-chat` | Chat with 627+ AI models (GPT-5, Claude, Gemini, DeepSeek...) |
| `crazyrouter-image-gen` | AI image generation (DALL-E 3, GPT Image, Gemini, Imagen 4) |
| `crazyrouter-tts` | Text-to-speech (OpenAI TTS voices) |
| `crazyrouter-stt` | Speech-to-text transcription (Whisper) |
| `crazyrouter-ocr` | Image-to-text / OCR (GPT-4o, Gemini, Claude) |
| `crazyrouter-translate` | AI translation (multi-model comparison) |
| `crazyrouter-music-gen` | AI music generation (Suno) |
| `crazyrouter-video-gen` | AI video generation (Sora 2, Kling, Veo 3) |

## Pilot Batch Drafts

These are early-stage draft skills created under the Skills Factory publishing workflow. They are not production-published yet, but are being prepared for evaluation and review.

| Skill | Type | Positioning |
|-------|------|-------------|
| `multi-model-response-comparator` | Crazyrouter-native | Compare multiple model outputs for the same prompt and recommend best-fit choices |
| `api-pricing-comparator` | Crazyrouter-enhanced | Turn model/provider pricing data into structured comparison content |
| `serp-outline-extractor` | Ecosystem-neutral | Generate search-informed outlines and content briefs from target queries |

## Quick Setup for Existing OpenClaw Users

To switch an existing OpenClaw install to CrazyRouter as the default API backend:

```bash
curl -fsSL https://raw.githubusercontent.com/xujfcn/crazyrouter-skills/main/scripts/switch_openclaw_to_crazyrouter.sh -o switch_openclaw_to_crazyrouter.sh
bash switch_openclaw_to_crazyrouter.sh --api-key YOUR_CRAZYROUTER_KEY --restart
```

You can also inspect the script directly in this repo:
- `scripts/switch_openclaw_to_crazyrouter.sh`

## Commands

```bash
npx crazyrouter-skills list          # List all available skills
npx crazyrouter-skills installed     # Show installed skills
npx crazyrouter-skills install <name> # Install a skill
npx crazyrouter-skills uninstall <name> # Remove a skill
```

## Requirements

- [Crazyrouter API Key](https://crazyrouter.com) (free to start)
- Set `CRAZYROUTER_API_KEY` environment variable

## Links

- 🛒 [Skills Shop](https://skills.crazyrouter.com)
- 📖 [Documentation](https://skills.crazyrouter.com/docs)
- 🌐 [API Gateway](https://crazyrouter.com)
- 💬 [Telegram](https://t.me/crzrouter)

## License

MIT
