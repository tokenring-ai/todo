import type {TodoItem} from "../schema.ts";

export function formatTodoList(todos: TodoItem[]): string {
  // Format the todo list for the LLM
  return [
    "ID: STATUS CONTENT",
    ...todos.map((todo, _index) => {
      const status =
        todo.status === "in_progress"
          ? "🔄"
          : todo.status === "completed"
            ? "✅"
            : "📝";
      return `${todo.id}: ${status} ${todo.content}`;
    }),
  ].join("\n");
}
