import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Filter } from "../components/filter/Filter";
import { getProducts } from "../api/api";
import DisplayGrid from "../components/display/DisplayGrid";
import "../styles/filter.css";
import "../styles/display.css";

/** Unique values, case-insensitive; keep first-seen casing; sorted A–Z */
const collectUnique = (values) => {
  const map = new Map();
  for (const value of values) {
    const trimmed = String(value ?? "").trim();
    if (!trimmed) continue;
    const key = trimmed.toLowerCase();
    if (!map.has(key)) map.set(key, trimmed);
  }
  return [...map.values()].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
};

const matchesIgnoreCase = (value, selected) =>
  String(value ?? "").trim().toLowerCase() === String(selected).trim().toLowerCase();

const listIncludesIgnoreCase = (list, selected) =>
  (list || []).some((item) => matchesIgnoreCase(item, selected));

export default function BrowsePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Read current values directly from URL (no local state + useEffect needed)
  const type = searchParams.get("type") || "all";
  const categorySelected = searchParams.get("category") || "";
  const moodSelected = searchParams.get("mood") || "";
  const tagSelected = searchParams.get("tag") || "";
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

  // Dropdown options = only values already used on products in the database
  const filterOptions = useMemo(() => {
    const productCategories = products.map((p) => p.category);
    const productMoods = products.flatMap((p) => p.mood || []);
    const productTags = products.flatMap((p) => p.tags || []);

    return {
      categories: collectUnique(productCategories),
      moods: collectUnique(productMoods),
      tags: collectUnique(productTags),
    };
  }, [products]);

  // Main filtering logic using useMemo - it caches the filtered products and only recalculates when the dependencies change
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Type filter
      if (type !== "all" && product.type !== type) return false;

      // Category filter
      if (categorySelected && !matchesIgnoreCase(product.category, categorySelected)) {
        return false;
      }

      // Mood filter (at least one matching mood)
      if (moodSelected && !listIncludesIgnoreCase(product.mood, moodSelected)) {
        return false;
      }

      // Tag filter (at least one matching tag)
      if (tagSelected && !listIncludesIgnoreCase(product.tags, tagSelected)) {
        return false;
      }

      // Has Video filter
      if (hasVideo && !product.hasVideo) return false;

      return true;
    });
  }, [products, type, categorySelected, moodSelected, tagSelected, hasVideo]);

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
      <h1 className="browse__title">Browse Wallpapers</h1>
      <Filter
        type={type}
        setType={(newType) => updateParam("type", newType)}
        categorySelected={categorySelected}
        setCategorySelected={(val) => updateParam("category", val)}
        moodSelected={moodSelected}
        setMoodSelected={(val) => updateParam("mood", val)}
        tagSelected={tagSelected}
        setTagSelected={(val) => updateParam("tag", val)}
        hasVideo={hasVideo}
        setHasVideo={(val) => updateParam("hasVideo", val)}
        categories={filterOptions.categories}
        moods={filterOptions.moods}
        tags={filterOptions.tags}
      />
      <div className="filtered-results">
        <p>
          {loading
            ? "Loading…"
            : error
              ? error
              : (
                <>
                  Showing{" "}
                  <span className="filtered-results__count">
                    {filteredProducts.length}
                  </span>{" "}
                  {filteredProducts.length === 1 ? "item" : "items"}
                </>
              )}
        </p>
      </div>

      {!loading && !error && <DisplayGrid products={filteredProducts} />}
    </div>
  );
}
