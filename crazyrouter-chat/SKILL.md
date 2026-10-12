---
name: crazyrouter-chat
description: Text chat through Crazyrouter Chat Completions, with authenticated model discovery.
---

# Chat through Crazyrouter

Set `CRAZYROUTER_API_KEY`. The default model is `gpt-4o-mini`.

```bash
node ${SKILL_DIR}/scripts/main.mjs --list-models
node ${SKILL_DIR}/scripts/main.mjs --prompt "Explain API gateways" --model gpt-4o-mini
```

Optional flags: `--system`, `--temperature`, `--max-tokens`, `--output`, `--json`. Only send optional sampling/token parameters accepted by the selected model. Model discovery requires authentication and does not imply every listed model supports Chat Completions. Use native task APIs for video/music and native provider APIs when required.

[Current models](https://crazyrouter.com/en/models) · [Current prices](https://crazyrouter.com/en/pricing)
