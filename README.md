# claude-chat-bridge

Bridge conversation context between Claude Chat (Desktop) and Claude Code (CLI).

Ideate in Chat, then seamlessly reference that context while developing in Code.

## How it works

```
Claude Chat (Desktop)          Claude Code (CLI)
       │                              │
  "Save this conversation"        /list-chats
       │                              │
  MCP Server ──── save ────▶ ~/.claude-chat-bridge/sessions/
                                       │
                               /import-chat 1
                                       │
                              Context loaded
```

## Setup

### 1. MCP Server (Claude Desktop)

```bash
npx claude-chat-bridge
```

Or add it directly to your Claude Desktop config:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "claude-chat-bridge": {
      "command": "npx",
      "args": ["claude-chat-bridge"]
    }
  }
}
```

Restart Claude Desktop to connect the MCP tools.

### 2. Claude Code Plugin

```bash
claude /install-plugin cow-coding/claude-chat-bridge
```

## Usage

### Save a conversation in Claude Chat (Desktop)

During any chat, just say:

> "Save this conversation"

Claude will call the `save_conversation` tool to store the conversation locally.

### Load a conversation in Claude Code (CLI)

```
/chat-bridge:list-chats           # List saved sessions (table view)
/chat-bridge:import-chat 1        # Load session #1 into context
/chat-bridge:delete-chat 2        # Delete session #2
```

## MCP Tools

| Tool | Description |
|------|-------------|
| `save_conversation` | Save conversation to local storage |
| `list_sessions` | List all saved sessions |
| `get_session` | Retrieve a specific session |
| `delete_session` | Delete a session |

## Storage

Sessions are stored as JSON files in `~/.claude-chat-bridge/sessions/`.

## License

MIT
