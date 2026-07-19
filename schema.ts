import type { ConfigFieldMeta } from "@tokenring-ai/app/config/metadata";
import { z } from "zod";

export const TodoStatusSchema = z.enum(["pending", "in_progress", "completed"]);
export const TodoItemSchema = z.object({
  id: z.string(),
  content: z.string(),
  status: TodoStatusSchema,
});
export type TodoItem = z.infer<typeof TodoItemSchema>;

export const TodoAgentConfigSchema = z
  .object({
    copyToChild: z.boolean().exactOptional(),
    initialItems: z.array(TodoItemSchema).exactOptional(),
  })
  .prefault({});

export type TodoAgentConfig = z.output<typeof TodoAgentConfigSchema>;

// Service-level configuration with agent defaults
export const TodoConfigSchema = z
  .object({
    agentDefaults: z
      .object({
        copyToChild: z
          .boolean()
          .default(false)
          .meta({ description: "Copy the parent agent's todo list to newly spawned sub-agents" } satisfies ConfigFieldMeta),
        initialItems: z
          .array(TodoItemSchema)
          .default([])
          .meta({ advanced: true, description: "Todo items pre-populated for new agents" } satisfies ConfigFieldMeta),
      })
      .prefault({})
      .meta({ label: "Agent Defaults" } satisfies ConfigFieldMeta),
  })
  .prefault({})
  .meta({ label: "Todo", description: "Todo list tracking for agents" } satisfies ConfigFieldMeta);

export type TodoConfig = z.output<typeof TodoConfigSchema>;
