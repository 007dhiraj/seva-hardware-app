# Free Bill — Development Roadmap

## Active focus
Stabilize the existing Android demo and address outdated-build confusion before adding more features.

## Milestones
1. **Reproducible build** — verify repository source, workflow, artifact naming, visible CI run/commit/build-time stamp (implemented).
2. **QA fixes** — run business-logic tests and emulator smoke tests; fix regressions.
3. **Core billing polish** — GST/non-GST mode, discounts, additional charges, invoice/ledger sharing, item/customer search and usability.
4. **Security & data** — salted PBKDF2 local PIN hashing + legacy migration (implemented); OTP, business-data encryption, cloud sync and tenant isolation remain planned.
5. **Release testing** — test APK on a real Android phone, backup/restore and PDF/share paths.

## Truthful current baseline
The current README describes a local-only app. Salted local PIN hashing is implemented and tested; OTP, cloud sync, multi-branch access, business-data encryption and full statutory GST compliance are not implemented yet. Each milestone must be verified before it is marked complete.
