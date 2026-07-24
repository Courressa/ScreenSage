import "../../styles/filter.css";

/** Canonical device sizes — matches Product.devices enum */
export const DEVICE_FILTER_OPTIONS = ["phone", "tablet", "desktop"];

const mapOptions = (options) => {
  return options.map((option) => (
    <option key={option.toLowerCase()} value={option}>
      {option.charAt(0).toUpperCase() + option.slice(1)}
    </option>
  ));
};

export function Filter({
  type,
  setType,
  deviceSelected,
  setDeviceSelected,
  categorySelected,
  setCategorySelected,
  moodSelected,
  setMoodSelected,
  tagSelected,
  setTagSelected,
  hasVideo,
  setHasVideo,
  categories = [],
  moods = [],
  tags = [],
  devices = DEVICE_FILTER_OPTIONS,
}) {
  const hasActiveFilters =
    type !== "all" ||
    Boolean(deviceSelected) ||
    Boolean(categorySelected) ||
    Boolean(moodSelected) ||
    Boolean(tagSelected) ||
    hasVideo;

  const handleClear = () => {
    setType("all");
    setDeviceSelected("");
    setCategorySelected("");
    setMoodSelected("");
    setTagSelected("");
    setHasVideo(false);
  };

  return (
    <div className="filter">
      <div className="filter__header">
        <h2 className="filter__title">Filters</h2>
        {hasActiveFilters && (
          <button type="button" className="filter__clear" onClick={handleClear}>
            Clear all
          </button>
        )}
      </div>

      <form className="filter__form" onSubmit={(e) => e.preventDefault()}>
        <div className="filter__group">
          <label htmlFor="filter-type">Type</label>
          <select
            name="type"
            id="filter-type"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="all">All</option>
            <option value="individual">Individual</option>
            <option value="collection">Collection</option>
          </select>
        </div>

        <div className="filter__group">
          <label htmlFor="filter-device">Device</label>
          <select
            name="device"
            id="filter-device"
            value={deviceSelected}
            onChange={(e) => setDeviceSelected(e.target.value)}
          >
            <option value="">All devices</option>
            {mapOptions(devices)}
          </select>
        </div>

        <div className="filter__group">
          <label htmlFor="filter-categories">Category</label>
          <select
            name="categories"
            id="filter-categories"
            value={categorySelected}
            onChange={(e) => setCategorySelected(e.target.value)}
          >
            <option value="">All categories</option>
            {mapOptions(categories)}
          </select>
        </div>

        <div className="filter__group">
          <label htmlFor="filter-moods">Mood</label>
          <select
            name="moods"
            id="filter-moods"
            value={moodSelected}
            onChange={(e) => setMoodSelected(e.target.value)}
          >
            <option value="">All moods</option>
            {mapOptions(moods)}
          </select>
        </div>

        <div className="filter__group">
          <label htmlFor="filter-tags">Tag</label>
          <select
            name="tags"
            id="filter-tags"
            value={tagSelected}
            onChange={(e) => setTagSelected(e.target.value)}
          >
            <option value="">All tags</option>
            {mapOptions(tags)}
          </select>
        </div>

        <div className="filter__group filter__group--checkbox">
          <label className="filter__checkbox" htmlFor="filter-hasVideo">
            <input
              type="checkbox"
              id="filter-hasVideo"
              name="hasVideo"
              checked={hasVideo}
              onChange={(e) => setHasVideo(e.target.checked)}
            />
            <span className="filter__checkbox-text">Has video</span>
          </label>
        </div>
      </form>
    </div>
  );
}
