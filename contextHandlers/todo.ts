import type {ContextHandlerOptions, ContextItem} from "@tokenring-ai/chat/schema";
import {TodoState} from "../state/todoState.ts";

import {formatTodoList} from "../util/todo.ts";

export default function* getTodoContext({
                                          agent,
                                        }: ContextHandlerOptions): Generator<ContextItem> {
  const todoState = agent.getState(TodoState);

  const todoList = formatTodoList(todoState.todos);

  yield {
    role: "user",
    content: `/* Current todo list */\n` + `${todoList}`,
  };
}
