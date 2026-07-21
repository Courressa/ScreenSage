import { useState } from 'react';
import { uploadMedia } from '../../api/api';

const UPLOAD_FIELDS = [
    {
        name: 'coverImage',
        label: 'Cover Image',
        accept: 'image/*',
        multiple: false,
    },
    {
        name: 'phonePreviews',
        label: 'Phone Previews',
        accept: 'image/*,video/*',
        multiple: true,
    },
    {
        name: 'tabletPreviews',
        label: 'Tablet Previews',
        accept: 'image/*,video/*',
        multiple: true,
    },
    {
        name: 'desktopPreviews',
        label: 'Desktop Previews',
        accept: 'image/*,video/*',
        multiple: true,
    },
    {
        name: 'fullGallery',
        label: 'Full Gallery',
        accept: 'image/*,video/*',
        multiple: true,
    },
];

function fileLabel(file) {
    try {
        return file.url.split('/').pop() || file.url;
    } catch {
        return file.url || 'file';
    }
}

export function AdminMediaUploader({ onUploadSuccess, onRemoveMedia }) {
    const [uploading, setUploading] = useState(false);
    const [uploadingField, setUploadingField] = useState(null);
    const [previews, setPreviews] = useState({});

    const handleUpload = async (e) => {
        const files = e.target.files;
        if (!files.length) return;

        const fieldName = e.target.name;
        setUploading(true);
        setUploadingField(fieldName);

        const formData = new FormData();

        Array.from(files).forEach((file) => {
            if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
                formData.append(fieldName, file);
            }
        });

        try {
            const data = await uploadMedia(formData);
            const newFiles = data.files[fieldName] || [];

            setPreviews((prev) => ({
                ...prev,
                [fieldName]: [...(prev[fieldName] || []), ...newFiles],
            }));

            onUploadSuccess(data.files);
        } catch (error) {
            alert(error.message || 'Failed to upload files');
        } finally {
            setUploading(false);
            setUploadingField(null);
            // Allow re-selecting the same file(s) — native input will show "No file chosen"
            e.target.value = '';
        }
    };

    const handleRemove = (fieldName, fileToRemove) => {
        setPreviews((prev) => {
            const updated = (prev[fieldName] || []).filter(
                (file) => file.url !== fileToRemove.url
            );

            if (updated.length === 0) {
                const next = { ...prev };
                delete next[fieldName];
                return next;
            }

            return {
                ...prev,
                [fieldName]: updated,
            };
        });

        onRemoveMedia?.({ field: fieldName, url: fileToRemove.url });
    };

    return (
        <div className="media-uploader">
            <h3>Upload Media (Images & Videos)</h3>
            <div className="media-uploader__fields">
                {UPLOAD_FIELDS.map((field) => {
                    const fieldFiles = previews[field.name] || [];
                    const isThisUploading = uploading && uploadingField === field.name;

                    return (
                        <div key={field.name} className="media-uploader__field">
                            <label htmlFor={`upload-${field.name}`}>{field.label}</label>
                            <input
                                id={`upload-${field.name}`}
                                type="file"
                                name={field.name}
                                accept={field.accept}
                                multiple={field.multiple}
                                onChange={handleUpload}
                                disabled={uploading}
                            />

                            {isThisUploading && (
                                <p className="media-uploader__field-status">Uploading…</p>
                            )}

                            {fieldFiles.length > 0 && !isThisUploading && (
                                <p className="media-uploader__field-status media-uploader__field-status--ok">
                                    {fieldFiles.length}{' '}
                                    {fieldFiles.length === 1 ? 'file' : 'files'} uploaded
                                </p>
                            )}

                            {fieldFiles.length > 0 && (
                                <div className="preview-grid">
                                    {fieldFiles.map((file, index) => (
                                        <div
                                            key={`${file.url}-${index}`}
                                            className="preview-item"
                                        >
                                            {file.resource_type === 'video' ? (
                                                <video src={file.url} controls width="150" />
                                            ) : (
                                                <img
                                                    src={file.url}
                                                    alt={`${field.label} preview`}
                                                    width="150"
                                                />
                                            )}
                                            <small className="preview-item__name">
                                                {fileLabel(file)}
                                            </small>
                                            <button
                                                type="button"
                                                className="preview-item__remove"
                                                onClick={() => handleRemove(field.name, file)}
                                                aria-label={`Remove ${fileLabel(file)}`}
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
