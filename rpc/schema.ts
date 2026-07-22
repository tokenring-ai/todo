import type { RPCSchema } from "@tokenring-ai/rpc/types";
import { AgentNotFoundSchema, SuccessSchema } from "@tokenring-ai/rpc/types";
import { z } from "zod";
import { TodoItemSchema } from "../schema.ts";

export default {
  name: "Todo RPC",
  path: "/rpc/todo",
  methods: {
    getTodos: {
      type: "query",
      input: z.object({
        agentId: z.string(),
      }),
      result: z.discriminatedUnion("status", [
        SuccessSchema.extend({
          todos: z.array(TodoItemSchema),
        }),
        AgentNotFoundSchema,
      ]),
    },
    streamTodos: {
      type: "stream",
      input: z.object({
        agentId: z.string(),
      }),
      result: z.discriminatedUnion("status", [
        SuccessSchema.extend({
          todos: z.array(TodoItemSchema),
        }),
        AgentNotFoundSchema,
      ]),
    },
  },
} satisfies RPCSchema;
