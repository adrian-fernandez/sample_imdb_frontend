define('frontend/tests/components/create-new-movie/component.jshint.lint-test', ['exports'], function (exports) {
  'use strict';

  QUnit.module('JSHint | components/create-new-movie/component.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(true, 'components/create-new-movie/component.js should pass jshint.');
  });
});