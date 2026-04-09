export default {
  run: {
    cwd: '../..',
    outputDir: './.skillgym-results',
    reporter: 'standard',
    schedule: 'parallel',
  },
  defaults: {
    timeoutMs: 120_000,
  },
  runners: {
    'codex-main': {
      agent: {
        type: 'codex',
        model: 'gpt-5.4-mini',
      },
    },
  },
  snapshots: {
    path: './skillgym.snapshots.json',
    tolerance: {
      absolute: 300,
      percent: 15,
    },
  },
};
