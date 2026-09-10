import type { Command } from "../types";
import { text } from "../types";

export const exitCommand: Command = {
  name: "exit",
  usage: "exit",
  summary: "Leave the terminal and return to the site",
  run(ctx) {
    ctx.navigate("/");
    return text("goodbye.");
  },
};
