// 与 cz.config.cjs 中的 types.value 保持一致；改类型时请两处同步。
const types = [
  'feat',
  'fix',
  'docs',
  'style',
  'refactor',
  'perf',
  'test',
  'build',
  'ci',
  'chore',
  'revert',
]

module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [2, 'always', types],
    'type-case': [2, 'always', 'lower-case'],
    'type-empty': [2, 'never'],
    'subject-empty': [2, 'never'],
    // 中文 / 表情 / standard-version 的 chore(release): 📦 … 等
    'subject-case': [0],
    'header-max-length': [2, 'always', 100],
    'body-max-line-length': [0],
    'footer-max-line-length': [0],
  },
  ignores: [
    (message) => /^Merge /.test(message),
    (message) => message.startsWith('Revert '),
  ],
}
