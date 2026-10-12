---
name: crazyrouter-image-gen
description: Generate one synchronous image through Crazyrouter Images API, default gpt-image-2.
---

# Synchronous image generation

Requires Node.js 22+ and `CRAZYROUTER_API_KEY`. Set an exact model ID listed for the Images endpoint; native Midjourney/video task models are not supported here.

```bash
node ${SKILL_DIR}/scripts/main.mjs --prompt "A blue circle on white" --output image.png
```

Options: `--model` (default `gpt-image-2`), `--size` (optional, model-specific), `--n 1`. `--image` is a backward-compatible alias for the output filename, not an input image. Image editing and multiple-image output are not implemented by this helper.

The helper checks public endpoint metadata, submits one billable request, and handles either base64 or URL output. Empty data, failed downloads and unsupported protocols fail with a nonzero exit code. API keys are sent only to the configured API endpoint, not to public metadata or image download URLs.

[Current prices](https://crazyrouter.com/en/pricing) · [API documentation](https://docs.crazyrouter.com)
