import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Filter from "../components/filter/Filter";
import { getProducts } from "../api/api";
import DisplayGrid from "../components/display/DisplayGrid";

export default function BrowsePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Read current values directly from URL (no local state + useEffect needed)
  const type = searchParams.get("type") || "all";
  const categorySelected = searchParams.get("category") || "";
  const moodSelected = searchParams.get("mood") || "";
  const hasVideo = searchParams.get("hasVideo") === "true";

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getProducts();
        if (!cancelled) setProducts(data);
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Failed to load products");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // Main filtering logic using useMemo - it caches the filtered products and only recalculates when the dependencies change
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Type filter
      if (type !== "all" && product.type !== type) return false;

      // Category filter
      if (categorySelected && product.category !== categorySelected) return false;

      // Mood filter (at least one matching mood)
      if (moodSelected && !(product.mood || []).includes(moodSelected)) return false;

      // Has Video filter
      if (hasVideo && !product.hasVideo) return false;

      return true;
    });
  }, [products, type, categorySelected, moodSelected, hasVideo]);

  // Helper to update URL params (preserves other existing params)
  const updateParam = (key, value) => {
    setSearchParams((prev) => {
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
        <p>
          {loading
            ? "Loading…"
            : error
              ? error
              : `Showing ${filteredProducts.length} items`}
        </p>
      </div>

      {!loading && !error && <DisplayGrid products={filteredProducts} />}
    </div>
  );
}
