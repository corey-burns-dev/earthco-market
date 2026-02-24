import { PrismaClient, ProductCategory } from "@prisma/client";

const prisma = new PrismaClient();

const products = [
  {
    id: 1,
    slug: "terra-boots",
    name: "TERRA.BOOTS",
    tagline: "All-terrain daily boot",
    description:
      "Structured leather upper with weather-ready sole and recycled lining, built for city gravel and weekend trail loops.",
    price: 195,
    category: ProductCategory.FOOTWEAR,
    accent: "#c9a87c",
    heroImage:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=1200",
    gallery: [
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&q=80&w=1200"
    ],
    stock: 17,
    rating: 4.8
  },
  {
    id: 2,
    slug: "moss-jacket",
    name: "MOSS.JACKET",
    tagline: "Insulated utility shell",
    description:
      "Relaxed cut field jacket with breathable insulation and storm flap, tuned for wind, mist, and layered winter fits.",
    price: 145,
    category: ProductCategory.OUTERWEAR,
    accent: "#7a8b5c",
    heroImage:
      "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&q=80&w=1200",
    gallery: [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1539533113208-f6df8cc8b543?auto=format&fit=crop&q=80&w=1200"
    ],
    stock: 12,
    rating: 4.6
  },
  {
    id: 3,
    slug: "clay-bag",
    name: "CLAY.BAG",
    tagline: "Expandable crossbody",
    description:
      "Modular interior and matte waxed canvas shell. Carries laptop, market haul, and weekend essentials in one clean block.",
    price: 85,
    category: ProductCategory.BAGS,
    accent: "#c67a4a",
    heroImage:
      "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&q=80&w=1200",
    gallery: [
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=1200"
    ],
    stock: 20,
    rating: 4.7
  },
  {
    id: 4,
    slug: "stone-shades",
    name: "STONE.SHADES",
    tagline: "Mineral tint eyewear",
    description:
      "UV400 polarized lenses set in sculpted acetate frames. Sharp silhouette designed for bright noon light.",
    price: 155,
    category: ProductCategory.ACCESSORIES,
    accent: "#8b7355",
    heroImage:
      "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&q=80&w=1200",
    gallery: [
      "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&q=80&w=1200"
    ],
    stock: 9,
    rating: 4.5
  },
  {
    id: 5,
    slug: "loam-knit",
    name: "LOAM.KNIT",
    tagline: "Textured heavyweight crew",
    description:
      "Dense organic cotton knit with ribbed architecture and dropped shoulder. Warm hand-feel with minimal lint.",
    price: 110,
    category: ProductCategory.ESSENTIALS,
    accent: "#a9896b",
    heroImage:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=1200",
    gallery: [
      "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&q=80&w=1200"
    ],
    stock: 28,
    rating: 4.6
  },
  {
    id: 6,
    slug: "basalt-pack",
    name: "BASALT.PACK",
    tagline: "Commuter roll-top",
    description:
      "Abrasion-resistant body with welded seams and quick-release top closure. Built for daily laptop and camera carry.",
    price: 135,
    category: ProductCategory.BAGS,
    accent: "#5c6b52",
    heroImage:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=1200",
    gallery: [
      "https://images.unsplash.com/photo-1595341888016-a392ef81b7de?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1483982258113-b72862e6cff6?auto=format&fit=crop&q=80&w=1200"
    ],
    stock: 14,
    rating: 4.8
  },
  {
    id: 7,
    slug: "spruce-parka",
    name: "SPRUCE.PARKA",
    tagline: "Longline weather shell",
    description:
      "Extended hem and seam-sealed hood with matte hardware. A functional silhouette for cold rain and urban wind.",
    price: 230,
    category: ProductCategory.OUTERWEAR,
    accent: "#66754f",
    heroImage:
      "https://images.unsplash.com/photo-1521223890158-f9f7c3d5d504?auto=format&fit=crop&q=80&w=1200",
    gallery: [
      "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?auto=format&fit=crop&q=80&w=1200"
    ],
    stock: 7,
    rating: 4.9
  },
  {
    id: 8,
    slug: "ochre-socks",
    name: "OCHRE.SOCKS",
    tagline: "Merino trail pair",
    description:
      "Cushioned heel, ventilated toe box, and anti-slip arch support. Designed for long walks and all-day boots.",
    price: 28,
    category: ProductCategory.ESSENTIALS,
    accent: "#c69d5a",
    heroImage:
      "https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?auto=format&fit=crop&q=80&w=1200",
    gallery: [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?auto=format&fit=crop&q=80&w=1200"
    ],
    stock: 41,
    rating: 4.4
  }
];

async function main() {
  for (const product of products) {
    await prisma.product.upsert({
      where: { id: product.id },
      update: product,
      create: product
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
