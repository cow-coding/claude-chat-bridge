---
name: delete-chat
description: Delete a saved Claude Chat session. Use when the user wants to remove a saved conversation.
user-invocable: true
allowed-tools: Bash, Read, Glob, AskUserQuestion
argument-hint: "<number from /list-chats>"
---

Delete a saved Claude Chat session from `~/.claude-chat-bridge/sessions/`.

## Step 1: Determine which session to delete

**The user MUST provide a number argument (from `/chat-bridge:list-chats` table).**

- If `$ARGUMENTS` is empty, tell the user: "Run `/chat-bridge:list-chats` first, then `/chat-bridge:delete-chat <number>`"
- If `$ARGUMENTS` is a number (e.g. `1`, `2`), read all session files, sort by date (most recent first), and pick the Nth session.
- If `$ARGUMENTS` looks like a session ID, find the matching file directly.

## Step 2: Confirm before deleting

Use AskUserQuestion to confirm:
- question: "Delete this session?"
- Show the session title and date in the description
- Options: "Yes, delete" / "Cancel"

## Step 3: Delete

If confirmed, delete the file using Bash `rm`.

Show a brief confirmation:
```
Deleted: <title> (2026-03-23)
```
