import { AgentManager } from "@tokenring-ai/agent";
import { createAgentStateSliceStream } from "@tokenring-ai/agent/rpc/createAgentStateStream";
import type TokenRingApp from "@tokenring-ai/app";
import { createRPCEndpoint } from "@tokenring-ai/rpc/createRPCEndpoint";
import { TodoState } from "../state/todoState.ts";
import TodoRpcSchema from "./schema.ts";

const streamTodos = createAgentStateSliceStream({
  SliceClass: TodoState,
  project: state => ({
    status: "success" as const,
    todos: state.todos,
  }),
});

export default createRPCEndpoint(TodoRpcSchema, {
  getTodos(args, app: TokenRingApp) {
    const agent = app.requireService(AgentManager).getAgent(args.agentId);
    if (!agent) {
      return { status: "agentNotFound" as const };
    }
    const state = agent.getState(TodoState);
    return {
      status: "success" as const,
      todos: state.todos,
    };
  },

  streamTodos,
});
