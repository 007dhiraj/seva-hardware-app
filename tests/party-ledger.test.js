const test = require('node:test');
const assert = require('node:assert/strict');
const Core = require('../www/business-core.js');

test('party ledger running balances reflect later receipts, supplier payments and returns', () => {
  const party = { name: 'Acme' };
  const data = {
    sales: [
      { id: '1', date: '2026-11-20', party: 'Acme', type: 'Credit Invoice', no: 1, total: 1000, paid: 100, kind: 'credit' },
      { id: '5', date: '2026-11-24', party: 'Acme', type: 'Sale Return', no: 2, total: 200, paid: 0, kind: 'return' }
    ],
    purchases: [{ id: '3', date: '2026-11-22', party: 'Acme', total: 500, paid: 50, ref: 'SUP-3' }],
    payments: [
      { id: '2', date: '2026-11-21', party: 'Acme', kind: 'receipt', amount: 100 },
      { id: '4', date: '2026-11-23', party: 'Acme', kind: 'payment', amount: 50 }
    ]
  };
  const rows = Core.partyLedgerRows(party, data);
  assert.equal(rows.length, 5);
  assert.equal(rows[0].type, 'Sale Return'); assert.equal(rows[0].balance, 200);
  assert.equal(rows[1].type, 'Payment'); assert.equal(rows[1].balance, 400);
  assert.equal(rows[2].type, 'Purchase'); assert.equal(rows[2].balance, 350);
  assert.equal(rows[3].type, 'Receipt'); assert.equal(rows[3].balance, 800);
  assert.equal(rows[4].type, 'Credit Invoice'); assert.equal(rows[4].balance, 900);
  assert.equal(Core.partyBalance(party, data), rows[0].balance);
});

test('party ledger handles supplier-only balances and case-insensitive names', () => {
  const party = { name: 'Supplier X' };
  const data = {
    purchases: [{ id: '1', date: '2026-11-20', party: 'supplier x', total: 1000, paid: 200 }],
    payments: [{ id: '2', date: '2026-11-21', party: 'SUPPLIER X', kind: 'payment', amount: 300 }]
  };
  const rows = Core.partyLedgerRows(party, data);
  assert.equal(rows[0].type, 'Payment'); assert.equal(rows[0].balance, -500);
  assert.equal(Core.partyBalance(party, data), -500);
});
