import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Filter } from "../components/filter/Filter.jsx";
import { products } from "../data/data.js";
import DisplayGrid from "../components/display/DisplayGrid.jsx";

export default function BrowsePage() {
  const [searchParams, setSearchParams] = useSearchParams();
 
  // Read current values directly from URL (no local state + useEffect needed)
  const type = searchParams.get("type") || "all";
  const categorySelected = searchParams.get("category") || "";
  const moodSelected = searchParams.get("mood") || "";
  const hasVideo = searchParams.get("hasVideo") === "true";

  // Main filtering logic using useMemo - it caches the filtered products and only recalculates when the dependencies change
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Type filter
      if (type !== "all" && product.type !== type) return false;

      // Category filter
      if (categorySelected && product.category !== categorySelected) return false;

      // Mood filter (at least one matching mood)
      if (moodSelected && !product.mood.includes(moodSelected)) return false;

      // Has Video filter
      if (hasVideo && !product.hasVideo) return false;

      return true
    })
  }, [type, categorySelected, moodSelected, hasVideo]);

  // Helper to update URL params (preserves other existing params)
  const updateParam = (key, value) => {
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      if (value === "" || value === false || (key === "type" && value === "all")) {
        newParams.delete(key);
      } else {
        newParams.set(key, value);
      }
      return newParams;
    });
  };

  return (
    <div className="page browse">
      <h1>Browse Wallpapers</h1>
      <Filter 
        type={type}
        setType={(newType) => updateParam("type", newType)}
        categorySelected={categorySelected}
        setCategorySelected={(val) => updateParam("category", val)}
        moodSelected={moodSelected}
        setMoodSelected={(val) => updateParam("mood", val)}
        hasVideo={hasVideo}
        setHasVideo={(val) => updateParam("hasVideo", val)}
      />
      <div className="filtered-results">
        <p>Showing {filteredProducts.length} items</p>
      </div>

      <DisplayGrid products={filteredProducts} />
    </div>
  )
}