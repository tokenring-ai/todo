# @tokenring-ai/todo

Persistent task management for agents to track priorities and project progress.

## Overview

The `@tokenring-ai/todo` package provides a comprehensive todo list management system for TokenRing agents. It enables
agents to create, track, and manage tasks with status tracking and persistent state storage.

### Key Features

- **Task Management**: Create, update, complete, and delete todo items
- **Status Tracking**: Track tasks with `pending`, `in_progress`, and `completed` statuses
- **Persistent State**: Todos persist across agent sessions via state storage
- **Agent Context**: Automatic todo list context injection into chat sessions
- **Completion Hooks**: Automatic reminders for incomplete tasks after agent responses
- **Parent-Child Transfer**: Optional todo copying from parent to child agents

## Installation

```bash
bun add @tokenring-ai/todo
```

## Tools

### `todo`

Manages todo items for task organization and progress tracking.

| Property                      | Description |
|-------------------------------|-------------|
| **Name**                      | `todo`      |
| **Display Name**              | `Todo/todo` |
| **Required Context Handlers** | `todo-list` |

#### Description

The todo tool manages a list of items for the current task. This tool should proactively be used to organize complex
tasks, track progress, and to convey the current task plan to the user.

**Use this tool for:**

- Non-trivial and complex tasks - Tasks that require careful planning or multiple operations
- Tasks with multiple concerns - Tasks that involve multiple areas of expertise or systems
- To capture and expand upon the most important requirements of the user and to complete the task
- So that you do not miss any critical execution details

**Before you start working on a task, mark it as `in_progress` BEFORE beginning work**

**After completing a task, mark it as `completed`, and add any new follow-up tasks discovered during implementation**

**Skip using this tool when:**

- The user's prompt is purely conversational
- The user has given a direct, straightforward, single concern, trivial task

#### Input Schema

```typescript
{
  todos: Array<{
    id: string;           // Unique identifier for the task
    content: string;      // The task description - what needs to be done
    status: "pending" | "in_progress" | "completed";  // Current status of the task
  }>;
}
```

#### Example Usage

```json
{
  "todos": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "content": "Implement authentication flow",
      "status": "in_progress"
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "content": "Write unit tests",
      "status": "pending"
    }
  ]
}
```

#### Output

Returns the updated todo list in a formatted string showing ID, status emoji, and content.

## Context Handlers

### `todo-list`

Injects the current todo list into the agent's chat context.

**Purpose**: Provides the agent with visibility into current tasks and progress.

**Context Format**:

```text
/* Current todo list */
ID: STATUS CONTENT
550e8400-e29b-41d4-a716-446655440000: 📝 Implement authentication flow
550e8400-e29b-41d4-a716-446655440001: 🔄 Write unit tests
```

**Status Emojis**:

- `📝` - Pending
- `🔄` - In Progress
- `✅` - Completed

## Hooks

### `todoCompletionCheck`

Automatically checks for incomplete todos after successful agent responses.

| Property         | Value                                                                                               |
|------------------|-----------------------------------------------------------------------------------------------------|
| **Name**         | `todoCompletionCheck`                                                                               |
| **Display Name** | `Todo/Completion Check`                                                                             |
| **Description**  | Checks if todos are complete at the end of a successful chat and prompts to complete remaining work |

#### Hook Subscription

- **Hook**: `AfterAgentInputSuccess`
- **Trigger**: After successful agent input completion

#### Behavior

1. Retrieves current todo state from the agent
2. Filters for incomplete todos (`pending` or `in_progress` status)
3. If incomplete todos exist:

- Counts pending and in-progress tasks
- Formats a reminder message with task details
- Triggers agent input with the reminder

4. If all todos are complete: No action taken

#### Reminder Message Format

```text
📋 **N remaining task(s)** detected:
X pending, Y in progress

Please complete the remaining tasks on your todo list.

- 📝 id: Task content
- 🔄 id: Task content
```

## Configuration

### Service Configuration

The plugin accepts configuration via the `todo` key in your app configuration:

```yaml
todo:
  agentDefaults:
    copyToChild: false      # Copy todos from parent to child agents
    initialItems: []        # Initial todo items for new agents
```

### Configuration Schema

```typescript
{
  todo: {
    agentDefaults: {
      copyToChild: boolean;   // Enable/disable copying todos to child agents (default: false)
      initialItems: Array<{
        id: string;
        content: string;
        status: "pending" | "in_progress" | "completed";
      }>;  // Initial todos for new agents (default: [])
    };
  };
}
```

### Example Configuration

```typescript
import todoPlugin from "@tokenring-ai/todo/plugin";

const app = new TokenRingApp({
  plugins: [
    todoPlugin,
    // ... other plugins
  ],
  config: {
    todo: {
      agentDefaults: {
        enabled: true,
        copyToChild: true,
        initialItems: [
          {
            id: "1",
            content: "Set up project structure",
            status: "completed"
          },
          {
            id: "2",
            content: "Implement core features",
            status: "pending"
          }
        ]
      }
    }
  }
});
```

## API Reference

### TodoService

The main service for todo management.

#### TodoService Properties

| Property      | Type            | Description           |
|---------------|-----------------|-----------------------|
| `name`        | `"TodoService"` | Service identifier    |
| `description` | `string`        | Service description   |
| `options`     | `TodoConfig`    | Service configuration |

#### TodoService Methods

##### `attach(agent: Agent)`

Attaches the service to an agent and initializes state.

**Parameters:**

- `agent`: The agent to attach to

**Behavior:**

1. Merges service defaults with agent-specific configuration
2. Initializes `TodoState` with the merged configuration
3. Sets up todo persistence for the agent

### TodoState

State slice for managing todo persistence.

#### TodoState Properties

| Property        | Type              | Description           |
|-----------------|-------------------|-----------------------|
| `todos`         | `TodoItem[]`      | Array of todo items   |
| `initialConfig` | `TodoAgentConfig` | Initial configuration |

#### TodoState Methods

##### `transferStateFromParent(parentAgent: Agent)`

Transfers todos from parent agent if `copyToChild` is enabled.

##### `serialize()`

Serializes todos for persistence.

##### `deserialize(data)`

Deserializes todos from persisted data.

##### `show()`

Returns a summary of todo counts:

```text
Total: N
Pending: X
In Progress: Y
Completed: Z
```

### Schema Exports

#### `TodoStatusSchema`

```typescript
z.enum(["pending", "in_progress", "completed"]);
```

#### `TodoItemSchema`

```typescript
z.object({
  id: z.string(),
  content: z.string(),
  status: TodoStatusSchema,
});
```

#### `TodoAgentConfigSchema`

```typescript
z.object({
  copyToChild: z.boolean().optional(),
  initialItems: z.array(TodoItemSchema).optional(),
}).prefault({});
```

#### `TodoConfigSchema`

```typescript
z.object({
  agentDefaults: z.object({
    copyToChild: z.boolean().default(false),
    initialItems: z.array(TodoItemSchema).default([]),
  }).prefault({}),
}).prefault({});
```

## Testing

```bash
# Run all tests
bun run test

# Watch mode
bun run test:watch

# With coverage
bun run test --coverage
```

### Test Coverage

The package includes comprehensive tests for the `todoCompletionCheck` hook covering:

- Hook configuration validation
- Empty todo list handling
- All todos completed scenario
- Pending todos notification
- In-progress todos notification
- Multiple incomplete todos
- Message formatting with emojis
- Edge cases

## License

MIT License - see LICENSE file for details.
