# Saves and sessions

Reviewed 2026-09-12. Entry points: public/progression.mjs; public/guest.mjs; server/api.mjs; server/identity.mjs. Related: level-editor.md (separate owner-only storage).

## Behavior and contracts

loadAccount always checks the server, even when the previous state was guest mode. Successful authentication loads account progress. Initial anonymous access may use guest storage. After an account session has been established, a subsequent 401 is surfaced as interrupted sign-in rather than silently switching to guest progress. The main menu shows the current storage mode and offers Refresh sign-in / progress.

Every started run pins its guest/account storage destination in memory. RunSave and pagehide checkpoints use that destination even if a later profile refresh changes menu mode. Existing guest run results stay local. No automatic guest/account coin merge occurs. Account checkpoints remain protected by server identity and ownership checks.

RunSave serializes checkpoints, retains pending account deliveries locally, and merges monotonically increasing progress before retrying. retryPending always contacts the account server. Server cumulative updates prevent repeated credits. Device recovery is a delivery aid, not authority for account balances.

## Review invariants

Never redirect an existing run into a different storage backend. Never turn a missing session into permission to save for another account. Do not clear unsent progress on transient failures. Do not silently merge guest balances or unlocks.

## Evidence and checks

Automated: tests/audit-save-fixes.test.mjs covers session restoration, existing guest run routing and later account-session loss. tests/save-ordering.test.mjs and progression.test.mjs cover checkpoints, ownership and repeated credits.

Manual next: iPhone sign-in interruption, refresh progress, verify visible account state; finish a guest run after restoring sign-in; retry a pending account save. Actual mobile/session-cookie behavior is not certified by Node tests.

## Stored data and limits

Run records contain cumulative results and unlock evidence, not resumable inventory/world snapshots. Keep Key and Last Bell eligibility require a closed courtyard run with at least 1,800 seconds; background checkpoints cannot grant them. Existing earned keys are retained. Account purchase ranks and run bonus snapshots are server-controlled. Checkpoint limits, closed-run handling and identity derivation are documented in [architecture](architecture-and-operations.md); reward/unlock aggregation is in [progression](characters-and-progression.md). Guest data is browser-local and is not automatically merged into an account. The complete 163-test suite passed during this documentation review on 2026-09-12.

## Starter roster update (2026-09-12)

Migration 0008 adds mastery (bits 1/2/4/8) and transforms (Sabbath bit 1), defaulting to zero. Checkpoints validate integer masks and merge by bitwise OR until closed; RunSave also retains these in pending retries. Four new hero metrics require closed runs. Existing saves without weapon evidence remain valid but do not retroactively earn these unlocks.
