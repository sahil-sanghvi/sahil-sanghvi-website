import type { Command } from "../types";
import { text } from "../types";

export const historyCommand: Command = {
  name: "history",
  usage: "history",
  summary: "Show command history",
  run(ctx) {
    if (ctx.history.length === 0) return text("(empty)");
    return text(...ctx.history.map((h, i) => `${i + 1}  ${h}`));
  },
};
