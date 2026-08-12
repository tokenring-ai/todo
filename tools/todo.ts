import type { Agent } from "@tokenring-ai/agent";
import type { TokenRingToolDefinition, TokenRingToolResult } from "@tokenring-ai/chat/schema";
import { z } from "zod";
import { TodoStatusSchema } from "../schema.ts";
import { TodoState } from "../state/todoState.ts";
import { formatTodoList, generateUniqueId } from "../util/todo.ts";

const name = "todo";
const displayName = "Todo/todo";

/**
 * Creates and manages a structured task list for the current coding session.
 * This helps track progress, organize complex tasks, and demonstrate thoroughness to the user.
 */
export function execute({ todos }: z.output<typeof inputSchema>, agent: Agent): TokenRingToolResult {
  const newTexts: string[] = [];
  const updateTexts: string[] = [];

  // Get the current todo list from the agent's state
  const updatedTodos = agent.mutateState(TodoState, state => {
    // Update todos based on the input
    for (const todo of todos) {
      const existingTodo = state.todos.find(t => t.id === todo.id);
      if (existingTodo) {
        let updated = false;
        let updateText = `Update ${existingTodo.content} `;
        if (todo.status !== existingTodo.status) {
          updated = true;
          updateText += `from ${existingTodo.status} to ${todo.status}`;
          existingTodo.status = todo.status;
        }
        if (todo.content !== existingTodo.content) {
          updated = true;
          updateText += `> ${todo.content}`;
          existingTodo.content = todo.content;
        }
        if (updated) updateTexts.push(updateText);
      } else {
        // Add new todo with a guaranteed-unique id (prefers caller id when free)
        const newTodo = { ...todo, id: generateUniqueId(state.todos, todo.id) };
        state.todos.push(newTodo);
        newTexts.push(`Added ${newTodo.id} ${newTodo.content}`);
      }
    }
    return state.todos;
  });

  if (updatedTodos.length > 0) {
    const currentTask = updatedTodos.find(t => t.status === "in_progress") ?? updatedTodos.find(t => t.status === "pending");

    if (currentTask) {
      agent.setCurrentActivity(currentTask.content);
    }
  }

  const todoList = formatTodoList(updatedTodos);

  return {
    message: `**Todo** Updated todo list (${newTexts.length} new, ${updateTexts.length} existing)`,
    actions: [...updateTexts, ...newTexts],
    result: `Todo list updated! Current Todo list:\n${todoList}`,
  };
}

const description =
  "The todo tool manages a list of items for the current task. This tool should proactively be used to organize complex tasks, track progress, and to convey the current task plan to the user.\n\n" +
  "Use this tool for:\n" +
  "- Non-trivial and complex tasks - Tasks that require careful planning or multiple operations\n" +
  "- Tasks with multiple concerns - Tasks that involve multiple areas of expertise or systems\n" +
  "- To capture and expand upon the most important requirements of the user and to complete the task\n" +
  " -So that you do not miss any critical execution details\n" +
  "Before you start working on a task, mark it as in_progress BEFORE beginning work\n" +
  "After completing a task, mark it as completed, and add any new follow-up tasks discovered during implementation\n\n" +
  "Skip using this tool when the users prompt is purely conversational, or the user has give a direct, straightforward, single concern, trivial task\n";

const inputSchema = z.object({
  todos: z
    .array(
      z.object({
        id: z.string().describe("Unique identifier for the task"),
        content: z.string().min(1).describe("The task description - what needs to be done"),
        status: TodoStatusSchema.describe("Current status of the task"),
      }),
    )
    .describe("The updated todo list"),
});

const requiredContextHandlers: string[] = ["todo-list"];

export default {
  name,
  displayName,
  description,
  inputSchema,
  execute,
  requiredContextHandlers,
} satisfies TokenRingToolDefinition<typeof inputSchema>;
