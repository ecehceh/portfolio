// Enforced on pull requests by the "Conventional commit messages" CI job.
// Format: <type>: <description>, e.g. "feat: add project images".
const config = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [2, 'always', ['feat', 'fix', 'refactor', 'docs', 'test', 'chore', 'perf', 'ci', 'style', 'build', 'revert']],
    // Bodies and footers may hold long URLs (Dependabot release notes, issue links).
    'body-max-line-length': [0],
    'footer-max-line-length': [0],
  },
};

export default config;
