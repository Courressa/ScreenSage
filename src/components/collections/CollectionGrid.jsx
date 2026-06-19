import { products } from '../../data/data'
import CollectionCard from './CollectionCard'

export default function CollectionGrid() {
  return (
    <div className="collection-grid">
      {products.map((product) => {
        if (product.type === 'collection') {
          return <CollectionCard key={product.id} collection={product} />
        }
      })}
    </div>
  )
}