const test = require('node:test');
const assert = require('node:assert/strict');
const Core = require('../www/business-core.js');

test('detailed CSV rows include sale discounts, charges, GST split and balance', () => {
  const rows = Core.csvRows({
    sales: [{
      kind: 'credit', no: 7, txnId: 'FB/26-27/S/0007', date: '2026-11-25',
      party: 'Customer A', subtotal: 200, discount: 20, taxable: 180,
      charges: 10, chargesGstRate: 18, chargesTax: 1.8, itemTax: 32.4,
      tax: 34.2, total: 226.2, paid: 100, mode: 'UPI', notes: 'delivery'
    }]
  });
  assert.equal(rows.length, 2);
  assert.equal(rows[0].length, 18);
  assert.deepEqual(rows[1], [
    'Sale', 7, 'FB/26-27/S/0007', '2026-11-25', 'Customer A',
    200, 20, 180, 10, 18, 1.8, 32.4, 34.2, 226.2, 100, 126.2,
    'UPI', 'delivery'
  ]);
});

test('detailed CSV includes purchases, receipts, payments and expenses', () => {
  const rows = Core.csvRows({
    purchases: [{ no: 3, txnId: 'FB/26-27/PUR/0003', date: '2026-11-24', party: 'Supplier', subtotal: 100, discount: 5, taxable: 95, charges: 4, chargesGstRate: 5, chargesTax: 0.2, itemTax: 17.1, tax: 17.3, total: 116.5, paid: 50, mode: 'Cash', ref: 'INV-3' }],
    payments: [
      { kind: 'receipt', txnId: 'RCV-1', date: '2026-11-25', party: 'Customer', amount: 25, mode: 'UPI' },
      { kind: 'payment', txnId: 'PAY-1', date: '2026-11-25', party: 'Supplier', amount: 10, mode: 'Cash' }
    ],
    expenses: [{ txnId: 'EXP-1', date: '2026-11-25', title: 'Transport', amount: 15, mode: 'Cash', note: 'local delivery' }]
  });
  assert.equal(rows.length, 5);
  assert.equal(rows[1][0], 'Purchase');
  assert.equal(rows[1][17], 'INV-3');
  assert.equal(rows[2][0], 'Receipt');
  assert.equal(rows[2][13], 25);
  assert.equal(rows[3][0], 'Payment');
  assert.equal(rows[3][13], 10);
  assert.equal(rows[4][0], 'Expense');
  assert.equal(rows[4][4], 'Transport');
  assert.equal(rows[4][17], 'local delivery');
  assert.ok(rows.every(row => row.length === 18));
});

test('CSV row generation tolerates empty and partial data', () => {
  assert.deepEqual(Core.csvRows({}), [[
    'Type', 'Invoice No', 'Transaction ID', 'Date', 'Party / Category',
    'Subtotal', 'Discount', 'Taxable Value', 'Additional Charges',
    'Charge GST Rate', 'GST on Charges', 'GST on Items', 'Total GST',
    'Total', 'Paid / Received', 'Balance', 'Payment Mode', 'Reference / Notes'
  ]]);
});
