/**
 * Example unit tests for PayPal helpers.
 *
 * Run: npm test
 *
 * These tests call pure functions only — no network, no env secrets, no DB.
 * When you add more payment tests, prefer this style: fixture in → assert out.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { getCapturedAmount } from './paypalService.js';

describe('getCapturedAmount', () => {
    it('returns 0 when capture result is empty', () => {
        assert.equal(getCapturedAmount(null), 0);
        assert.equal(getCapturedAmount({}), 0);
        assert.equal(getCapturedAmount({ purchase_units: [] }), 0);
    });

    it('sums COMPLETED captures from a single purchase unit', () => {
        const captureResult = {
            purchase_units: [
                {
                    payments: {
                        captures: [
                            { status: 'COMPLETED', amount: { value: '9.99' } },
                        ],
                    },
                },
            ],
        };
        assert.equal(getCapturedAmount(captureResult), 9.99);
    });

    it('includes PENDING captures (money may still settle)', () => {
        const captureResult = {
            purchase_units: [
                {
                    payments: {
                        captures: [
                            { status: 'PENDING', amount: { value: '4.50' } },
                        ],
                    },
                },
            ],
        };
        assert.equal(getCapturedAmount(captureResult), 4.5);
    });

    it('sums multiple captures across units', () => {
        const captureResult = {
            purchase_units: [
                {
                    payments: {
                        captures: [
                            { status: 'COMPLETED', amount: { value: '5.00' } },
                            { status: 'COMPLETED', amount: { value: '2.25' } },
                        ],
                    },
                },
                {
                    payments: {
                        captures: [
                            { status: 'COMPLETED', amount: { value: '1.00' } },
                        ],
                    },
                },
            ],
        };
        assert.equal(getCapturedAmount(captureResult), 8.25);
    });

    it('ignores non-completed capture statuses', () => {
        const captureResult = {
            purchase_units: [
                {
                    payments: {
                        captures: [
                            { status: 'DECLINED', amount: { value: '99.00' } },
                            { status: 'COMPLETED', amount: { value: '3.00' } },
                        ],
                    },
                },
            ],
        };
        assert.equal(getCapturedAmount(captureResult), 3);
    });
});
