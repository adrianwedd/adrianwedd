module.exports = {
  extends: 'stylelint-config-standard',
  rules: {
    // Disable problematic rules for our retro terminal theme
    'no-descending-specificity': null,
    'no-duplicate-selectors': null,
    'keyframes-name-pattern': null,
    'declaration-block-single-line-max-declarations': null,
    'alpha-value-notation': null,
    'color-function-notation': null,
    'media-feature-range-notation': null,
    'rule-empty-line-before': [
      'always',
      {
        except: ['first-nested'],
        ignore: ['after-comment']
      },
    ],
  },
};
