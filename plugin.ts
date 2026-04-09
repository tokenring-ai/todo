import {TokenRingPlugin} from "@tokenring-ai/app";
import {ChatService} from "@tokenring-ai/chat";
import {AgentLifecycleService} from "@tokenring-ai/lifecycle";
import {z} from "zod";
import contextHandlers from "./contextHandlers.ts";
import hooks from "./hooks.ts";
import packageJSON from "./package.json" with {type: "json"};
import {TodoConfigSchema} from "./schema.ts";
import TodoService from "./TodoService.ts";
import tools from "./tools.ts";

const todoConfigSchema = z.object({
  todo: TodoConfigSchema
});

export default {
  name: packageJSON.name,
  displayName: "Todo List",
  version: packageJSON.version,
  description: packageJSON.description,
  install(app, config) {
    // Add services
    app.addServices(new TodoService(config.todo));
    
    // Register tools
    app.waitForService(ChatService, chatService => {
      chatService.addTools(tools);
      chatService.registerContextHandlers(contextHandlers);
    });

    // Register hooks with the lifecycle service
    app.waitForService(AgentLifecycleService, lifecycleService => {
      lifecycleService.addHooks(hooks);
    });
  },
  config: todoConfigSchema
} satisfies TokenRingPlugin<typeof todoConfigSchema>;
