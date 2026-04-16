export default function ProductCard({ product, price, onAdd }) {
  return (
    <article className="product-card-react">
      <div className="product-image-react">
        <img src={product.image} alt={product.name} />
      </div>
      <div className="product-copy-react">
        <p>{product.category}</p>
        <h3>{product.name}</h3>
        <span>{price}</span>
      </div>
      <button type="button" onClick={() => onAdd(product.id)}>
        Agregar
      </button>
    </article>
  );
}
