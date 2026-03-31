import {Agent} from "@tokenring-ai/agent";
import {AgentStateSlice} from "@tokenring-ai/agent/types";
import {z} from "zod";
import {type TodoConfig, type TodoItem, TodoItemSchema} from "../schema.ts";

const serializationSchema = z.object({
  todos: z.array(TodoItemSchema).default([])
}).prefault({});

export class TodoState extends AgentStateSlice<typeof serializationSchema> {
  todos: TodoItem[] = [];

  constructor(readonly initialConfig: TodoConfig["agentDefaults"]) {
    super("TodoState", serializationSchema);
    if (initialConfig.initialItems) {
      this.todos = [...initialConfig.initialItems];
    }
  }

  transferStateFromParent(parentAgent: Agent) {
    const {copyToChild} = parentAgent.getState(TodoState).initialConfig;
    if (copyToChild) {
      const parentTodos = parentAgent.getState(TodoState).todos;
      this.todos = [...parentTodos];
    }
  }

  serialize(): z.output<typeof serializationSchema> {
    return {
      todos: this.todos,
    };
  }

  deserialize(data: z.output<typeof serializationSchema>): void {
    this.todos.splice(0, this.todos.length, ...data.todos || []);
  }

  show(): string[] {
    const pending = this.todos.filter(t => t.status === "pending").length;
    const inProgress = this.todos.filter(t => t.status === "in_progress").length;
    const completed = this.todos.filter(t => t.status === "completed").length;
    return [
      `Total: ${this.todos.length}`,
      `Pending: ${pending}`,
      `In Progress: ${inProgress}`,
      `Completed: ${completed}`,
    ];
  }
}
