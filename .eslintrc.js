module.exports = {
  root: true,
  extends: [
    'eslint-config-standard'
  ],
  env: {
    amd: false,
    jasmine: false,
    node: true,
    mocha: true,
    builtin: true,
    es6: true,
  },
  rules: {
    'prefer-promise-reject-errors': 'off'
  }
}
