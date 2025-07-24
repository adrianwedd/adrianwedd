module.exports = {
  extends: 'stylelint-config-standard',
  rules: {
    'indentation': 2,
    'string-quotes': 'single',
    'color-hex-case': 'lower',
    'color-hex-length': 'short',
    'declaration-block-trailing-semicolon': 'always',
    'rule-empty-line-before': [
      'always',
      {
        ignore: ['after-comment', 'first-nested'],
      },
    ],
    'at-rule-empty-line-before': [
      'always',
      {
        ignore: ['after-comment', 'first-nested'],
      },
    ],
    // Add custom rules for retro theme color palette validation if needed
  },
};
