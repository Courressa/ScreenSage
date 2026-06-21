import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Filter from "../components/filter/Filter";
import { products } from "../data/data";
import DisplayGrid from "../components/display/DisplayGrid";

export default function BrowsePage() {
  const [searchParams] = useSearchParams();
  const initialType = searchParams.get("type") || "all";
  const [type, setType] = useState(initialType);
  useEffect(() => {
    setType(searchParams.get("type") || "all");
  }, [searchParams]);
  
  const [categorySelected, setCategorySelected] = useState("");
  const [moodSelected, setMoodSelected] = useState("");
  const [hasVideo, setHasVideo] = useState(false);

  // Main filtering logic using useMemo - it caches the filtered products and only recalculates when the dependencies change
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Type filter
      if (type !== "all" && product.type !== type) {
        return false
      }

      // Category filter
      if (categorySelected && product.category !== categorySelected) {
        return false
      }

      // Mood filter (at least one matching mood)
      if (moodSelected && !product.mood.includes(moodSelected)) {
        return false
      }

      // Has Video filter
      if (hasVideo && !product.hasVideo) {
        return false
      }

      return true
    })
  }, [type, categorySelected, moodSelected, hasVideo]);

  return (
    <div className="page browse">
      <h1>Browse Wallpapers</h1>
      <Filter 
        type={type}
        setType={setType}
        categorySelected={categorySelected}
        setCategorySelected={setCategorySelected}
        moodSelected={moodSelected}
        setMoodSelected={setMoodSelected}
        hasVideo={hasVideo}
        setHasVideo={setHasVideo}
      />
      <div className="filtered-results">
        <p>Showing {filteredProducts.length} items</p>
      </div>

      <DisplayGrid products={filteredProducts} />
    </div>
  )
}