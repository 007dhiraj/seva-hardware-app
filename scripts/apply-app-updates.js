const fs=require('node:fs'),path=require('node:path');
const hp=path.join('www','index.html'),ap=path.join('www','app.js');
let html=fs.readFileSync(hp,'utf8'),app=fs.readFileSync(ap,'utf8');
for(const [a,b] of [
['<title>Seva Hardware Business Manager</title>','<title>Free Bill</title>'],
['<h1>Seva Hardware</h1>','<h1>Free Bill</h1>'],
['<h2>Seva Hardware</h2>','<h2>Free Bill</h2>'],
['<p>Offline Business Manager</p>','<p>Billing & Business Manager</p>'],
['<b id="topBusiness">Seva Hardware</b>','<b id="topBusiness">My Business</b>'],
['<label>Business name (new account)<input id="authBusiness" placeholder="Seva Hardware"></label>','<label>Business name (new account)<input id="authBusiness" placeholder="Enter your shop name"></label>'],
['<label>Business name<input id="setName" value="Seva Hardware"></label>','<label>Business name<input id="setName" placeholder="Enter your shop name"></label>']])html=html.replace(a,b);
if(html.includes('Seva Hardware'))throw Error('Fixed shop branding remains in HTML');
html=html.replace('<button class="primary wide" id="saveSale">Save Invoice</button>','<div class="bill-actions"><button class="secondary wide" id="saveSale">Save</button><button class="primary wide" id="saveSaleNew">Save &amp; New</button></div>');
if(!html.includes('id="saveSaleNew"'))throw Error('Could not add Save & New');
app=app.replace("name:'Seva Hardware'","name:'My Business'");
app=app.replace("function readDB(){try{const saved=JSON.parse(localStorage.getItem(accountDBKey())||'{}');return {...fresh(),...saved,settings:{...fresh().settings,...(saved.settings||{})},seq:{...fresh().seq,...(saved.seq||{})}}}catch(e){return fresh()}}","function readDB(){try{const saved=JSON.parse(localStorage.getItem(accountDBKey())||'{}');const data={...fresh(),...saved,settings:{...fresh().settings,...(saved.settings||{})},seq:{...fresh().seq,...(saved.seq||{})}};if(data.settings.name==='Seva Hardware')data.settings.name='My Business';return data}catch(e){return fresh()}}");
const ls=app.indexOf('function renderLines(kind){'),le=app.indexOf('\nfunction calc(kind)',ls);
if(ls<0||le<0)throw Error('Line renderer not found');
const renderer=`function productOptions(query=''){const q=String(query||'').trim().toLocaleLowerCase();return db.products.map(p=>{const n=p.name.toLocaleLowerCase(),words=n.split(/\\s+/),rank=!q?0:n.startsWith(q)?0:words.some(w=>w.startsWith(q))?1:n.includes(q)?2:3;return {p,rank}}).filter(x=>x.rank<3).sort((a,b)=>a.rank-b.rank||a.p.name.localeCompare(b.p.name)).map(x=>'<option value="'+esc(x.p.name)+'">').join('')}
function renderLines(kind){let arr=kind==='sale'?saleLines:purchaseLines,host=kind==='sale'?$('#saleLines'):$('#purchaseLines');host.innerHTML=arr.map((l,i)=>{let hintId=kind+'ProductHints_'+l.id;return '<div class="line-card" data-line="'+l.id+'"><div class="line-head"><b>Item '+(i+1)+'</b><button class="remove" data-remove-line="'+l.id+'" data-kind="'+kind+'">Remove</button></div><label>Product<input list="'+hintId+'" class="line-name" data-id="'+l.id+'" value="'+esc(l.name)+'" placeholder="Type product name"><datalist id="'+hintId+'">'+productOptions(l.name)+'</datalist></label><div class="line-grid four"><label>Qty<input class="line-qty" data-id="'+l.id+'" type="number" min="0" step=".01" value="'+l.qty+'"></label><label>Unit<input class="line-unit" data-id="'+l.id+'" value="'+esc(l.unit)+'"></label><label>'+(kind==='sale'?'Rate':'Cost')+' ₹<input class="line-price" data-id="'+l.id+'" type="number" min="0" step=".01" value="'+l.price+'"></label><label>GST %<input class="line-gst" data-id="'+l.id+'" type="number" min="0" max="100" step=".01" value="'+l.gst+'"></label></div><div class="line-total"><span>'+(kind==='sale'?'Line total':'Line purchase total')+'</span><b>'+fmt(l.qty*l.price)+'</b></div></div>'}).join('');calc(kind)}`;
app=app.slice(0,ls)+renderer+app.slice(le);
const cs=app.indexOf('function createSale(){'),ce=app.indexOf('\nfunction showInvoice',cs);
if(cs<0||ce<0)throw Error('Sale save function not found');
const create=`function resetSaleForm(){saleLines=[];$('#saleParty').value='';$('#salePhone').value='';$('#salePaid').value=0;$('#saleDisc').value=0;$('#saleNotes').value='';addLine('sale')}
function createSale(startNew=false){let party=$('#saleParty').value.trim();if(!party){toast('Enter customer name');return}let lines=saleLines.filter(l=>l.name&&l.qty>0);if(!lines.length){toast('Add at least one item');return}let t=calc('sale'),kind=$('#saleType').value,taxMode=$('#taxMode').value,paid=Math.min(t.total,Math.max(0,Number($('#salePaid').value)||0));if(kind==='cash')paid=t.total;let invoiceType=kind==='return'?'Sale Return':kind==='credit'?(taxMode==='gst'?'Credit Tax Invoice':'Credit Invoice'):(taxMode==='gst'?'Tax Invoice':'Bill of Supply');let b={id:uid(),txnId:nextTxnId($('#saleDate').value||today(),kind==='return'?'R':'S'),no:db.seq.sale++,date:$('#saleDate').value||today(),party,phone:$('#salePhone').value,type:invoiceType,kind,mode:$('#saleMode').value,taxMode,supply:$('#supplyType').value,lines:lines.map(l=>({...l,hsn:l.hsn||db.products.find(p=>p.id===l.productId)?.hsn||''})),subtotal:t.sub,discount:t.disc,taxable:t.taxable,tax:t.tax,total:t.total,paid,notes:$('#saleNotes').value};db.sales.push(b);if(!db.parties.some(p=>p.name.toLowerCase()===party.toLowerCase()))db.parties.push({id:uid(),name:party,type:'Customer',phone:b.phone});if(!saveDB()){db.sales.pop();return}resetSaleForm();if(startNew)go('billing');else go('history');showInvoice(b);toast(startNew?'Bill saved. Ready for next bill.':'Bill saved successfully')}`;
app=app.slice(0,cs)+create+app.slice(ce);
app=app.replace("$('#saveSale').onclick=createSale;","$('#saveSale').onclick=()=>createSale(false);$('#saveSaleNew').onclick=()=>createSale(true);");
app=app.replace("if(el.classList.contains('line-name')){l.name=el.value;let p=db.products.find(x=>x.name.toLowerCase()===l.name.toLowerCase());","if(el.classList.contains('line-name')){l.name=el.value;const hints=$('#'+kind+'ProductHints_'+id);if(hints)hints.innerHTML=productOptions(l.name);let p=db.products.find(x=>x.name.toLowerCase()===l.name.toLowerCase());");
app=app.replace("||'Seva Hardware';if(phone.length<10)","||'My Business';if(phone.length<10)");
if(app.includes("name:'Seva Hardware'")||app.includes("||'Seva Hardware'"))throw Error('Fixed brand remains in app defaults');
if(!app.includes('function productOptions')||!app.includes('saveSaleNew'))throw Error('App enhancements missing');
const cp=path.join('www','style.css');let css=fs.readFileSync(cp,'utf8');if(!css.includes('.bill-actions'))css+='\n.bill-actions{display:grid;grid-template-columns:1fr 1fr;gap:9px}.bill-actions .wide{margin:6px 0}\n';

