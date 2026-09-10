import type { Command } from "../types";
import { text } from "../types";

export const echoCommand: Command = {
  name: "echo",
  usage: "echo <text>",
  summary: "Print text back",
  run(_ctx, args) {
    return text(args.join(" "));
  },
};
