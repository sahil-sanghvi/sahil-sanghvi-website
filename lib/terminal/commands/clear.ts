import type { Command } from "../types";

export const clearCommand: Command = {
  name: "clear",
  usage: "clear",
  summary: "Clear the screen",
  run(ctx) {
    ctx.clear();
    return { kind: "none" };
  },
};
