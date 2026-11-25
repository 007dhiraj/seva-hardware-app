const fs = require('node:fs');
const path = require('node:path');
const corePath = path.join('www', 'business-core.js');
const appPath = path.join('www', 'app.js');
let core = fs.readFileSync(corePath, 'utf8');
let app = fs.readFileSync(appPath, 'utf8');

const exportMarker = '  return { roundMoney, localDate, financialYearCode, calculateInvoice, withAdditionalCharges, partyBalance, stockOnHand, attachPurchasedProducts, backupPayload, createPinCredential, verifyPin, csvRows };';
const helper = [
  '  function partyLedgerRows(party, data) {',
  '    const name = String(party && party.name || \'\').toLowerCase();',
  '    if (!name || !data) return [];',
  '    const rows = [];',
  '    for (const item of data.sales || []) {',
  '      if (String(item.party || \'\').toLowerCase() !== name) continue;',
  '      const isReturn = item.kind === \'return\';',
  '      const delta = (isReturn ? -1 : 1) * (Number(item.total || 0) - Number(item.paid || 0));',
  '      rows.push({ date: item.date || \'\', id: item.txnId || \'-\', type: isReturn ? \'Sale Return\' : (item.type || \'Sale\'), amount: roundMoney(item.total || 0), delta: roundMoney(delta), detail: \'Invoice #\' + (item.no ?? \'\'), ref: item.id, kind: \'sale\', status: Math.abs(delta) < 0.005 ? \'SETTLED\' : (delta < 0 ? \'REFUND DUE\' : \'UNPAID\'), orderKey: String(item.id || item.txnId || \'\') });',
  '    }',
  '    for (const item of data.purchases || []) {',
  '      if (String(item.party || \'\').toLowerCase() !== name) continue;',
  '      const delta = -(Number(item.total || 0) - Number(item.paid || 0));',
  '      rows.push({ date: item.date || \'\', id: item.txnId || \'-\', type: \'Purchase\', amount: roundMoney(item.total || 0), delta: roundMoney(delta), detail: item.ref || \'Purchase\', kind: \'purchase\', status: Math.abs(delta) < 0.005 ? \'PAID\' : \'PAYABLE\', orderKey: String(item.id || item.txnId || \'\') });',
  '    }',
  '    for (const item of data.payments || []) {',
  '      if (String(item.party || \'\').toLowerCase() !== name) continue;',
  '      const isReceipt = item.kind === \'receipt\';',
  '      const delta = (isReceipt ? -1 : 1) * Number(item.amount || 0);',
  '      rows.push({ date: item.date || \'\', id: item.txnId || \'-\', type: isReceipt ? \'Receipt\' : \'Payment\', amount: roundMoney(item.amount || 0), delta: roundMoney(delta), detail: item.mode || \'\', kind: \'payment\', status: isReceipt ? \'RECEIVED\' : \'PAID\', orderKey: String(item.id || item.txnId || \'\') });',
  '    }',
  '    rows.sort((a, b) => String(a.date).localeCompare(String(b.date)) || a.orderKey.localeCompare(b.orderKey));',
  '    let running = 0;',
  '    for (const row of rows) { running = roundMoney(running + row.delta); row.balance = running; delete row.delta; delete row.orderKey; }',
  '    return rows.reverse();',
  '  }'
].join('\n');
if (!core.includes(exportMarker)) {
  if (!core.includes('function partyLedgerRows(party, data)')) throw new Error('Party ledger core export anchor changed; refusing partial patch.');
} else {
  core = core.replace(exportMarker, helper + '\n' + exportMarker.replace('csvRows };', 'csvRows, partyLedgerRows };'));
}

const shareStart = app.indexOf('function sharePartyStatement(id){');
const shareEnd = app.indexOf('\nfunction remindParty', shareStart);
if (shareStart < 0 || shareEnd < 0) throw new Error('Party statement function anchor not found.');
const shareReplacement = [
  'function sharePartyStatement(id){',
  '  const p = db.parties.find(x => x.id === id); if (!p) return;',
  '  const rows = Core.partyLedgerRows(p, db).slice().reverse().map(x => x.date + \' | \' + x.id + \' | \' + x.type + \' | \' + fmt(x.amount) + \' | Running balance \' + fmt(Math.abs(x.balance)) + \' \' + (x.balance >= 0 ? \'Receivable\' : \'Payable\'));',
  '  const bal = partyBalance(p);',
  '  const txt = db.settings.name + \' - Party Statement\\n\' + p.name + \' · \' + (p.phone || \'\') + \'\\n\\n\' + rows.join(\'\\n\') + \'\\n\\nBalance: \' + fmt(Math.abs(bal)) + \' \' + (bal >= 0 ? \'Receivable\' : \'Payable\');',
  '  if (navigator.share) navigator.share({ title: \'Party Statement\', text: txt }).catch(() => {});',
  '  else if (navigator.clipboard) navigator.clipboard.writeText(txt).then(() => toast(\'Statement copied\'));',
  '}'
].join('\n');
app = app.slice(0, shareStart) + shareReplacement + app.slice(shareEnd);

