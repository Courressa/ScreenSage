export default function UniqueImageList({ previews, onSelectImageInd, selectedDevice }) {
    if (!selectedDevice) return null;

    const images = (previews && previews[selectedDevice]) || [];

    return (
        <div>
            {images.map((image, idx) => (
                <img
                    key={`${selectedDevice}-${idx}-${image}`}
                    src={image}
                    alt={`preview-${idx}`}
                    onClick={() => onSelectImageInd(idx)}
                />
            ))}
        </div>
    );
}