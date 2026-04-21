import type { Agent } from "@tokenring-ai/agent";
import type { TokenRingService } from "@tokenring-ai/app/types";
import deepMerge from "@tokenring-ai/utility/object/deepMerge";
import type { z } from "zod";
import { TodoAgentConfigSchema, type TodoConfigSchema } from "./schema.ts";
import { TodoState } from "./state/todoState.ts";

/**
 * TodoService provides todo list management functionality for agents
 */
export default class TodoService implements TokenRingService {
  readonly name = "TodoService";
  description = "Manages todo lists for agents with add, complete, delete, and list operations";

  constructor(readonly options: z.output<typeof TodoConfigSchema>) {}

  attach(agent: Agent) {
    // Merge service defaults with agent-specific config
    const config = deepMerge(this.options.agentDefaults, agent.getAgentConfigSlice("todo", TodoAgentConfigSchema));

    // Initialize state
    agent.initializeState(TodoState, config);
  }
}
