const fs = require('node:fs');
const path = require('node:path');

const htmlPath = path.join('www', 'index.html');
const appPath = path.join('www', 'app.js');
const corePath = path.join('www', 'business-core.js');
const cssPath = path.join('www', 'style.css');
let html = fs.readFileSync(htmlPath, 'utf8');
let app = fs.readFileSync(appPath, 'utf8');
let core = fs.readFileSync(corePath, 'utf8');
let css = fs.readFileSync(cssPath, 'utf8');

const exportMarker = '  return { roundMoney, localDate, financialYearCode, calculateInvoice, withAdditionalCharges, partyBalance, stockOnHand, attachPurchasedProducts, backupPayload, createPinCredential, verifyPin, csvRows, partyLedgerRows };';
const helper = [
  '  function monthlySalesComparison(sales, referenceDate = new Date()) {',
  '    let reference;',
  "    if (referenceDate instanceof Date) reference = referenceDate;",
  "    else if (/^\\d{4}-\\d{2}-\\d{2}$/.test(String(referenceDate))) {",
  "      const [year, month, day] = String(referenceDate).split('-').map(Number);",
  '      reference = new Date(year, month - 1, day);',
  '    } else reference = new Date(referenceDate);',
  "    if (Number.isNaN(reference.getTime())) throw new Error('Invalid monthly comparison date');",
  '',
  '    const monthStart = (year, monthIndex) => localDate(new Date(year, monthIndex, 1));',
  '    const currentStart = monthStart(reference.getFullYear(), reference.getMonth());',
  '    const nextStart = monthStart(reference.getFullYear(), reference.getMonth() + 1);',
  '    const previousStart = monthStart(reference.getFullYear(), reference.getMonth() - 1);',
  '    const totalFor = (start, end) => roundMoney((Array.isArray(sales) ? sales : []).reduce((total, item) => {',
  "      const date = String(item && item.date || '');",
  '      if (date < start || date >= end) return total;',
  '      const amount = Number(item && item.total || 0);',
  "      return total + (item && item.kind === 'return' ? -amount : amount);",
  '    }, 0));',
  '    const current = totalFor(currentStart, nextStart);',
  '    const previous = totalFor(previousStart, currentStart);',
  '    const changePercent = previous > 0 ? roundMoney((current - previous) * 100 / previous) : null;',
  '    return { current, previous, changePercent, currentStart, previousStart };',
  '  }'
].join('\n');
if (!core.includes('function monthlySalesComparison(')) {
  if (!core.includes(exportMarker)) throw new Error('Monthly sales core export anchor changed; refusing partial patch.');
  core = core.replace(exportMarker, helper + '\n' + exportMarker.replace('partyLedgerRows };', 'partyLedgerRows, monthlySalesComparison };'));
} else if (!core.includes('partyLedgerRows, monthlySalesComparison };')) {
  throw new Error('Monthly sales helper exists but is not exported.');
}

const statAnchor = '<div class="stat"><small>Receivable</small><b id="receivable">₹0</b></div>';
const statMarkup = statAnchor + '\n  <div class="stat"><small>This Month\'s Sales</small><b id="monthSales">₹0</b><small id="monthSalesTrend" class="month-trend">Last month: ₹0</small></div>';
if (!html.includes('id="monthSales"')) {
  if (!html.includes(statAnchor)) throw new Error('Dashboard receivable stat anchor changed; refusing partial patch.');
  html = html.replace(statAnchor, statMarkup);
}

const homeStart = app.indexOf('function renderHome(){');
const homeEnd = app.indexOf('\nfunction renderProducts', homeStart);
if (homeStart < 0 || homeEnd < 0) throw new Error('Dashboard render function anchor not found.');
const homeReplacement = [
  'function renderHome(){',
  "  const t=db.sales.filter(x=>x.date===today()&&x.kind!=='return').reduce((s,x)=>s+x.total,0);",
  "  $('#todaySales').textContent=fmt(t);",
  '  const comparison=Core.monthlySalesComparison(db.sales,today());',
  "  $('#monthSales').textContent=fmt(comparison.current);",
  "  const trend=$('#monthSalesTrend');",
  "  if(comparison.changePercent===null){trend.textContent='Last month: '+fmt(comparison.previous);trend.className='month-trend'}",
  "  else{const change=comparison.changePercent;trend.textContent=(change>0?'↑ ':change<0?'↓ ':'')+Math.abs(change).toFixed(1)+'% vs last month';trend.className='month-trend '+(change>0?'up':change<0?'down':'flat')}",
  '  let bs=db.parties.map(p=>partyBalance(p));',
  "  $('#receivable').textContent=fmt(bs.filter(x=>x>0).reduce((a,b)=>a+b,0));",
  "  $('#lowStock').textContent=db.products.filter(p=>stock(p)<=Number(p.low||0)).length;",
  "  let all=[...db.sales.map(x=>({...x,category:'Sale'})),...db.purchases.map(x=>({...x,category:'Purchase'})),...db.expenses.map(x=>({...x,category:'Expense'}))].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,5);",
  "  $('#recentList').innerHTML=all.length?all.map(x=>'<div class=\"row\"><div><b>'+esc(x.category)+' · '+esc(x.party||x.title||'')+'</b><small>'+esc(x.date)+' · '+esc(x.txnId||x.ref||'')+'</small></div><div class=\"right\">'+fmt(x.total||x.amount)+'</div></div>').join(''):'No transactions yet.';",
  "  $('#topBusiness').textContent=db.settings.name||'My Business';",
  '}'
].join('\n');
app = app.slice(0, homeStart) + homeReplacement + app.slice(homeEnd);

if (!css.includes('.month-trend')) css += '\n.month-trend{margin-top:5px;font-size:10px;font-weight:700}.month-trend.up{color:var(--green)}.month-trend.down{color:var(--red)}.month-trend.flat{color:var(--muted)}\n';
if (!html.includes('id="monthSales"') || !app.includes('Core.monthlySalesComparison(db.sales,today())') || !core.includes('monthlySalesComparison')) {
  throw new Error('Monthly sales dashboard patch did not apply.');
}
fs.writeFileSync(corePath, core);
fs.writeFileSync(appPath, app);
fs.writeFileSync(htmlPath, html);
fs.writeFileSync(cssPath, css);
console.log('Added current-month net sales and comparison with the previous month.');