# claude-chat-bridge

Claude Chat(Desktop)과 Claude Code(CLI) 사이의 대화 컨텍스트를 공유하는 브릿지.

Chat에서 아이디에이션한 내용을 Code에서 바로 참고하며 개발할 수 있습니다.

## How it works

```
Claude Chat (Desktop)          Claude Code (CLI)
       │                              │
  "이 대화 저장해줘"                /list-chats
       │                              │
  MCP Server ──── save ────▶ ~/.claude-chat-bridge/sessions/
                                       │
                               /import-chat 1
                                       │
                              컨텍스트에 로드 완료
```

## Setup

### 1. MCP Server (Claude Desktop)

```bash
npx claude-chat-bridge
```

또는 Claude Desktop 설정 파일에 직접 추가:

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

Claude Desktop을 재시작하면 MCP 도구가 연결됩니다.

### 2. Claude Code Plugin

```bash
claude /install-plugin https://github.com/cow-coding/claude-chat-bridge
```

## Usage

### Claude Chat (Desktop)에서 대화 저장

채팅 중 아무 때나:

> "이 대화 저장해줘"

Claude가 `save_conversation` 도구를 호출해 대화를 로컬에 저장합니다.

### Claude Code (CLI)에서 대화 불러오기

```
/chat-bridge:list-chats           # 저장된 세션 목록 (테이블 뷰)
/chat-bridge:import-chat 1        # 1번 세션을 컨텍스트에 로드
/chat-bridge:delete-chat 2        # 2번 세션 삭제
```

## MCP Tools

| Tool | Description |
|------|-------------|
| `save_conversation` | 대화를 로컬에 저장 |
| `list_sessions` | 저장된 세션 목록 조회 |
| `get_session` | 특정 세션 내용 읽기 |
| `delete_session` | 세션 삭제 |

## Storage

세션은 `~/.claude-chat-bridge/sessions/`에 JSON 파일로 저장됩니다.

## License

MIT
