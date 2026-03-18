export interface Task {
  name: string
  cmd: string
  description?: string
}

export interface Provider {
  name: string
  cmd: string
  description: string
}

export interface Config {
  tasks: Task[]
}

export interface TaskError {
  task: string
  output: string
}

export type TaskContext = {
  tasks: Task[]
  failed: boolean
}
