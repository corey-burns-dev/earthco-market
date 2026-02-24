import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import type { Product } from "../types/models";
import { formatCurrency } from "../utils/format";

interface ProductCardProps {
  product: Product;
  onAddToCart: (productId: number) => void;
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  return (
    <motion.article
      className="product-card"
      whileHover={{ x: 3, y: 3 }}
      transition={{ duration: 0.15 }}
    >
      <Link to={`/product/${product.slug}`} className="product-image-wrap" aria-label={product.name}>
        <div className="product-id-tag">#{product.id.toString().padStart(3, "0")}</div>
        <img src={product.heroImage} alt={product.name} className="product-image" />
      </Link>
      <div className="product-meta">
        <div>
          <h3>{product.name}</h3>
          <p>{product.tagline}</p>
        </div>
        <strong>{formatCurrency(product.price)}</strong>
      </div>
      <div className="product-actions">
        <Link className="btn btn-light" to={`/product/${product.slug}`}>
          Inspect
        </Link>
        <button
          type="button"
          className="btn btn-dark"
          onClick={() => {
            onAddToCart(product.id);
          }}
        >
          Add to Cart
        </button>
      </div>
    </motion.article>
  );
}
