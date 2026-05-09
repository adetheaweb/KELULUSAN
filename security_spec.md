# Security Specification for SI Lulus

## Data Invariants
1. A student's NISN must be unique (though Firestore doesn't enforce this natively, our rules should ensure it's not spoofed).
2. Graduation status must be either 'LULUS' or 'TIDAK LULUS'.
3. Only authorized administrators (verified email: ayobelajar4y0@gmail.com) can create or update student data.
4. Students can search and read their own data if they know their NISN or Name.

## The "Dirty Dozen" Payloads (Testing Denials)
1. **Unauthenticated Write**: Creating a student record without being logged in.
2. **Identity Spoofing**: Logged in as user B, trying to create a record for user A.
3. **Invalid Status**: Setting status to "LULUS_BANGET" (not in enum).
4. **Huge Payload**: Injecting 1MB of junk into the `nama` field.
5. **PII Leak**: Attempting to list ALL students without a search filter.
6. **Shadow Field**: Adding `isVerified: true` to a student document.
7. **Bypass Search**: Trying to 'get' a document ID directly without knowing the NISN/Name.
8. **Spoofed Admin**: Logged in as someone else, trying to update a record.
9. **Invalid ID**: Creating a document with a 2KB garbage ID.
10. **Immutable Field**: Attempting to change `updatedAt` to a past date (must use request.time).
11. **Malicious Link**: Injecting a `javascript:` URL into `certificateUrl`.
12. **Anonymous Access**: Writing data as an anonymous user (if restricted to verified emails).

## Test Runner Expectations
The `firestore.rules.test.ts` will verify that all the above payloads return `PERMISSION_DENIED`.
