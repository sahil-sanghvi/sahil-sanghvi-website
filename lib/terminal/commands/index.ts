import type { Command } from "../types";
import { helpCommand } from "./help";
import { pwdCommand } from "./pwd";
import { lsCommand } from "./ls";
import { cdCommand } from "./cd";
import { catCommand } from "./cat";
import { whoamiCommand } from "./whoami";
import { echoCommand } from "./echo";
import { clearCommand } from "./clear";
import { treeCommand } from "./tree";
import { openCommand } from "./open";
import { historyCommand } from "./history";
import { dateCommand } from "./date";
import { exitCommand } from "./exit";
import { gitCommand } from "./git";

const registry: Command[] = [
  helpCommand,
  pwdCommand,
  lsCommand,
  cdCommand,
  catCommand,
  whoamiCommand,
  echoCommand,
  clearCommand,
  treeCommand,
  openCommand,
  historyCommand,
  dateCommand,
  exitCommand,
  gitCommand,
];

export const commands: Record<string, Command> = {};
for (const command of registry) {
  commands[command.name] = command;
  for (const alias of command.aliases ?? []) commands[alias] = command;
}
