# Security Specification: Libra Firestore Security

## 1. Data Invariants
1. **Unauthenticated Access**: Unauthenticated users can read public catalog data (`books`, `categories`, `shelves`) for general browsing, but CANNOT perform any write/delete operations.
2. **Member Profile Integrity**: Members can only update their own profile data, cannot escalate their role to `admin` or clear their own `isSuspended` state.
3. **Booking Integrity**: Bookings require valid `bookId` and `memberId`. Members can only view their own bookings or active hold status.
4. **Loan Sirkulasi Control**: Only authorized staff/admin can create and finalize loan returns or alter loan status. Members can read their own loans.
5. **Admin Access**: Bootstrap admin (`azzackey@gmail.com`) and designated admin accounts have full management permissions across books, categories, shelves, members, and notifications.

## 2. The Dirty Dozen Payloads (Security Attack Tests)
1. **Payload 1 (Ghost Field Injection on Book)**: Injecting `{ "isSecret": true, "backdoor": "x" }` into `/books/{bookId}` -> `PERMISSION_DENIED`.
2. **Payload 2 (Unauthenticated Book Delete)**: Anonymous caller attempting `DELETE /books/B001` -> `PERMISSION_DENIED`.
3. **Payload 3 (Role Escalation Attack)**: Member updating `/members/{memberId}` with `{ "role": "admin" }` -> `PERMISSION_DENIED`.
4. **Payload 4 (Un-suspension Self Bypass)**: Suspended member setting `{ "isSuspended": false }` -> `PERMISSION_DENIED`.
5. **Payload 5 (ID Path Poisoning)**: Creating book with 2000-char path ID `/%20%20...` -> `PERMISSION_DENIED`.
6. **Payload 6 (Oversized Synopsis Attack / Denial of Wallet)**: Setting `synopsis` to 50KB payload exceeding max length -> `PERMISSION_DENIED`.
7. **Payload 7 (Spoofed Booking Member ID)**: User A booking with User B's `memberId` -> `PERMISSION_DENIED`.
8. **Payload 8 (Unauthorized Loan Completion)**: Regular member attempting to update `/loans/{loanId}` to `{ "status": "returned" }` -> `PERMISSION_DENIED`.
9. **Payload 9 (Forged Shelf Capacity)**: Non-admin altering shelf physical capacity `/shelves/{shelfId}` -> `PERMISSION_DENIED`.
10. **Payload 10 (Notification Log Tampering)**: Standard user deleting or modifying audit `/notifications/{id}` -> `PERMISSION_DENIED`.
11. **Payload 11 (Negative Stock Injection)**: Updating `availableCopies` to negative value -> `PERMISSION_DENIED`.
12. **Payload 12 (Category Hijack)**: Unauthenticated user modifying `/categories/{categoryId}` -> `PERMISSION_DENIED`.
