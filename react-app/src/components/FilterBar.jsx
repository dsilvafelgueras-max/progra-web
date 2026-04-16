export default function FilterBar({ categories, activeCategory, onSelectCategory }) {
  return (
    <div className="filter-bar" role="toolbar" aria-label="Filtros">
      {categories.map((category) => (
        <button
          key={category}
          type="button"
          className={category === activeCategory ? "is-active" : ""}
          onClick={() => onSelectCategory(category)}
        >
          {category}
        </button>
      ))}
    </div>
  );
}
