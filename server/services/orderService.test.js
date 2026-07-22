/**
 * Example unit tests for order normalization (the security-critical cart math).
 *
 * Run: npm test
 *
 * Product.findOne is not hit — we inject a fake `findProduct` so tests stay
 * fast and offline. Copy this pattern when testing other DB-backed helpers:
 * pass a stub instead of connecting to MongoDB.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
    normalizeOrderItems,
    MAX_QUANTITY_PER_LINE,
} from './orderService.js';

/** Fake catalog used only in these tests */
const FAKE_CATALOG = {
    'aurora-pack': {
        id: 1,
        slug: 'aurora-pack',
        title: 'Aurora Pack',
        price: 12.5,
        fullGallery: ['https://cdn.example/a1.jpg', 'https://cdn.example/a2.jpg'],
        coverImage: 'https://cdn.example/cover-a.jpg',
    },
    'neon-city': {
        id: 2,
        slug: 'neon-city',
        title: 'Neon City',
        price: 7,
        fullGallery: ['https://cdn.example/n1.jpg'],
        coverImage: 'https://cdn.example/cover-n.jpg',
    },
};

async function findProduct(slug) {
    return FAKE_CATALOG[slug] || null;
}

describe('normalizeOrderItems', () => {
    it('rejects empty or missing items', async () => {
        await assert.rejects(
            () => normalizeOrderItems([], { findProduct }),
            (err) => err.statusCode === 400
        );
        await assert.rejects(
            () => normalizeOrderItems(null, { findProduct }),
            (err) => err.statusCode === 400
        );
    });

    it('rejects unknown product slugs (no client price fallback)', async () => {
        await assert.rejects(
            () =>
                normalizeOrderItems(
                    [{ slug: 'does-not-exist', price: 0.01, title: 'Hack' }],
                    { findProduct }
                ),
            (err) =>
                err.statusCode === 400 &&
                /not found/i.test(err.message)
        );
    });

    it('uses DB price and gallery, ignoring client-supplied values', async () => {
        const { normalizedItems, totalAmount } = await normalizeOrderItems(
            [
                {
                    slug: 'aurora-pack',
                    // Attacker tries to underpay and steal gallery URLs
                    price: 0.01,
                    title: 'Fake title',
                    fullGallery: ['https://evil.example/stolen.jpg'],
                    quantity: 1,
                },
            ],
            { findProduct }
        );

        assert.equal(normalizedItems.length, 1);
        assert.equal(normalizedItems[0].price, 12.5);
        assert.equal(normalizedItems[0].title, 'Aurora Pack');
        assert.deepEqual(normalizedItems[0].fullGallery, [
            'https://cdn.example/a1.jpg',
            'https://cdn.example/a2.jpg',
        ]);
        assert.equal(totalAmount, 12.5);
    });

    it('sums line totals across multiple products', async () => {
        const { totalAmount, normalizedItems } = await normalizeOrderItems(
            [
                { slug: 'aurora-pack', quantity: 1 },
                { slug: 'neon-city', quantity: 2 },
            ],
            { findProduct }
        );

        // 12.50 + (7 * 2) = 26.50
        assert.equal(totalAmount, 26.5);
        assert.equal(normalizedItems[1].quantity, 2);
    });

    it('caps quantity per line', async () => {
        const { normalizedItems } = await normalizeOrderItems(
            [{ slug: 'neon-city', quantity: 999 }],
            { findProduct }
        );
        assert.equal(normalizedItems[0].quantity, MAX_QUANTITY_PER_LINE);
    });

    it('defaults invalid quantity to 1', async () => {
        const { normalizedItems } = await normalizeOrderItems(
            [{ slug: 'neon-city', quantity: -3 }],
            { findProduct }
        );
        assert.equal(normalizedItems[0].quantity, 1);
    });
});
