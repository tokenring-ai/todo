import type { TodoItem } from "../schema.ts";

/** Status emoji for display. Includes cancelled (❌); unknown statuses fall back to pending. */
function statusEmoji(status: TodoItem["status"]): string {
  switch (status) {
    case "in_progress":
      return "🔄";
    case "completed":
      return "✅";
    case "cancelled":
      return "❌";
    default:
      return "📝";
  }
}

/**
 * Generate a unique todo id. Prefers `preferredId` when non-empty and not already taken;
 * otherwise generates a UUID.
 */
export function generateUniqueId(todos: readonly { id: string }[], preferredId?: string): string {
  const existing = new Set(todos.map(t => t.id));
  if (preferredId && preferredId.trim() !== "" && !existing.has(preferredId)) {
    return preferredId;
  }
  let id = crypto.randomUUID();
  while (existing.has(id)) {
    id = crypto.randomUUID();
  }
  return id;
}

export function formatTodoList(todos: readonly TodoItem[]): string {
  // Format the todo list for the LLM
  return [
    "ID: STATUS CONTENT",
    ...todos.map(todo => {
      return `${todo.id}: ${statusEmoji(todo.status)} ${todo.content}`;
    }),
  ].join("\n");
}
