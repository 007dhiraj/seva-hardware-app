# Seva Hardware Android App

यह repository direct-install Android debug APK बनाती है। Play Store पर publish नहीं किया जाता।

## APK कैसे लें
1. GitHub में **Actions** खोलें।
2. **Build SEVA Hardware installable APK** चुनें।
3. **Run workflow** दबाएँ।
4. Successful run में **Artifacts → SEVA-Hardware-Android-APK** ZIP डाउनलोड करें।
5. ZIP extract करें और `app-debug.apk` install करें। Android के Install unknown apps prompt में Files/Chrome को अनुमति दें।

## App में क्या है
Sales cash/credit/return invoices, GST percentage configuration and basic calculations, purchase entries, stock/product list, customers/suppliers and ledgers, receipts/payments, expenses, reports, CSV export, JSON backup/restore.

## Backup
Settings & Backup में Download full backup चुनें और JSON file को सुरक्षित Files/Drive location में save करें। Restore मौजूदा local account data replace करता है।

## Data and GST caveats
Data इसी device पर रहता है। Cloud database, multi-branch logins और automatic sync अभी नहीं हैं। OTP नहीं है और business records encrypted नहीं हैं। App uninstall/data clear करने पर data जा सकता है। GST calculations indicative हैं; HSN, GST rate, place of supply, discount eligibility और invoice rules CA/GST professional से verify करें। यह statutory GST filing/accounting software नहीं है।
