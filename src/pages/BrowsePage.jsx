import { useState } from "react";
import Filter from "../components/filter/filter";

export default function BrowsePage() {
    const [type, setType] = useState("all");
    const [categorySelected, setCategorySelected] = useState("");
    const [moodSelected, setMoodSelected] = useState("");
    const [hasVideo, setHasVideo] = useState(true);

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
      <div className="filtered">
        <p>Filtered by: {type}</p>
        <p>Category: {categorySelected}</p>
        <p>Mood: {moodSelected}</p>
        <p>Has Video: {hasVideo ? "Yes" : "No"}</p>
      </div>
    </div>
  )
}