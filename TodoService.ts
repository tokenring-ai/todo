import type { Agent } from "@tokenring-ai/agent";
import type { TokenRingService } from "@tokenring-ai/app/types";
import deepClone from "@tokenring-ai/utility/object/deepClone";
import { TodoAgentConfigSchema, type TodoConfig, TodoConfigSchema } from "./schema.ts";
import { TodoState } from "./state/todoState.ts";

/**
 * TodoService provides todo list management functionality for agents
 */
export default class TodoService implements TokenRingService {
  readonly name = "TodoService";
  description = "Manages todo lists for agents with add, complete, delete, and list operations";

  private options = TodoConfigSchema.parse({});

  constructor(options?: TodoConfig) {
    if (options) this.options = options;
  }

  reconfigure(options: TodoConfig): void {
    this.options = options;
  }

  attach(agent: Agent) {
    // Merge service defaults with agent-specific config
    const config = deepClone(this.options.agentDefaults, agent.getAgentConfigSlice("todo", TodoAgentConfigSchema));

    // Initialize state
    agent.initializeState(TodoState, config);
  }
}
