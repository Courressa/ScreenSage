import { useState } from 'react';
import { uploadMedia } from '../../api';

export default function AdminMediaUploader({ onUploadSuccess }) {
    const [uploading, setUploading] = useState(false);
    const [previews, setPreviews] = useState({});

    const handleUpload = async (e) => {
        const files = e.target.files;
        if (!files.length) return;

        setUploading(true);
        const formData = new FormData();
        const fieldName = e.target.name;

        // Add files to formData based on input name attribute
        Array.from(files).forEach(file => {
            if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
                formData.append(e.target.name, file);
            }
        });

        try {
            const data = await uploadMedia(formData);

            // Update local previews
            setPreviews(prev => ({
                ...prev,
                [fieldName]: data.files[fieldName] || []
            }));

            // Pass all uploaded files to parent
            onUploadSuccess(data.files);
        } catch (error) {
            alert(error.message || "Failed to upload files");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="media-uploader">
            <h3>Upload Media (Images & Videos)</h3>
            <div>
                <label>Cover Image</label>
                <input 
                    type="file" 
                    multiple 
                    name="coverImage" 
                    accept="image/*" 
                    onChange={handleUpload} 
                    disabled={uploading}
                />
            </div>
            <div>
                <label>Phone Previews</label>
                <input 
                    type="file" 
                    multiple 
                    name="phonePreviews" 
                    accept="image/*,video/*" 
                    onChange={handleUpload} 
                    disabled={uploading}
                />
            </div>
            <div>
                <label>Tablet Previews</label>
                <input 
                    type="file" 
                    multiple 
                    name="tabletPreviews" 
                    accept="image/*,video/*" 
                    onChange={handleUpload} 
                    disabled={uploading}
                />
            </div>
            <div>
                <label>Desktop Previews</label>
                <input 
                    type="file" 
                    multiple 
                    name="desktopPreviews" 
                    accept="image/*,video/*" 
                    onChange={handleUpload} 
                    disabled={uploading}
                />
            </div>
            <div>
                <label>Full Gallery</label>
                <input 
                    type="file" 
                    multiple 
                    name="fullGallery" 
                    accept="image/*,video/*" 
                    onChange={handleUpload} 
                    disabled={uploading}
                />
            </div>
           

            {uploading && <p>Uploading...</p>}

            {/* Preview uploaded files */}
            {/* Preview Section */}
            {Object.keys(previews).length > 0 && (
                <div className="upload-previews">
                    <h4>Uploaded Files Preview</h4>
                    {Object.entries(previews).map(([field, files]) => (
                        <div key={field}>
                            <strong>{field}:</strong>
                            <div className="preview-grid">
                                {files.map((file, index) => (
                                    <div key={index} className="preview-item">
                                        {file.resource_type === 'video' ? (
                                            <video src={file.url} controls width="150" />
                                        ) : (
                                            <img src={file.url} alt="preview" width="150" />
                                        )}
                                        <small>{file.url.split('/').pop()}</small>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}