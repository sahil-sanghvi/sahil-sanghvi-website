import type { Command } from "../types";
import { text } from "../types";

export const dateCommand: Command = {
  name: "date",
  usage: "date",
  summary: "Print the current date and time",
  run() {
    return text(new Date().toString());
  },
};
