# @tokenring-ai/todo

Persistent task management for agents to track priorities and project progress.

## Overview

The `@tokenring-ai/todo` package provides a comprehensive todo list management system for TokenRing agents. It enables
agents to create, track, and manage tasks with status tracking and persistent state storage.

### Key Features

- **Task Management**: Create, update, complete, and delete todo items
- **Status Tracking**: Track tasks with `pending`, `in_progress`, `completed`, and `cancelled` statuses
- **Persistent State**: Todos persist across agent sessions via state storage
- **Agent Context**: Automatic todo list context injection into chat sessions
- **Completion Hooks**: Automatic reminders for incomplete tasks after agent responses
- **Parent-Child Transfer**: Optional todo copying from parent to child agents
- **RPC Endpoints**: Query and stream todo state via RPC interface

## Installation

```bash
bun add @tokenring-ai/todo
```

## Tools

### `todo`

Manages todo items for task organization and progress tracking.

| Property                      | Description     |
|-------------------------------|-----------------|
| **Name**                      | `todo`          |
| **Display Name**              | `Todo/todo`     |
| **Required Context Handlers** | `todo-list`     |

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
    content: string;      // The task description - what needs to be done (min length: 1)
    status: "pending" | "in_progress" | "completed" | "cancelled";  // Current status of the task
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

Returns a `TokenRingToolResult` with the following properties:

| Property  | Type     | Description                                              |
|-----------|----------|----------------------------------------------------------|
| `message` | `string` | Summary message with new and updated item counts         |
| `actions` | `string[]` | Array of action descriptions for each update or new item |
| `result`  | `string` | Formatted todo list string                               |

The tool also updates the agent's current activity to reflect the first
`in_progress` or `pending` task.

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

- `📝` - Pending (also used for `cancelled`)
- `🔄` - In Progress
- `✅` - Completed

## Hooks

### `todoCompletionCheck` Hook

Automatically checks for incomplete todos after successful agent responses.

| Property         | Value                                                                        |
|------------------|------------------------------------------------------------------------------|
| **Name**         | `todoCompletionCheck`                                                        |
| **Display Name** | `Todo/Completion Check`                                                      |
| **Description**  | Checks if todos are complete at the end of a successful chat and prompts to complete remaining work |

#### Hook Subscription

- **Hook**: `AfterAgentInputSuccess`
- **Trigger**: After successful agent input completion
- **Executed By**: `AgentLifecycleService`

#### Behavior

1. Retrieves current todo state from the agent
2. Returns early if no todos exist
3. Filters for incomplete todos (`pending` or `in_progress` status)
4. Returns early if all todos are completed or cancelled
5. If incomplete todos exist, triggers agent input with an automated system message

#### Reminder Message Format

```text
**AUTOMATED SYSTEM MESSAGE**
 **N tasks were left on the TODO list that are still marked as incomplete.
 - id-1: Task content
 - id-2: Task content

 You need to do one of the following two things for each of the pending or in progress tasks to resolve this:
 1. Complete the task and mark it as done.
 2. Mark the task as cancelled if you determined that the task is no longer relevant or completable.

 It is OK or even preferable to mark a task as cancelled if you determined that the task is no longer relevant, not completable, is unsafe, or would require further user feedback

 This message will repeat until all tasks are completed or cancelled.
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
        status: "pending" | "in_progress" | "completed" | "cancelled";
      }>;  // Initial todos for new agents (default: [])
    };
  };
}
```

### Schema Metadata

The configuration schema includes metadata annotations for UI integration:

| Field         | Label          | Description                                                        | Advanced |
|---------------|----------------|--------------------------------------------------------------------|----------|
| `agentDefaults` | `Agent Defaults` | -                                                                  | -        |
| `copyToChild` | -              | Copy the parent agent's todo list to newly spawned sub-agents      | -        |
| `initialItems`| -              | Todo items pre-populated for new agents                            | Yes      |

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

| Property      | Type            | Description                                    |
|---------------|-----------------|------------------------------------------------|
| `name`        | `"TodoService"` | Service identifier                             |
| `description` | `string`        | Manages todo lists for agents with add, complete, delete, and list operations |
| `options`     | `TodoConfig`    | Service configuration                          |

#### TodoService Methods

##### `attach(agent: Agent)`

Attaches the service to an agent and initializes state.

**Parameters:**

- `agent`: The agent to attach to

**Behavior:**

1. Merges service defaults with agent-specific configuration using `deepClone`
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

