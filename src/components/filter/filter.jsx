import { useState } from "react";
import { categories, moods } from "../../data/data";

const mapOptions = (options) => {
  return options.map(option => {
    return <option key={option} value={option}>{option}</option>;
  }) 
}

export default function Filter() {
  const [type, setType] = useState("all");
  const [categorySelected, setCategorySelected] = useState("");
  const [moodSelected, setMoodSelected] = useState("");
  const [hasVideo, setHasVideo] = useState(true);

  export const filtered = {
    type: type,
    category: categorySelected,
    mood: moodSelected,
    hasVideo: hasVideo
  }

  return (
    <div className="filter">
      <form>
        <label>Type </label>
        <select
            name="type"
            id="type" 
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
            onChange={(e) => setCategorySelected(e.target.value)}
        >
            <option value=""></option>
            {mapOptions(categories)}
        </select>

        <label>Moods </label>
        <select
            name="moods"
            id="moods"
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