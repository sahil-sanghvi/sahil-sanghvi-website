import type { Command } from "../types";
import { text } from "../types";

export const pwdCommand: Command = {
  name: "pwd",
  usage: "pwd",
  summary: "Print working directory",
  run(ctx) {
    return text(ctx.cwd);
  },
};
