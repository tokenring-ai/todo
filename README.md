# @tokenring-ai/todo

Todo list management for TokenRing agents. Provides tools and commands for creating, managing, and tracking todo items
with priority levels.

## Overview

The `@tokenring-ai/todo` package provides a complete todo list management system for TokenRing agents. It supports:

- Adding todos with titles, descriptions, and priority levels
- Completing and deleting todos
- Listing todos with filtering by completion status
- Persistent state storage per agent
- Clear completed todos functionality

## Installation

```bash
bun add @tokenring-ai/todo
```

## Usage

### Plugin Installation

Add the plugin to your TokenRing app configuration:

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
        maxItems: 100,
      },
    },
  },
});
```

### Configuration

#### Service Configuration

```typescript
{
  todo: {
    agentDefaults: {
      enabled: boolean;      // Enable/disable the service
      maxItems: number;      // Maximum number of todos to keep (default: 100)
    }
  }
}
```

## API Reference

### TodoService

The main service for todo management.

#### Methods

- `addTodo(agent, title, description?, priority?)`: Add a new todo item
- `completeTodo(agent, id)`: Mark a todo as completed
- `deleteTodo(agent, id)`: Delete a todo item
- `getTodos(agent, completed?)`: Get all todos, optionally filtered
- `getIncompleteTodos(agent)`: Get incomplete todos
- `getCompletedTodos(agent)`: Get completed todos
- `clearCompleted(agent)`: Remove all completed todos
- `updateTodo(agent, id, updates)`: Update todo properties

## Tools

### `todo_manage`

Manage todo items with various operations.

**Operations:**

- `add`: Add a new todo (requires `title`, optional `description` and `priority`)
- `complete`: Mark todo as completed (requires `todoId`)
- `delete`: Delete a todo (requires `todoId`)
- `list`: List todos (optional `completed` filter)
- `update`: Update todo properties (requires `todoId`, optional `title`, `description`, `priority`)
- `clearCompleted`: Remove all completed todos

**Example:**

```json
{
  "operation": "add",
  "title": "Complete project proposal",
  "description": "Write and submit the Q4 proposal",
  "priority": "high"
}
```

## Commands

### `/todo list`

List all todo items with their status and priority.

```
/todo list
```

**Output:**

```
## Incomplete Todos
  [ ] (H) Complete project proposal
  [ ] (M) Review pull requests

## Completed Todos
  [x] Set up development environment
```

### `/todo add <title>`

Add a new todo item.

```
/todo add Complete project proposal
```

### `/todo complete <todoId>`

Mark a todo as completed.

```
/todo complete 550e8400-e29b-41d4-a716-446655440000
```

### `/todo delete <todoId>`

Delete a todo item.

```
/todo delete 550e8400-e29b-41d4-a716-446655440000
```

## State Management

Todos are stored in the `TodoState` state slice, which persists across agent sessions. The state includes:

- `items`: Array of todo items
- `nextId`: Counter for generating unique IDs

## Testing

```bash
# Run all tests
bun run test

# Watch mode
bun run test:watch

# With coverage
bun run test --coverage
```

## License

MIT
