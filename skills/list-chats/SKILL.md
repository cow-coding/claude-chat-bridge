---
name: list-chats
description: List saved conversation sessions from Claude Chat. Use when the user wants to see what chat sessions are available to import.
user-invocable: true
allowed-tools: Bash, Read, Glob
---

List all saved Claude Chat sessions from `~/.claude-chat-bridge/sessions/`.

## Instructions

1. Read all JSON files from `~/.claude-chat-bridge/sessions/`
2. Extract `metadata` from each file (id, title, summary, messageCount, createdAt)
3. Sort by date (most recent first)
4. If no sessions exist, tell the user they can save conversations from Claude Desktop using the chat-bridge MCP server.

## Output format

**IMPORTANT: You MUST collect ALL session data first, then output a SINGLE markdown table with all rows. Do NOT output anything before the table. Do NOT output partial results or empty tables.**

Wait until all files are read, then output exactly one table in this format:

| # | Title | Date | Messages | Summary |
|---|-------|------|----------|---------|
| 1 | Session title here | 2026-03-23 | 8 | Brief summary... |
| 2 | Another session | 2026-03-22 | 5 | Another summary... |

- Truncate summary to 50 characters max, append "..." if truncated
- Date format: YYYY-MM-DD
- After the table, add a tip: `Use /chat-bridge:import-chat <#> to load a session, /chat-bridge:delete-chat <#> to delete.`

**Respond in the same language the user used when invoking this skill.** For example, if the user typed the command in Korean, write the "no sessions" message and the tip line in Korean. If in English, write them in English.
