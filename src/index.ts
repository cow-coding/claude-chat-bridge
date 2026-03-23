#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import fs from "fs/promises";
import path from "path";
import os from "os";

const SESSIONS_DIR = path.join(os.homedir(), ".claude-chat-bridge", "sessions");

async function ensureSessionsDir() {
  await fs.mkdir(SESSIONS_DIR, { recursive: true });
}

interface SessionMetadata {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
  summary?: string;
}

interface SessionMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

interface SessionData {
  metadata: SessionMetadata;
  messages: SessionMessage[];
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
}

const server = new McpServer({
  name: "claude-chat-bridge",
  version: "1.0.0",
});

// Tool: save_conversation
server.tool(
  "save_conversation",
  "Save the current conversation to local storage so Claude Code can reference it later. Use this when the user wants to share this chat session with Claude Code.",
  {
    title: z.string().describe("A short descriptive title for this conversation session"),
    summary: z.string().optional().describe("A brief summary of what was discussed and decided"),
    messages: z.array(z.object({
      role: z.enum(["user", "assistant"]),
      content: z.string(),
      timestamp: z.string().optional(),
    })).describe("The conversation messages to save"),
  },
  async ({ title, summary, messages }) => {
    await ensureSessionsDir();

    const id = generateId();
    const now = new Date().toISOString();

    const sessionData: SessionData = {
      metadata: {
        id,
        title,
        createdAt: now,
        updatedAt: now,
        messageCount: messages.length,
        summary,
      },
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
        timestamp: m.timestamp || now,
      })),
    };

    const filename = `${id}.json`;
    const filepath = path.join(SESSIONS_DIR, filename);
    await fs.writeFile(filepath, JSON.stringify(sessionData, null, 2), "utf-8");

    return {
      content: [
        {
          type: "text" as const,
          text: `Conversation saved successfully!\n- ID: ${id}\n- Title: ${title}\n- Messages: ${messages.length}\n- Path: ${filepath}\n\nThis session can now be accessed from Claude Code.`,
        },
      ],
    };
  }
);

// Tool: list_sessions
server.tool(
  "list_sessions",
  "List all saved conversation sessions available for Claude Code.",
  {},
  async () => {
    await ensureSessionsDir();

    const files = await fs.readdir(SESSIONS_DIR);
    const jsonFiles = files.filter((f) => f.endsWith(".json"));

    if (jsonFiles.length === 0) {
      return {
        content: [
          {
            type: "text" as const,
            text: "No saved sessions found.",
          },
        ],
      };
    }

    const sessions: SessionMetadata[] = [];
    for (const file of jsonFiles) {
      const filepath = path.join(SESSIONS_DIR, file);
      const raw = await fs.readFile(filepath, "utf-8");
      const data: SessionData = JSON.parse(raw);
      sessions.push(data.metadata);
    }

    sessions.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    const list = sessions
      .map((s) => `- [${s.id}] ${s.title} (${s.messageCount} messages, ${s.createdAt.split("T")[0]})${s.summary ? `\n  Summary: ${s.summary}` : ""}`)
      .join("\n");

    return {
      content: [
        {
          type: "text" as const,
          text: `Saved sessions (${sessions.length}):\n\n${list}`,
        },
      ],
    };
  }
);

// Tool: get_session
server.tool(
  "get_session",
  "Retrieve the full content of a saved conversation session.",
  {
    session_id: z.string().describe("The session ID to retrieve"),
  },
  async ({ session_id }) => {
    await ensureSessionsDir();

    const files = await fs.readdir(SESSIONS_DIR);
    const match = files.find((f) => f.startsWith(session_id));

    if (!match) {
      return {
        content: [
          {
            type: "text" as const,
            text: `Session not found: ${session_id}`,
          },
        ],
      };
    }

    const filepath = path.join(SESSIONS_DIR, match);
    const raw = await fs.readFile(filepath, "utf-8");
    const data: SessionData = JSON.parse(raw);

    const formatted = data.messages
      .map((m) => `**${m.role === "user" ? "User" : "Assistant"}**:\n${m.content}`)
      .join("\n\n---\n\n");

    return {
      content: [
        {
          type: "text" as const,
          text: `# ${data.metadata.title}\n\n${data.metadata.summary ? `> ${data.metadata.summary}\n\n` : ""}${formatted}`,
        },
      ],
    };
  }
);

// Tool: delete_session
server.tool(
  "delete_session",
  "Delete a saved conversation session.",
  {
    session_id: z.string().describe("The session ID to delete"),
  },
  async ({ session_id }) => {
    await ensureSessionsDir();

    const files = await fs.readdir(SESSIONS_DIR);
    const match = files.find((f) => f.startsWith(session_id));

    if (!match) {
      return {
        content: [
          {
            type: "text" as const,
            text: `Session not found: ${session_id}`,
          },
        ],
      };
    }

    const filepath = path.join(SESSIONS_DIR, match);
    await fs.unlink(filepath);

    return {
      content: [
        {
          type: "text" as const,
          text: `Session deleted: ${session_id}`,
        },
      ],
    };
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("claude-chat-bridge MCP server running on stdio");
}

main().catch(console.error);
