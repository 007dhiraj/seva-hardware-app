# SEVA Hardware — Android billing app

This repository builds a **debug-signed APK for direct Android installation**. It does not build an AAB or publish anything to Google Play.

## Features in this offline build

- Local mobile-number + PIN account on one device (no OTP).
- Sales invoices: cash, credit and sale-return entries; invoice IDs by financial year; print/share bill details and WhatsApp message hand-off.
- Purchase entries, supplier records and stock updates (new purchased products are added to the product list).
- Product master with unit, HSN, opening stock, low-stock level, sale/purchase rates and editable GST percentage.
- Customer/supplier records, party ledgers, receipts and payments.
- Expenses, dashboard and basic period reports; CSV export.
- JSON backup and restore. Backup metadata intentionally excludes the local account PIN.
- Android back navigation through the in-app page history.

The app's web source and Node tests are kept in `SEVA_Hardware_Project_Source.tar.gz`; the build workflow extracts them before testing and packaging.

## Build and download the APK

1. Open the repository on GitHub and choose **Actions**.
2. Open **Build SEVA Hardware installable APK**.
3. Select **Run workflow** (or wait for the build after a commit).
4. Wait until the run is green. The workflow runs Node business-logic tests, builds the APK, checks its Android package ID, installs and launches it on an Android emulator, then uploads the APK artifact.
5. Open the successful run, scroll to **Artifacts**, and download **SEVA-Hardware-Android-APK**.
6. Extract the downloaded ZIP on your Android phone, tap `app-debug.apk`, and allow **Install unknown apps** for the app (Chrome or Files) if Android asks.
7. Open **SEVA Hardware**, create a local account with your mobile number and a 4–6 digit PIN, and keep that PIN private.

The APK is debug-signed for direct testing/installation. It is not a Play Store release. If a previous version is already installed with a different signing key, Android may require uninstalling that old version first; uninstalling removes its local app data, so export a backup first.

## Backup and restore

- Open **More → Backup & Restore** (Settings & Backup) or use the **Backup** button in the top bar.
- On Android, use the share sheet to save the JSON backup to Files/Drive or send it to a private location. Keep it confidential.
- To restore, select the backup JSON file from **Restore backup**. Restore replaces the current account data.
- Export backups regularly and before app updates, phone replacement, clearing app storage, or uninstalling. Test a backup on a spare device before relying on it.

## Important limitations and privacy

- **No cloud database, no multi-branch login, and no automatic cross-device sync** are implemented in this build. Each local account and all business records live in this app's storage on this phone.
- There is no OTP verification. The PIN is a local convenience lock/account check, not strong authentication. Business records are not encrypted by this version. Anyone with access to the unlocked phone/app storage may be able to access them.
- Uninstalling the app or clearing app data can permanently delete local records. Keep independent backups.
- GST totals are basic estimates from the per-item GST percentage and selected intra/inter-state mode. The app does not validate GSTIN, HSN, place of supply, eligibility, discount conditions, exemptions, reverse charge, cess, e-invoice, e-way bill, returns or filing. The discount is treated as reducing the taxable value; confirm whether that treatment is legally applicable to each transaction. Have a qualified GST professional verify rates and invoice wording before issuing tax invoices or filing returns. This is not a statutory accounting/GST filing system.
- Reports are operational summaries, not audited accounts or a statutory Profit & Loss statement.
- WhatsApp actions open a prepared message/chat; the user must review and send it. The app does not send messages automatically.

## Developer checks

```bash
npm install
npm test
node --check www/business-core.js
node --check www/app.js
npx cap add android
npx cap sync android
cd android && ./gradlew assembleDebug
```

The installable debug APK is created at `android/app/build/outputs/apk/debug/app-debug.apk`.
