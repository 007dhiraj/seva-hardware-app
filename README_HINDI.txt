SEVA HARDWARE — ANDROID BILLING APP

इस repository से सीधे Android फोन में install होने वाली debug APK बनती है। Play Store या AAB नहीं बनता।

मौजूदा सुविधाएँ:
- Mobile number + 4–6 digit PIN से इसी फोन पर local account
- Cash bill, credit bill और sale return
- Purchase entry और purchase के समय नया product अपने-आप stock list में जुड़ना
- Product, unit, HSN, opening stock, low-stock level, purchase/sale rate और editable GST प्रतिशत
- Customer/Supplier, party ledger, receipt और payment entries
- Expenses, dashboard, basic reports और CSV export
- JSON backup और restore; backup file में account PIN शामिल नहीं किया जाता
- Financial-year transaction IDs और Android page-back navigation

APK डाउनलोड/इंस्टॉल:
1. GitHub repository खोलें: 007dhiraj/seva-hardware-app
2. Actions → “Build SEVA Hardware installable APK” खोलें।
3. Run workflow दबाएँ या main पर commit के बाद आने वाला run खोलें।
4. Run green/success होने और emulator install/launch check पूरा होने दें।
5. Artifacts में SEVA-Hardware-Android-APK ZIP डाउनलोड करें।
6. ZIP extract करके app-debug.apk पर tap करें। Android पूछे तो Chrome/Files के लिए Install unknown apps अनुमति दें।
7. App में अपना mobile number और PIN बनाएं।

Backup:
More → Settings & Backup → Download full backup चुनें। Android share sheet से JSON file को Files/Drive में सुरक्षित रखें। Restore backup से वही JSON file चुनें; restore मौजूदा account data replace करता है।

महत्वपूर्ण सीमाएँ:
- Cloud database, multi-branch login और automatic sync अभी लागू नहीं हैं। हर account का data इसी फोन में रहता है।
- OTP नहीं है और business data encrypted नहीं है। PIN केवल local convenience protection है।
- App uninstall या app data clear करने पर records मिट सकते हैं। नियमित backup रखें।
- GST हिसाब basic है। App GSTIN/HSN/place-of-supply/eligibility/discount rules या statutory returns validate नहीं करता। सही tax treatment और invoice compliance CA/GST professional से जाँचें।
- Reports operational summary हैं, audited P&L या statutory accounting नहीं।
- APK debug-signed है; Play Store release नहीं।