const ledgerStart = app.indexOf('function showPartyLedger(id){');
const ledgerEnd = app.indexOf('\nfunction openLedgerSale', ledgerStart);
if (ledgerStart < 0 || ledgerEnd < 0) throw new Error('Party ledger view function anchor not found.');
const ledgerReplacement = [
  'function showPartyLedger(id){',
  '  const p = db.parties.find(x => x.id === id); if (!p) return;',
  '  const rows = Core.partyLedgerRows(p, db);',
  '  const bal = partyBalance(p);',
  '  const sales = rows.filter(x => x.kind === \'sale\').reduce((sum, x) => sum + (x.type === \'Sale Return\' ? -x.amount : x.amount), 0);',
  '  const received = db.payments.filter(x => x.party.toLowerCase() === p.name.toLowerCase() && x.kind === \'receipt\').reduce((sum, x) => sum + x.amount, 0);',
  '  const history = rows.map(x => {',
  '    const side = x.balance >= 0 ? \'Receivable\' : \'Payable\';',
  '    const statusClass = [\'PAID\', \'RECEIVED\', \'SETTLED\'].includes(x.status) ? \'ledger-paid\' : \'ledger-unpaid\';',
  '    const actions = x.kind === \'sale\' ? \'<button class=\"link\" onclick=\"openLedgerSale(\\\'\' + esc(x.ref) + \'\\\')\">View Bill</button><button class=\"link\" onclick=\"whatsappInvoice(\\\'\' + esc(x.ref) + \'\\\')\">WhatsApp</button>\' : \'<span class=\"muted\">\' + (x.kind === \'payment\' ? \'Payment entry\' : \'Purchase entry\') + \'</span>\';',
  '    return \'<div class=\"ledger-txn\"><div class=\"ledger-txn-top\"><b>\' + esc(x.type) + \'</b><span class=\"\' + statusClass + \'\">\' + esc(x.status) + \'</span></div><div class=\"ledger-txn-meta\">\' + esc(x.date) + \' · \' + esc(x.id) + \'</div><div class=\"ledger-txn-bottom\"><div><b>\' + fmt(x.amount) + \'</b><small>\' + esc(x.detail) + \' · Running balance \' + fmt(Math.abs(x.balance)) + \' \' + side + \'</small></div><div>\' + actions + \'</div></div></div>\';',
  '  }).join(\'\');',
  '  const balanceLabel = bal >= 0 ? \'Receivable\' : \'Payable\';',
  '  const html = \'<div class=\"party-ledger\"><div class=\"party-ledger-head\"><h2>\' + esc(p.name) + \'</h2><p>\' + esc(p.phone || \'No mobile number\') + \' · \' + esc(p.type || \'Customer\') + \'</p><div class=\"ledger-balance\"><span>\' + balanceLabel + \'</span><b>\' + fmt(Math.abs(bal)) + \'</b></div><div class=\"ledger-summary\"><span>Total sales<br><b>\' + fmt(sales) + \'</b></span><span>Receipts<br><b>\' + fmt(received) + \'</b></span><span>Transactions<br><b>\' + rows.length + \'</b></span></div><div class=\"ledger-actions\"><button class=\"secondary\" onclick=\"sharePartyStatement(\\\'\' + esc(p.id) + \'\\\')\">Share Statement</button><button class=\"primary\" onclick=\"remindParty(\\\'\' + esc(p.id) + \'\\\')\">Send Reminder</button></div></div><h3>Transaction History · Running balance</h3>\' + (history || \'No transactions recorded for this party yet.\') + \'</div>\';',
  '  $(\'#modalBody\').innerHTML = html; $(\'#modal\').showModal();',
  '}'
].join('\n');
app = app.slice(0, ledgerStart) + ledgerReplacement + app.slice(ledgerEnd);

if (!core.includes('function partyLedgerRows(party, data)') || !app.includes('Core.partyLedgerRows(p, db)')) throw new Error('Running-balance ledger patch did not apply.');
fs.writeFileSync(corePath, core);
fs.writeFileSync(appPath, app);
console.log('Applied chronological running balances to party ledgers and shared statements.');