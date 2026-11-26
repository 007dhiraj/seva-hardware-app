# Free Bill Android App

यह repository सीधे Android फोन में install होने वाली debug APK बनाती है। Play Store पर publish नहीं किया जाता और AAB नहीं बनता।

## APK कैसे डाउनलोड करें
1. GitHub repository खोलें: https://github.com/007dhiraj/seva-hardware-app
2. **Actions** tab खोलें।
3. **Build Free Bill installable APK** workflow चुनें।
4. Run को **success** होने दें। Emulator install/launch जाँच भी पूरी होनी चाहिए।
5. Successful run खोलें और **Artifacts → Free-Bill-Android-APK** ZIP डाउनलोड करें।
6. ZIP extract करके `app-debug.apk` पर tap करें। Android पूछे तो Files/Chrome के लिए **Install unknown apps** अनुमति दें।
7. Free Bill खोलकर अपना mobile number और local PIN बनाएं।

## इस offline build की सुविधाएँ
Sales cash/credit/return invoices, sales और purchase discounts, hamali/delivery/packaging/other additional charges (अलग GST rate के साथ), purchase entries, product/inventory, customer/supplier records, party ledgers, receipts/payments, expenses, dashboard current-month net sales और पिछले महीने से percentage change, basic reports, detailed CSV export, JSON backup/restore और Android back navigation।

## Backup और restore
More → Settings & Backup → Download full backup चुनें। Android share sheet से JSON backup को Files/Drive में सुरक्षित रखें। Restore backup में JSON file चुनें; restore मौजूदा account data replace करता है। Phone बदलने, app update करने या uninstall करने से पहले backup लें।

## Data, privacy और GST की सीमाएँ
- Data इसी फोन के app storage में रहता है। Cloud database, multi-branch login और automatic cross-device sync अभी लागू नहीं हैं।
- OTP और Forgot-PIN recovery नहीं है। PIN salted PBKDF2-SHA256 hash (120,000 iterations) में रहता है; पुराने accounts सफल login पर upgrade होते हैं। Business records encrypted नहीं हैं।
- App uninstall या app data clear करने पर records मिट सकते हैं। नियमित backup रखें।
- GST calculations basic estimates हैं। Additional charges का GST rate user अलग से भरता है; कुछ incidental charges कानून के अनुसार taxable value का हिस्सा हो सकते हैं। सही GST treatment CA/GST professional से verify करें। GSTIN, HSN, place of supply, exemptions, reverse charge, cess, e-invoice/e-way bill और statutory returns validate नहीं होते। सही GST treatment और invoice compliance CA/GST professional से verify करें।
- Reports operational summaries हैं, audited accounts नहीं। WhatsApp action केवल message/chat खोलता है; send user को खुद करना है।
- APK debug-signed है और direct testing/installation के लिए है; Play Store release नहीं।
