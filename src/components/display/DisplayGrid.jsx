import DisplayCard from './DisplayCard.jsx'

export default function DisplayGrid({products = []}) {

  return (
    <div className="display-grid">
      {products.length > 0 ? (
        products.map(product => {
          return <DisplayCard key={product.id} product={product} />
      })) : (
        <p>No products found matching your filters.</p>
      )}
    </div>
  )
}