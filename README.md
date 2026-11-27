# Free Bill — Android billing app

This repository builds a **debug-signed APK for direct Android installation**. It does not build an AAB or publish anything to Google Play.

## Features in this offline build

- Local mobile-number + PIN account on one device (no OTP); PINs use salted PBKDF2-SHA256 hashes (120,000 iterations), and the login screen is shown on each cold app start instead of auto-signing in.
- Sales invoices: cash, credit and sale-return entries; amount/percentage discounts; optional hamali, delivery, packaging/box or other charges with a separately entered GST rate; invoice IDs by financial year; print/share bill details and WhatsApp message hand-off.
- Purchase entries with amount/percentage discounts, optional additional charges and a separately entered GST rate; supplier records and stock updates (new purchased products are added to the product list).
- Product master with unit, HSN, opening stock, low-stock level, sale/purchase rates and editable GST percentage.
- Customer/supplier records, party ledgers, receipts and payments.
- Expenses, dashboard with current-month net sales and percentage change vs the previous month, basic period reports; CSV export.
- JSON backup and restore. Restore validates the backup type/account, asks for confirmation before replacing data, and leaves current records unchanged if cancelled or if storage rejects the write. Backup metadata intentionally excludes the local account PIN.
- CSV export includes subtotal, discount, taxable value, additional charges, charge GST, total GST, total and paid amount.
- Android back navigation through the in-app page history.

The app's web source and Node tests are stored as a compressed source bundle in the hidden `.source-bundle` parts. The build workflow reassembles the bundle automatically before testing and packaging.

## Build and download the APK

1. Open the repository on GitHub and choose **Actions**.
2. Open **Build Free Bill installable APK**.
3. Select **Run workflow** (or wait for the build after a commit).
4. Wait until the run is green. The workflow runs Node business-logic tests, builds the APK, checks its Android package ID, installs and launches it on an Android emulator, then uploads the APK artifact.
5. Open the successful run, scroll to **Artifacts**, and download **Free-Bill-Android-APK**. Extract the ZIP; the install file is named `Free-Bill-Android.apk`.
6. Extract the downloaded ZIP on your Android phone, tap `app-debug.apk`, and allow **Install unknown apps** for the app (Chrome or Files) if Android asks.
7. Open **Free Bill**, create a local account with your mobile number and a 4–6 digit PIN, and keep that PIN private.

Open **More → Settings & Backup → Build information** to see the CI run number, source commit and build time; compare these when checking whether an APK is outdated. The APK is named `Free-Bill-Android.apk` and is debug-signed for direct testing/installation. It is not a Play Store release. If a previous version is already installed with a different signing key, Android may require uninstalling that old version first; uninstalling removes its local app data, so export a backup first.

## Backup and restore

- Open **More → Backup & Restore** (Settings & Backup) or use the **Backup** button in the top bar.
- On Android, use the share sheet to save the JSON backup to Files/Drive or send it to a private location. Keep it confidential.
- To restore, select the backup JSON file from **Restore backup**. Restore replaces the current account data.
- Export backups regularly and before app updates, phone replacement, clearing app storage, or uninstalling. Test a backup on a spare device before relying on it.

## Important limitations and privacy

- **No cloud database, no multi-branch login, and no automatic cross-device sync** are implemented in this build. Each local account and all business records live in this app's storage on this phone.
- There is no OTP verification or Forgot-PIN recovery. PINs use salted PBKDF2-SHA256 hashes; older local accounts upgrade after successful login. Business records are still not encrypted by this version. Anyone with access to the phone's app storage may be able to access them.
- Uninstalling the app or clearing app data can permanently delete local records. Keep independent backups.
- GST totals are basic estimates from the per-item GST percentage and selected intra/inter-state mode. The app does not validate GSTIN, HSN, place of supply, eligibility, discount conditions, exemptions, reverse charge, cess, e-invoice, e-way bill, returns or filing. The discount is treated as reducing the item taxable value. Additional charges are shown separately and use a user-entered GST rate; some incidental charges may legally form part of the taxable value or require the same rate as the underlying supply. Confirm the correct treatment, rate and invoice wording with a qualified GST professional before issuing tax invoices or filing returns. Have a qualified GST professional verify rates and invoice wording before issuing tax invoices or filing returns. This is not a statutory accounting/GST filing system.
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
