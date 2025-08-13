module.exports = {
  extends: 'stylelint-config-standard',
  ignoreFiles: [
    'coverage/**/*.css',
    'playwright-report/**/*.css',
    'test-results/**/*.css',
    'node_modules/**/*.css'
  ],
  rules: {
    // Disable problematic rules for our retro terminal theme
    'no-descending-specificity': null,
    'no-duplicate-selectors': null,
    'keyframes-name-pattern': null,
    'declaration-block-single-line-max-declarations': null,
    'alpha-value-notation': null,
    'color-function-notation': null,
    'media-feature-range-notation': null,
    'media-feature-name-value-no-unknown': null,
    'value-keyword-case': null,
    'block-no-empty': null,
    'color-function-alias-notation': null,
    'color-hex-length': null,
    'selector-class-pattern': null,
    'comment-empty-line-before': null,
    'at-rule-empty-line-before': null,
    'rule-empty-line-before': null,
    'declaration-block-no-redundant-longhand-properties': null,
    'selector-no-vendor-prefix': null,
    'shorthand-property-no-redundant-values': null,
    'length-zero-no-unit': null,
    'property-no-vendor-prefix': null,
  },
};
