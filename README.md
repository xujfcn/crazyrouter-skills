# Crazyrouter Skills

Updated 2026-10-12. Node.js 22+ command-line helpers for supported Crazyrouter APIs.

```bash
npx crazyrouter-skills@1.0.1 list
npx crazyrouter-skills@1.0.1 install crazyrouter-chat
npx crazyrouter-skills@1.0.1 install crazyrouter-image-gen
```

Set `CRAZYROUTER_API_KEY` locally. The installer places files in `~/.openclaw/skills/` and currently downloads the repository's main-branch skill files.

| Skill | Scope |
|---|---|
| crazyrouter-chat | Text Chat Completions and authenticated model discovery |
| crazyrouter-image-gen | One synchronous image, default gpt-image-2; URL/base64 output |
| crazyrouter-tts | OpenAI-compatible text-to-speech helper |
| crazyrouter-stt | OpenAI-compatible transcription helper |
| crazyrouter-ocr | Vision-based image understanding helper |
| crazyrouter-translate | Text translation helper |

Model and endpoint availability varies. Audio, vision and translation helpers remain available but were not comprehensively retested in this release. This is not a claim that every catalogue model or media operation is implemented.

## Retired video and music helpers

The old video/music scripts incorrectly sent task requests to Chat Completions. They are no longer installable through the registry; the repository scripts now stop with an explanation and make no API requests. Existing installations are not updated automatically:

```bash
npx crazyrouter-skills@1.0.1 uninstall crazyrouter-video-gen
npx crazyrouter-skills@1.0.1 uninstall crazyrouter-music-gen
```

Use the [native task API documentation](https://docs.crazyrouter.com) for submission and status polling. Reinstall an existing chat/image skill to receive the revised script.

## Billing and credentials

Live calls use your own key and incur the model's normal charges. Keys are sent to the configured API server for authentication. Check [current prices](https://crazyrouter.com/en/pricing) and [model capabilities](https://crazyrouter.com/en/models); no fixed model count or free-credit promise applies.

MIT. [Source](https://github.com/xujfcn/crazyrouter-skills) · [API documentation](https://docs.crazyrouter.com)
