import type { Command } from "../types";
import { text } from "../types";
import { commands } from "./index";

export const helpCommand: Command = {
  name: "help",
  usage: "help",
  summary: "List available commands",
  run() {
    return text(
      "Available commands:",
      ...Object.values(commands)
        .filter((c, i, arr) => arr.findIndex((x) => x.name === c.name) === i)
        .map((c) => `  ${c.usage.padEnd(20)} ${c.summary}`),
      "",
      "Tab completes when the input isn't empty. Esc always leaves the terminal.",
      "\"Prefer a normal page? View the site →\" link is above the prompt."
    );
  },
};
