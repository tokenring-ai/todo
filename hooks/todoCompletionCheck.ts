import type { HookSubscription } from "@tokenring-ai/lifecycle/types";
import { AfterAgentInputSuccess, HookCallback } from "@tokenring-ai/lifecycle/util/hooks";
import markdownList from "@tokenring-ai/utility/string/markdownList";
import { TodoState } from "../state/todoState.ts";

const name = "todoCompletionCheck";
const displayName = "Todo/Completion Check";
const description = "Checks if todos are complete at the end of a successful chat and prompts to complete remaining work";

const callbacks = [
  new HookCallback(AfterAgentInputSuccess, (_data, agent) => {
    const todos = agent.getState(TodoState);

    if (!todos.todos.length) return;

    // Check for incomplete todos
    const incompleteTodos = todos.todos.filter(todo => todo.status === "pending" || todo.status === "in_progress");

    if (incompleteTodos.length === 0) return;

    const message = `**AUTOMATED SYSTEM MESSAGE**

**${incompleteTodos.length} tasks were left on the TODO list that are still marked as incomplete.**

${markdownList(incompleteTodos.map(todo => `${todo.id}: ${todo.content}`))}

You need to do one of the following two things for each of the pending or in progress tasks to resolve this:
1. Complete the task and mark it as done.
2. Mark the task as cancelled if you determined that the task is no longer relevant or completable.

It is OK or even preferable to mark a task as cancelled if you determined that the task is no longer relevant, not completable, is unsafe, or would require further user feedback.

This message will repeat until all tasks are completed or cancelled.
`;

    agent.handleInput({ from: "Todo Completion Check Hook", message });
  }),
];

export default {
  name,
  displayName,
  description,
  callbacks,
} satisfies HookSubscription;
