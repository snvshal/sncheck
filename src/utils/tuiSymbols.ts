export const tuiSymbols = {
  checkbox: {
    checked: '●',
    unchecked: '○',
    cursor: '▸',
    disabledChecked: '●',
    disabledUnchecked: '○',
  },
  prefix: {
    idle: '›',
    done: '✔',
    canceled: '✖',
  },
  status: {
    success: '✓',
    failed: '✗',
    timedOut: '⊗',
    pending: '○',
  },
  spinner: ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'],
  lines: {
    thin: '─',
    thick: '═',
  },
  helpSeparator: ' · ',
} as const;
