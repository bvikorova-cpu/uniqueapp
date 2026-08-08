---
name: AI output formatting
description: AI-generated text must never render raw markdown (###, **, ---) — always use AiMarkdown
type: preference
---

# AI output formatting

- NEVER render AI text with plain `whitespace-pre-wrap` — raw `###`, `**`, `---` must never reach the user.
- Always use `src/components/common/AiMarkdown.tsx` (react-markdown + remark-gfm + typography classes) for any AI response, chat message, analysis or report.
- Headings, bold, lists and dividers must appear as real styled typography, readable on mobile (360px).
