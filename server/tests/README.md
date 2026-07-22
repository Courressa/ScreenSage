# Server unit tests (examples)

## Run

```bash
npm test
```

Uses Node’s built-in test runner (`node:test`) — no Vitest/Jest install required.

## What’s covered (examples for you to copy)

| File | What it tests | Why it matters |
|------|----------------|----------------|
| `server/services/paypalService.test.js` | `getCapturedAmount` | Correct paid amount after PayPal capture |
| `server/services/orderService.test.js` | `normalizeOrderItems` | Server trusts **DB** prices/galleries, not the client |

## How to add another unit test

1. Put logic you care about in a **pure** function (or accept injected deps like `findProduct`).
2. Create `something.test.js` next to the module (or under `server/tests/`).
3. Import `describe` / `it` from `node:test` and `assert` from `node:assert/strict`.
4. Add the file path to the `"test"` script in `package.json` if it isn’t already matched.

```js
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { myHelper } from './myModule.js';

describe('myHelper', () => {
  it('does the thing', () => {
    assert.equal(myHelper(1), 2);
  });
});
```

## What not to unit-test first

- Full Express controllers with real Stripe/PayPal network calls → integration tests later.
- React checkout UI → optional later (Vitest + Testing Library).

## Reminder (post-assignment)

Look into later: signed/expiring Cloudinary URLs and gated downloads so full files aren’t permanent public CDN links even after catalog hardening.
