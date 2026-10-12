// Enforced on pull requests by the "Conventional commit messages" CI job.
// Format: <type>: <description>, e.g. "feat: add project images".
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [2, 'always', ['feat', 'fix', 'refactor', 'docs', 'test', 'chore', 'perf', 'ci', 'style', 'build', 'revert']],
  },
};
