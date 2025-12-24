// "use client"; // Already present in original code

import { FiUploadCloud } from "react-icons/fi";
import React, { useState, ReactNode } from "react";
import { uploadToCloudinary } from "@/services/cloudinaryUpload";
import toast from "react-hot-toast";

export function AdminCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div
      className="bg-gray-50 p-6 rounded-xl space-y-5 shadow-sm"
      style={{ border: "1px solid rgba(16,24,40,0.08)" }}
    >
      <h2 className="text-lg font-semibold text-gray-700">{title}</h2>
      {children}
    </div>
  );
}

function AdminInputComponent({ label, value, onChange, onBlur, id, required }: { label: string; value: string | undefined; onChange?: (val: string) => void; onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void; id?: string; required?: boolean }) {
  // Performance: Generate stable ID to prevent re-renders
  const inputId = id || `admin-input-${label.toLowerCase().replace(/\s+/g, '-')}`;
  
  return (
    <div>
      <label htmlFor={inputId} className="text-gray-600 font-semibold mb-1 block">
        {label}
        {required && <span className="text-red-500 ml-1" aria-label="required">*</span>}
      </label>
      <input
        id={inputId}
        type="text"
        value={value ?? ""}
        onChange={(e) => onChange && onChange(e.target.value)}
        onBlur={(e) => onBlur && onBlur(e)}
        className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:outline-none transition"
        aria-required={required}
        aria-label={label}
      />
    </div>
  );
}

export const AdminInput = React.memo(AdminInputComponent);

// Added Textarea component which was missing in original snippet but good practice
function AdminTextareaComponent({ label, value, onChange, rows = 4, onBlur, id, required }: { label: string; value: string | undefined; onChange?: (val: string) => void; rows?: number; onBlur?: (e: React.FocusEvent<HTMLTextAreaElement>) => void; id?: string; required?: boolean }) {
  // Performance: Generate stable ID to prevent re-renders
  const textareaId = id || `admin-textarea-${label.toLowerCase().replace(/\s+/g, '-')}`;
  
  return (
    <div>
      <label htmlFor={textareaId} className="text-gray-600 font-semibold mb-1 block">
        {label}
        {required && <span className="text-red-500 ml-1" aria-label="required">*</span>}
      </label>
      <textarea
        id={textareaId}
        rows={rows}
        value={value ?? ""}
        onChange={(e) => onChange && onChange(e.target.value)}
        onBlur={(e) => onBlur && onBlur(e)}
        className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:outline-none transition"
        aria-required={required}
        aria-label={label}
      />
    </div>
  );
}

export const AdminTextarea = React.memo(AdminTextareaComponent);

export function BannerBox({ label, image, onUpload, iconSize = 18 }: { label: string; image: string | Record<string, unknown> | undefined; onUpload: (url: string) => void; iconSize?: number }) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewSrc, setPreviewSrc] = useState("");

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // create a local preview immediately so user sees the image before upload completes
    try {
      const objectUrl = URL.createObjectURL(file);
      setPreviewSrc(objectUrl);
    } catch (err) {
      console.debug("Could not create object URL for preview", err);
    }

    setIsUploading(true);
    try {
      const url = await uploadToCloudinary(file);
      console.debug("Cloudinary returned:", url);
      onUpload(url); // Pass the Cloudinary URL
      // update local preview to final remote URL so it survives revocation
      setPreviewSrc(url);
      toast.success("Image uploaded successfully!");
    } catch (error: any) {
      console.error("Upload failed:", error);
      const errorMessage = error?.message || "Image upload failed";
      toast.error(errorMessage.length > 100 ? "Image upload failed. Please check your internet connection and try again." : errorMessage);
      // clear preview on failure
      setPreviewSrc("");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div
      className="p-4 rounded-xl bg-white shadow-sm"
      style={{ border: "1px solid rgba(16,24,40,0.08)" }}
    >
      <label className="block text-gray-600 font-semibold mb-2">{label}</label>
      <p className="text-xs text-gray-500 mb-2">
        Note: Images will be automatically converted to WebP format for optimal performance.
      </p>

      <div className="flex items-center gap-4">
        {/* Updated Upload Button color to match new blue palette */}
        <label className="px-4 py-2 bg-[#1A3F66] hover:bg-blue-800 text-white rounded-lg cursor-pointer transition flex items-center gap-2 disabled:opacity-50">
          <FiUploadCloud size={iconSize} />
          {isUploading ? "Uploading..." : "Upload Image"}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileSelect}
            disabled={isUploading}
          />
        </label>

        {/* Support image as string URL or an object returned from some APIs */}
        {(() => {
          const src: string =
            typeof image === "string"
              ? image
              : image && typeof image === "object"
              ? (image.url as string) || (image.secure_url as string) || (image.path as string) || ""
              : "";
          
          // Validate image URL - skip invalid paths (like /mnt/data/... or /contact-us/...)
          const isValidUrl = (url: string): boolean => {
            if (!url) return false;
            // Valid if it's a full URL (http/https)
            if (url.startsWith("http://") || url.startsWith("https://")) return true;
            // Valid if it starts with / but not invalid backend paths
            if (url.startsWith("/") && !url.startsWith("/mnt/") && !url.startsWith("/contact-us/")) return true;
            return false;
          };
          
          // Use an existing fallback image shipped in public/default-uploads.
          // placeholder.png did not exist in the repo which caused 404s in dev.
          const finalSrc: string =
            previewSrc || (src && isValidUrl(src) ? src : "") || "/default-uploads/Skill-vedika-Logo.jpg";

          return (
            <div className="flex flex-col items-start gap-2">
              <img
                key={finalSrc}
                src={finalSrc}
                className="h-16 w-16 rounded-lg object-cover border border-gray-300"
                alt="Preview"
              />
              {/* show URL for debugging / quick open */}
              {src ? (
                <a
                  href={src}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-gray-500 underline"
                >
                  Preview URL
                </a>
              ) : null}
            </div>
          );
        })()}
      </div>
    </div>
  );
}
