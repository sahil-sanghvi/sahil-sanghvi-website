import type { Command } from "../types";
import { text } from "../types";

export const whoamiCommand: Command = {
  name: "whoami",
  usage: "whoami",
  summary: "Print the current user",
  run() {
    return text("visitor");
  },
};
