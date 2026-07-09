import { categories, moods } from "../../data/data";

const mapOptions = (options) => {
    return options.map(option => {
        return <option key={option} value={option}>{option.charAt(0).toUpperCase() + option.slice(1)}</option>;
    }) 
}

export default function Filter({
    type, setType,
    categorySelected, setCategorySelected,
    moodSelected, setMoodSelected,
    hasVideo, setHasVideo
}) {
  return (
    <div className="filter">
        <form>
            <label>Type </label>
            <select
                name="type"
                id="type" 
                value={type}
                onChange={(e) => setType(e.target.value)}
            >
                <option value="all">All</option>
                <option value="individual">Individual</option>
                <option value="collection">Collection</option>
            </select>

            <label>Categories </label>
            <select
                name="categories"
                id="categories"
                value={categorySelected}
                onChange={(e) => setCategorySelected(e.target.value)}
            >
                <option value=""></option>
                {mapOptions(categories)}
            </select>

            <label>Moods </label>
            <select
                name="moods"
                id="moods"
                value={moodSelected}
                onChange={(e) => setMoodSelected(e.target.value)}
            >
                <option value=""></option>
                {mapOptions(moods)}
            </select>

            <label>Has Video</label>
            <input
            type="checkbox"
            id="hasVideo"
            name="hasVideo"
            checked={hasVideo}
            onChange={(e) => setHasVideo(e.target.checked)}
            />
        </form>
    </div>
  )
}