// Apply the final Free Bill branding and the user's dashboard/security preferences.
const corePath=path.join('www','business-core.js'),manifestPath=path.join('www','manifest.json'),swPath=path.join('www','sw.js');
let core=fs.readFileSync(corePath,'utf8'),manifest=JSON.parse(fs.readFileSync(manifestPath,'utf8')),sw=fs.readFileSync(swPath,'utf8');
html=html.replaceAll('<div class="logo">SH</div>','<div class="logo">FB</div>');
html=html.replace('<div class="stat"><small>Payable</small><b id="payable">₹0</b></div>','');
html=html.replace('<label>New 4–6 digit PIN<input id="changeAccountPin" type="password" inputmode="numeric" maxlength="6" placeholder="New PIN"></label>','<label>Current PIN<input id="currentAccountPin" type="password" inputmode="numeric" maxlength="6" placeholder="Enter current PIN"></label><label>New 4–6 digit PIN<input id="changeAccountPin" type="password" inputmode="numeric" maxlength="6" placeholder="New PIN"></label>');
app=app.replace("$('#payable').textContent=fmt(Math.abs(bs.filter(x=>x<0).reduce((a,b)=>a+b,0)));",'');
app=app.replace("return 'SH/'+fy+'/'+kind+'/'+String(n).padStart(4,'0')","return 'FB/'+fy+'/'+kind+'/'+String(n).padStart(4,'0')");
app=app.replace("filename='seva-hardware-'+currentUser.phone+'-backup-'","filename='free-bill-'+currentUser.phone+'-backup-'");
app=app.replace("title:'SEVA Hardware backup'","title:'Free Bill backup'");
const oldPinHandler="$('#changePinBtn').onclick=()=>{let pin=$('#changeAccountPin').value;if(!/^\\d{4,6}$/.test(pin)){toast('PIN 4 to 6 digits ka hona chahiye');return}let a=getAccounts(),i=a.findIndex(x=>x.phone===currentUser.phone);if(i<0)return;a[i].pin=pin;saveAccounts(a);currentUser=a[i];$('#changeAccountPin').value='';toast('Account PIN changed')};";
const newPinHandler="$('#changePinBtn').onclick=()=>{let oldPin=$('#currentAccountPin').value,pin=$('#changeAccountPin').value;if(oldPin!==currentUser.pin){toast('Current PIN is incorrect');return}if(!/^\\d{4,6}$/.test(pin)){toast('PIN 4 to 6 digits ka hona chahiye');return}let a=getAccounts(),i=a.findIndex(x=>x.phone===currentUser.phone);if(i<0)return;a[i].pin=pin;if(!saveAccounts(a))return;currentUser=a[i];$('#currentAccountPin').value='';$('#changeAccountPin').value='';toast('Account PIN changed')};";
if(!app.includes(oldPinHandler))throw Error('PIN handler source changed; refusing unsafe partial patch');
app=app.replace(oldPinHandler,newPinHandler);
core=core.replace("app: 'Seva Hardware Business Manager'","app: 'Free Bill'");
manifest.name='Free Bill';manifest.short_name='Free Bill';manifest.description='Free Bill offline billing and business management';
sw=sw.replace(/seva-hardware-v\d+/g,'free-bill-v3');
if(html.includes('id="payable"')||html.includes('<div class="logo">SH</div>'))throw Error('Old dashboard or logo branding remains');
if(!html.includes('id="currentAccountPin"'))throw Error('Current PIN verification field missing');
if(app.includes("return 'SH/'")||app.includes('seva-hardware-')||app.includes("title:'SEVA Hardware backup'"))throw Error('Old transaction or backup branding remains');
if(core.includes("Seva Hardware Business Manager"))throw Error('Old backup metadata remains');
if(manifest.name!=='Free Bill'||manifest.short_name!=='Free Bill'||sw.includes('seva-hardware'))throw Error('Manifest or service-worker branding is not updated');
fs.writeFileSync(cp,css);fs.writeFileSync(hp,html);fs.writeFileSync(ap,app);fs.writeFileSync(corePath,core);fs.writeFileSync(manifestPath,JSON.stringify(manifest,null,2)+'\n');fs.writeFileSync(swPath,sw);
console.log('Applied Free Bill branding, receivable-only dashboard, ranked product suggestions, Save / Save & New, and current-PIN verification.');
