SEVA HARDWARE BUSINESS MANAGER — ANDROID SOURCE PROJECT

इस ZIP में:
- www/ : पूरा HTML, CSS, JavaScript ऐप source
- Capacitor config और package.json
- Android Studio से APK बनाने की instructions

मुख्य फीचर्स:
- Offline local mobile-number + PIN account
- एक बार login के बाद persistent local session
- हर मोबाइल नंबर के लिए अलग local database
- GST / Non-GST billing, products, stock, customers, suppliers, khata,
  purchase, receipts/payments, expenses, reports
- Manual JSON backup और restore
- Financial-year transaction IDs:
  SH/25-26/S/0001 = Sale
  SH/25-26/R/0001 = Sale Return
  SH/25-26/PUR/0001 = Purchase
  SH/25-26/RCV/0001 = Receipt
  SH/25-26/PAY/0001 = Payment
  SH/25-26/EXP/0001 = Expense
- हर financial year (1 April से 31 March) और transaction type की numbering अलग शुरू होती है।\n- Party/Customer Ledger में sales, purchases, receipts और payments की transaction ID सहित history दिखती है।

महत्वपूर्ण सीमाएँ:
1. इस build environment में Android SDK, Gradle और Android Studio उपलब्ध नहीं थे,
   इसलिए यहाँ compiled APK बनाना/verify करना संभव नहीं हुआ। यह पूरा editable source
   project है जिसे Android Studio वाले computer पर APK में build किया जा सकता है।
2. Local login में OTP verification नहीं है। Mobile number सिर्फ local account ID है।
3. Accounts और business data इसी device/app storage में रहते हैं। App uninstall या
   app data clear होने पर data मिट सकता है। Backup नियमित रूप से export करें।
4. यह अभी multi-device cloud account system नहीं है। अलग फोन पर restore करके
   data ले जा सकते हैं; automatic sync नहीं है।
5. PIN local storage में basic protection के रूप में है, encryption नहीं।
6. GST calculations basic हैं; statutory GST compliance, e-invoice, e-way bill,
   GSTR filing और accountant review की जरूरत वाले नियमों के लिए certified solution
   का विकल्प नहीं है।

APK बनाने के लिए:
1. Computer पर Node.js LTS और Android Studio install करें।
2. इस project folder में terminal खोलें।
3. Run: npm install
4. Run: npx cap add android
5. Run: npx cap sync android
6. Run: npx cap open android
7. Android Studio में Build > Build Bundle(s) / APK(s) > Build APK(s)
8. Debug APK आम तौर पर android/app/build/outputs/apk/debug/app-debug.apk में बनेगा।

भविष्य में www/ के index.html, style.css और app.js edit करें, फिर:
npx cap sync android
और Android Studio से दोबारा APK build करें।

CUSTOMER BILL SHARING:
- Party ledger shows every sale, purchase, receipt and payment as a separate transaction.
- Each sale has its own View Bill and WhatsApp action.
- Enter the customer's mobile number. WhatsApp opens the matching chat with a prepared bill summary.
- To send a PDF: open the bill > Print / Save as PDF > save on the phone > attach the saved PDF in WhatsApp.
- Offline mode cannot silently send a PDF to WhatsApp. Automatic sending requires internet, a WhatsApp Business API service and customer opt-in.
