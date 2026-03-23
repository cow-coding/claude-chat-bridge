---
name: import-chat
description: Import a saved Claude Chat conversation into the current Claude Code context. Use when the user wants to reference or continue work from a Claude Chat session.
user-invocable: true
allowed-tools: Bash, Read, Glob
argument-hint: "<number from /list-chats>"
---

Import a Claude Chat session into context so you can reference it during development.

Sessions are stored at `~/.claude-chat-bridge/sessions/` as JSON files.

## Step 1: Determine which session to load

**The user MUST provide a number argument (from `/chat-bridge:list-chats` table).**

- If `$ARGUMENTS` is empty, tell the user: "Run `/chat-bridge:list-chats` first, then `/chat-bridge:import-chat <number>`"
- If `$ARGUMENTS` is a number (e.g. `1`, `2`), read all session files, sort by date (most recent first), and pick the Nth session.
- If `$ARGUMENTS` looks like a session ID, find and read the matching file directly.

## Step 2: Load the session silently

Read the full JSON file. The conversation messages are now part of your internal context — you can reference them when answering questions or doing development work.

**DO NOT print the full conversation messages to the user.**

Only show a brief confirmation:
- Title
- Summary (if available)
- Message count and date
- A short note that the context is loaded

Example output:
```
Chat session loaded:
- Title: AX 인프라 오케스트레이션
- Summary: AI 서비스 생존 판정 시스템 아이디어 구체화...
- 8 messages (2026-03-23)

이 대화 맥락을 참고할 수 있습니다. 무엇을 하시겠어요?
```

## Important
- The session JSON has `metadata` (id, title, summary, messageCount, createdAt) and `messages` (array of {role, content, timestamp})
- NEVER dump the full conversation to the terminal. Keep it in your internal context only.
- When the user asks questions or starts development, use the loaded conversation as background context.
