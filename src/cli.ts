#!/usr/bin/env node

import { Command } from "commander"
import { initCommand } from "./commands/init.js"
import { runCommand } from "./commands/run.js"
import { addCommand } from "./commands/add.js"
import { editCommand } from "./commands/edit.js"
import { removeCommand } from "./commands/remove.js"
import { watchCommand } from "./commands/watch.js"
import { listCommand } from "./commands/list.js"

const program = new Command()

interface SharedOptions {
  parallel?: boolean
  continue?: boolean
  verbose?: boolean
  timeout?: string
}

const addSharedOptions = (cmd: Command) => {
  return cmd
    .option("--parallel", "Run tasks in parallel")
    .option("--continue", "Run all tasks even if one fails")
    .option("--verbose", "Show full command output")
    .option("--timeout <seconds>", "Timeout for each task in seconds")
}

program
  .name("sncheck")
  .description("A CLI tool that orchestrates common project quality checks")
  .version("1.0.0")

addSharedOptions(program).action((options: SharedOptions) => {
  runCommand(undefined, options)
})

program
  .command("init")
  .description("Initialize sncheck configuration")
  .option("-y, --yes", "Use all detected tools automatically")
  .option("-f, --force", "Overwrite existing configuration")
  .action((options: { yes?: boolean; force?: boolean }) => {
    initCommand(options)
  })

const runCmd = program.command("run").description("Run specific tasks")
addSharedOptions(runCmd)
  .argument("[tasks...]", "Tasks to run")
  .action((taskNames: string[] | undefined, options: SharedOptions) => {
    runCommand(taskNames, options)
  })

program.command("add").description("Add a new task").action(addCommand)

program.command("edit").description("Edit an existing task").action(editCommand)

program.command("remove").description("Remove a task").action(removeCommand)

program
  .command("watch")
  .description("Run tasks in watch mode")
  .action(watchCommand)

program.command("list").description("List all tasks").action(listCommand)

program.parse()
