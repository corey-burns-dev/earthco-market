import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, ProductCategory } from "@prisma/client";
import dotenv from "dotenv";
import { products as storefrontProducts } from "../../src/data/products";

dotenv.config();

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("Missing required env var: DATABASE_URL");
}

const adapter = new PrismaPg({ connectionString: databaseUrl });
const prisma = new PrismaClient({ adapter });

const categoryMap: Record<string, ProductCategory> = {
  OUTERWEAR: ProductCategory.OUTERWEAR,
  FOOTWEAR: ProductCategory.FOOTWEAR,
  BAGS: ProductCategory.BAGS,
  ACCESSORIES: ProductCategory.ACCESSORIES,
  ESSENTIALS: ProductCategory.ESSENTIALS,
};

const products = storefrontProducts.map((product) => ({
  ...product,
  category: categoryMap[product.category],
}));

async function main() {
  for (const product of products) {
    await prisma.product.upsert({
      where: { id: product.id },
      update: product,
      create: product,
    });
  }

  console.log(`Seeded ${products.length} products.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
