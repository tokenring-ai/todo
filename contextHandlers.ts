import type { ContextHandler } from "@tokenring-ai/chat/schema";
import todoContext from "./contextHandlers/todo.ts";

export default {
  "todo-list": todoContext,
} as Record<string, ContextHandler>;
