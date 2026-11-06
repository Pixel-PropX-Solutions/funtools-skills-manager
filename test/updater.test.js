import { test, describe } from 'node:test';
import assert from 'node:assert';
import { compareSemver } from '../src/updater.js';

describe('compareSemver', () => {
  test('correctly compares equal versions', () => {
    assert.strictEqual(compareSemver('1.0.0', '1.0.0'), 0);
    assert.strictEqual(compareSemver('v2.1.0', '2.1.0'), 0);
  });

  test('correctly identifies newer major versions', () => {
    assert.strictEqual(compareSemver('2.0.0', '1.9.9'), 1);
    assert.strictEqual(compareSemver('1.0.0', '2.0.0'), -1);
  });

  test('correctly identifies newer minor versions', () => {
    assert.strictEqual(compareSemver('2.1.0', '2.0.9'), 1);
    assert.strictEqual(compareSemver('2.0.0', '2.1.0'), -1);
  });

  test('correctly identifies newer patch versions', () => {
    assert.strictEqual(compareSemver('2.0.1', '2.0.0'), 1);
    assert.strictEqual(compareSemver('2.0.0', '2.0.1'), -1);
  });

  test('handles version strings with v prefix and pre-release metadata', () => {
    assert.strictEqual(compareSemver('v2.1.0-beta.1', '2.0.0'), 1);
    assert.strictEqual(compareSemver('2.0.0', 'v2.0.0-rc1'), 0);
  });
});
