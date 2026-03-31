import {z} from "zod";

export const TodoStatusSchema = z.enum(["pending", "in_progress", "completed"]);
export const TodoItemSchema = z.object({
  id: z.string(),
  content: z.string(),
  status: TodoStatusSchema,
});
export type TodoItem = z.infer<typeof TodoItemSchema>;

export const TodoAgentConfigSchema = z.object({
  copyToChild: z.boolean().optional(),
  initialItems: z.array(TodoItemSchema).optional()
}).prefault({});

export type TodoAgentConfig = z.output<typeof TodoAgentConfigSchema>;

// Service-level configuration with agent defaults
export const TodoConfigSchema = z.object({
  agentDefaults: z.object({
    copyToChild: z.boolean().default(false),
    initialItems: z.array(TodoItemSchema).default([]),
  }).prefault({}),
}).prefault({});

export type TodoConfig = z.output<typeof TodoConfigSchema>;
