import DisplayCard from './DisplayCard'

export default function DisplayGrid({products = []}) {

  return (
    <div className="collection-grid">
      {products.length > 0 ? (
        products.map(product => {
          return <DisplayCard key={product.id} product={product} />
      })) : (
        <p>No products found matching your filters.</p>
      )}
    </div>
  )
}