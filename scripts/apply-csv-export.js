const fs = require('node:fs');
const path = require('node:path');

const corePath = path.join('www', 'business-core.js');
const appPath = path.join('www', 'app.js');
let core = fs.readFileSync(corePath, 'utf8');
let app = fs.readFileSync(appPath, 'utf8');

const exportMarker = '  return { roundMoney, localDate, financialYearCode, calculateInvoice, withAdditionalCharges, partyBalance, stockOnHand, attachPurchasedProducts, backupPayload, createPinCredential, verifyPin };';
const helper = `
  function csvRows(data) {
    const source = data || {};
    const header = [
      'Type', 'Invoice No', 'Transaction ID', 'Date', 'Party / Category',
      'Subtotal', 'Discount', 'Taxable Value', 'Additional Charges',
      'Charge GST Rate', 'GST on Charges', 'GST on Items', 'Total GST',
      'Total', 'Paid / Received', 'Balance', 'Payment Mode', 'Reference / Notes'
    ];
    const invoiceRow = (type, item) => {
      const subtotal = roundMoney(item.subtotal ?? item.sub ?? 0);
      const discount = roundMoney(item.discount || 0);
      const chargesTax = roundMoney(item.chargesTax || 0);
      const totalTax = roundMoney(item.tax || 0);
      const itemTax = roundMoney(item.itemTax ?? (totalTax - chargesTax));
      const total = roundMoney(item.total || 0);
      const paid = roundMoney(item.paid || 0);
      return [
        type, item.no ?? '', item.txnId || '', item.date || '', item.party || '',
        subtotal, discount, roundMoney(item.taxable ?? Math.max(0, subtotal - discount)),
        roundMoney(item.charges || 0), roundMoney(item.chargesGstRate || 0),
        chargesTax, itemTax, totalTax, total, paid, roundMoney(total - paid),
        item.mode || '', item.ref || item.notes || ''
      ];
    };
    const rows = [header];
    for (const item of source.sales || []) {
      rows.push(invoiceRow(item.kind === 'return' ? 'Sale Return' : 'Sale', item));
    }
    for (const item of source.purchases || []) rows.push(invoiceRow('Purchase', item));
    for (const item of source.payments || []) {
      const amount = roundMoney(item.amount || 0);
      rows.push([
        item.kind === 'receipt' ? 'Receipt' : 'Payment', '', item.txnId || '',
        item.date || '', item.party || '', '', '', '', '', '', '', '', '',
        amount, amount, 0, item.mode || '', ''
      ]);
    }
    for (const item of source.expenses || []) {
      const amount = roundMoney(item.amount || 0);
      rows.push([
        'Expense', '', item.txnId || '', item.date || '', item.title || '',
        '', '', '', '', '', '', '', '', amount, amount, 0,
        item.mode || '', item.note || ''
      ]);
    }
    return rows;
  }
`;
if (!core.includes(exportMarker)) {
  if (!core.includes('function csvRows(data)')) {
    throw new Error('Business core export anchor changed; refusing to patch CSV export.');
  }
} else {
  core = core.replace(exportMarker, helper + '\n' + exportMarker.replace('verifyPin };', 'verifyPin, csvRows };'));
}

const start = app.indexOf('function csv(){');
const end = app.indexOf('\nfunction init()', start);
if (start < 0 || end < 0) throw new Error('CSV export function anchor not found.');
const replacement = `function csv(){
  const rows = Core.csvRows(db);
  const out = rows.map(row => row.map(value => '"' + String(value ?? '').replaceAll('"', '""') + '"').join(',')).join('\\n');
  const blob = new Blob([out], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'free-bill-transactions-' + today() + '.csv';
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
  toast('Detailed CSV export started. Check Downloads.');
}`;
app = app.slice(0, start) + replacement + app.slice(end);
if (!app.includes('Core.csvRows(db)') || !core.includes('csvRows')) {
  throw new Error('Detailed CSV export patch did not apply.');
}
fs.writeFileSync(corePath, core);
fs.writeFileSync(appPath, app);
console.log('Applied detailed CSV export columns for invoices, payments and expenses.');
