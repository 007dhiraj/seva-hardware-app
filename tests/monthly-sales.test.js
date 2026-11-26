const test = require('node:test');
const assert = require('node:assert/strict');
const Core = require('../www/business-core.js');

test('monthly sales comparison uses local calendar months and subtracts sale returns', () => {
  const sales = [
    { date: '2026-09-30', total: 9999, kind: 'cash' },
    { date: '2026-10-01', total: 600, kind: 'cash' },
    { date: '2026-10-31', total: 100, kind: 'return' },
    { date: '2026-11-01', total: 1000, kind: 'credit' },
    { date: '2026-11-25', total: 100, kind: 'return' },
    { date: '2026-12-01', total: 8888, kind: 'cash' }
  ];
  const result = Core.monthlySalesComparison(sales, '2026-11-26');
  assert.equal(result.current, 900);
  assert.equal(result.previous, 500);
  assert.equal(result.changePercent, 80);
  assert.equal(result.currentStart, '2026-11-01');
  assert.equal(result.previousStart, '2026-10-01');
});

test('monthly sales comparison reports no percentage when previous month has no positive base', () => {
  const result = Core.monthlySalesComparison([
    { date: '2026-11-03', total: 250, kind: 'cash' }
  ], '2026-11-26');
  assert.equal(result.current, 250);
  assert.equal(result.previous, 0);
  assert.equal(result.changePercent, null);
});

test('monthly sales comparison handles zero sales and rejects invalid dates', () => {
  const result = Core.monthlySalesComparison([], '2026-01-15');
  assert.equal(result.current, 0);
  assert.equal(result.previous, 0);
  assert.equal(result.changePercent, null);
  assert.throws(() => Core.monthlySalesComparison([], 'not-a-date'), /Invalid monthly comparison date/);
});
