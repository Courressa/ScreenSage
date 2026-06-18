import { collections } from '../../data/data'
import CollectionCard from './CollectionCard'

export default function CollectionGrid() {
  return (
    <div className="collection-grid">
      {collections.map((collection) => (
        <CollectionCard key={collection.id} collection={collection} />
      ))}
    </div>
  )
}