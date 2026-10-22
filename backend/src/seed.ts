import { ProductModel } from './models/Product.js';
import { INITIAL_PRODUCTS } from '@velora/shared';

/**
 * Seeds the existing 12 products into MongoDB only if the products collection is empty.
 * Prevents duplicate seeding by verifying existing document count and enforcing unique id indexes.
 */
export async function seedProductsIfEmpty(): Promise<{ seeded: boolean; count: number }> {
  try {
    const existingCount = await ProductModel.countDocuments();
    if (existingCount > 0) {
      console.log(`[Seed] Products collection already contains ${existingCount} item(s). Skipping seeding.`);
      return { seeded: false, count: existingCount };
    }

    // Exactly the existing 12 core products as specified
    const productsToSeed = INITIAL_PRODUCTS.slice(0, 12);
    console.log(`[Seed] Products collection is empty. Seeding ${productsToSeed.length} products...`);

    const inserted = await ProductModel.insertMany(productsToSeed, { ordered: true });
    console.log(`[Seed] Successfully seeded ${inserted.length} products into MongoDB.`);
    return { seeded: true, count: inserted.length };
  } catch (error: any) {
    // If a duplicate key error occurs due to concurrent execution, log warning safely
    if (error?.code === 11000) {
      console.warn('[Seed] Concurrent seed attempt detected (duplicate key). Collection already populated.');
      const currentCount = await ProductModel.countDocuments();
      return { seeded: false, count: currentCount };
    }
    console.error('[Seed] Error during product seeding:', error);
    throw error;
  }
}
