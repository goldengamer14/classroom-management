import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET, CLOUDINARY_UPLOAD_URL } from "@/constants";
import { UploadWidgetValue } from "@/types";
import { UploadCloud } from "lucide-react";
import { DeleteButton } from "@/components/refine-ui/buttons/delete";
import { useEffect, useRef, useState } from "react";

const UploadWidget = ({ value = null, onChange, disabled = false }) => {
    const widgetRef = useRef<CloudinaryWidget | null>(null);
    const onChangeRef = useRef(onChange);

    const [preview, setPreview] = useState<UploadWidgetValue | null>(value);
    const [deleteToken, setDeleteToken] = useState<string | null>(null);
    const [isRemoving, setIsRemoving] = useState<boolean>(false);

    useEffect(() => {
        setPreview(value);
        if (!value) setDeleteToken(null);
    }, [value]);

    useEffect(() => {
        onChangeRef.current = onChange;
    }, [onChange]);

    useEffect(() => {
        if (!isRemoving || !deleteToken) {
            if (isRemoving) setIsRemoving(false); // Reset if no token available
            return;
        }

        removeFromCloudinary();
    }, [isRemoving, deleteToken]);

    useEffect(() => {
        if (!(typeof window))
            return;

        function initializeWidget() {
            if (!window.cloudinary || widgetRef.current)
                return false;

            widgetRef.current = window.cloudinary.createUploadWidget({
                cloudName: CLOUDINARY_CLOUD_NAME,
                uploadPreset: CLOUDINARY_UPLOAD_PRESET,
                multiple: false,
                folder: "uploads",
                maxFileSize: 5 << 20,
                clientAllowedFormats: "png jpg jpeg webp".split(" ")
            },
                (error, result) => {
                    if (!error && result.event === "success") {
                        const payload: UploadWidgetValue = {
                            url: (result.info as any).secure_url,
                            publicId: (result.info as any).public_id
                        }

                        setPreview(payload);
                        setDeleteToken((result.info as any).delete_token ?? null);
                    }

                    onChangeRef.current?.(preview);
                });

            return true;
        }

        if (initializeWidget()) return;

        const intervalId = window.setInterval(() => {
            if (initializeWidget()) window.clearInterval(intervalId);
        }, 500);

        return () => window.clearInterval(intervalId);
    }, []);

    function openWidget() {
        if (!disabled) widgetRef.current?.open();
    }

    async function removeFromCloudinary() {
        try {
            const response = await fetch(CLOUDINARY_UPLOAD_URL.replace("image/upload", "delete_by_token"), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    token: deleteToken
                })
            });

            if (response.ok) {
                setPreview(null);
                setDeleteToken(null);
                onChangeRef.current?.(null);
            }

        } catch (error) {
            console.error("Failed to remove the image from Cloudinary:\n", error);
        } finally {
            setIsRemoving(false);
        }
    }

    return (
        <div className="space-y-2">
            {preview ? (
                <div className="upload-preview">
                    <div className="cancel">
                        <DeleteButton onClick={e => {
                            e.preventDefault();
                            e.stopPropagation();
                            setIsRemoving(true);
                        }} />
                    </div>
                    <img src={preview.url} alt="Preview Image" />
                </div>
            ) : (
                <div className="upload-dropzone" role="button" tabIndex={0}
                    onClick={openWidget}
                    onKeyDown={e => {
                        if (e.key === "Enter") {
                            e.preventDefault();
                            openWidget();
                        }
                    }
                    } >
                    <div className="upload-prompt">
                        <UploadCloud className="icon" />
                        <div>
                            <p>CLick to upload photo</p>
                            <p>JPG, PNG upto 5MB</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default UploadWidget;