Transfers todos from parent agent if `copyToChild` is enabled in the parent's
configuration. Only copies if the child has no value set.

##### `serialize()`

Serializes todos for persistence.

##### `deserialize(data)`

Deserializes todos from persisted data using `splice` to replace the array contents.

##### `show()`

Returns a summary of todo counts:

```text
Total: N
Pending: X
In Progress: Y
Completed: Z
```

### RPC Endpoints

The plugin registers an RPC endpoint at `/rpc/todo` with the following methods:

| Method       | Type     | Description                        |
|--------------|----------|------------------------------------|
| `getTodos`   | `query`  | Retrieve the current todo list for an agent |
| `streamTodos`| `stream` | Stream todo list updates for an agent  |

#### `getTodos`

Retrieves the current todo list for a specified agent.

**Input:**

```typescript
{
  agentId: string;
}
```

**Result (Discriminated union on `status`):**

| Status            | Fields                    | Description              |
|-------------------|---------------------------|--------------------------|
| `success`         | `todos: TodoItem[]`       | Todo list retrieved      |
| `agentNotFound`   | -                         | Agent does not exist     |

#### `streamTodos`

Streams todo list updates for a specified agent using an async generator.

**Input:**

```typescript
{
  agentId: string;
}
```

**Result (Discriminated union on `status`):**

| Status            | Fields                    | Description              |
|-------------------|---------------------------|--------------------------|
| `success`         | `todos: TodoItem[]`       | Todo list data chunk     |
| `agentNotFound`   | -                         | Agent does not exist     |

### Schema Exports

#### `TodoStatusSchema`

```typescript
z.enum(["pending", "in_progress", "completed", "cancelled"]);
```

#### `TodoItemSchema`

```typescript
z.object({
  id: z.string(),
  content: z.string(),
  status: TodoStatusSchema,
});
```

#### `TodoAgentSchema`

```typescript
z.object({
  copyToChild: z.boolean().exactOptional(),
  initialItems: z.array(TodoItemSchema).exactOptional(),
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

### Utility Functions

#### `formatTodoList(todos: TodoItem[]): string`

**Location**: `util/todo.ts`

Formats a todo list for display to the LLM. Returns a string with a header
row followed by one line per todo item, using status emojis.

**Example:**

```typescript
import { formatTodoList } from "@tokenring-ai/todo/util/todo";

const formatted = formatTodoList([
  { id: "1", content: "Task 1", status: "pending" },
  { id: "2", content: "Task 2", status: "in_progress" },
]);

// Output:
// "ID: STATUS CONTENT\n1: 📝 Task 1\n2: 🔄 Task 2"
```

### Lifecycle Hooks

#### `todoCompletionCheck` Hook Subscription

**Location**: `hooks/todoCompletionCheck.ts`

A hook subscription that checks for incomplete todos after successful agent
input.

**Constructor**: None (exported as a default object)

**Properties:**

| Property      | Value                                                                        |
|---------------|------------------------------------------------------------------------------|
| `name`        | `todoCompletionCheck`                                                        |
| `displayName` | `Todo/Completion Check`                                                      |
| `description` | Checks if todos are complete at the end of a successful chat and prompts to complete remaining work |
| `callbacks`   | Array of `HookCallback` instances                                            |

**Trigger**: Executed by `AgentLifecycleService` when `AfterAgentInputSuccess`
hook fires.

**Callback Parameters:**

- `_data`: `AfterAgentInputSuccess` instance (unused)
- `agent`: The agent instance

### State Management

The `TodoState` class maintains persistent state per agent:

- **State Properties**: `todos` (array of `TodoItem`)
- **Serialization**: Implemented via `serialize()` and `deserialize()` methods
- **State Inheritance**: `transferStateFromParent` copies todos from parent agent
  when `copyToChild` is enabled in the parent's configuration
- **Initialization**: State is initialized with `initialItems` from configuration

## Testing

```bash
# Run all tests
bun run test

# Watch mode
bun run test:watch

# With coverage
bun run test --coverage
```

### Test Files

| File                                      | Description                              |
|-------------------------------------------|------------------------------------------|
| `hooks/todoCompletionCheck.test.ts`       | Tests for the todo completion check hook |

### Test Coverage

The package includes comprehensive tests for the `todoCompletionCheck` hook covering:

- Hook configuration validation
- Empty todo list handling
- All todos completed scenario
- Pending todos notification
- In-progress todos notification
- Multiple incomplete todos
- Message formatting
- Edge cases

## License

MIT License - see LICENSE file for details.
