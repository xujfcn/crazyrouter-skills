---
name: crazyrouter-video-gen
description: Retired legacy video helper; use the documented native task API.
---

# Legacy video skill retired

Updated 2026-10-12. The previous script sent video requests to Chat Completions, which is the wrong protocol. It has been removed from the installer registry. Existing installations should uninstall this skill or replace their script with this fail-fast version.

Do not call `/v1/chat/completions` to generate video. Follow the [API documentation](https://docs.crazyrouter.com) for model-specific submission, task status and result retrieval. Submission success alone does not mean a completed file exists. No API request is made by this retired script.
