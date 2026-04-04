import test from 'node:test';
import assert from 'node:assert/strict';
import { computeCompositeQualityScore, gradeFromScore } from '../lib/quality.js';

test('computeCompositeQualityScore sums weighted metrics', () => {
    const metrics = { appearance: 100, freshness: 100, size: 100, contamination: 100 };
    const score = computeCompositeQualityScore(metrics);
    assert.equal(score, 100);
});

test('gradeFromScore maps thresholds', () => {
    assert.equal(gradeFromScore(95), 'A');
    assert.equal(gradeFromScore(80), 'B');
    assert.equal(gradeFromScore(50), 'C');
});

test('computeCompositeQualityScore ignores invalid entries', () => {
    assert.equal(computeCompositeQualityScore(null), 0);
    assert.equal(computeCompositeQualityScore({ a: 'x' }), 0);
});
