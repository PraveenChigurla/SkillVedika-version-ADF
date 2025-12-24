"use client";

import { useState, ChangeEvent, useEffect } from "react";
// import Image from "next/image";
// import { FiUploadCloud } from "react-icons/fi";
import axios from "@/utils/axios";
import toast from "react-hot-toast";
import { uploadToCloudinary } from "@/services/cloudinaryUpload";
import {
  AdminCard,
  AdminInput,
  AdminTextarea,
} from "@/app/dashboard/AllPages/CorporateTraining/components/AdminUI";
import PlacementImageGrid from "./components/PlacementImageGrid";

// Outer card
function PageCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white shadow-md rounded-2xl p-8 border border-gray-200 mb-8">
      {children}
    </div>
  );
}

// Inner gray card
function InnerCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
      {children}
    </div>
  );
}

export default function ForCorporateSectionPage() {
  const [loading, setLoading] = useState(false);
  const [recordId, setRecordId] = useState<number | null>(null);

  const [placementsTitle, setPlacementsTitle] = useState<string>("");
  const [placementsSubtitle, setPlacementsSubtitle] = useState<string>("");
  const [placementImages, setPlacementImages] = useState<string[]>([]);

  const [reserveTitle, setReserveTitle] = useState<string>("");
  const [reserveSubtitle, setReserveSubtitle] = useState<string>("");
  const [reserveBlock1, setReserveBlock1] = useState<string>("0");
  const [reserveBlock1Label, setReserveBlock1Label] =
    useState<string>("Expert Instructors");
  const [reserveBlock2, setReserveBlock2] = useState<string>("0");
  const [reserveBlock2Label, setReserveBlock2Label] = useState<string>(
    "years of experience"
  );
  const [reserveBlock3, setReserveBlock3] = useState<string>("0");
  const [reserveBlock3Label, setReserveBlock3Label] =
    useState<string>("Success Rate");
  const [reserveButtonName, setReserveButtonName] =
    useState<string>("Enroll Now");
  const [reserveButtonLink, setReserveButtonLink] = useState<string>("");

  useEffect(() => {
    // load existing record
    (async () => {
      try {
        setLoading(true);
        const res = await axios.get("/placements-reserve");
        const data = res.data;
        if (data) {
          setRecordId(data.id || null);

          // placements_title may be object with main
          const pt = data.placements_title?.main || data.placements_title || "";
          setPlacementsTitle(pt);
          setPlacementsSubtitle(data.placements_subtitle || "");
          setPlacementImages(
            Array.isArray(data.placement_images) ? data.placement_images : []
          );

          setReserveTitle(data.reserve_title?.main || "");
          setReserveSubtitle(data.reserve_subtitle || "");
          // reserve_block may be arrays like [value, label]
          if (Array.isArray(data.reserve_block1)) {
            setReserveBlock1(String(data.reserve_block1[0] || "0"));
            setReserveBlock1Label(String(data.reserve_block1[1] || ""));
          } else {
            setReserveBlock1(String(data.reserve_block1 || "0"));
          }

          if (Array.isArray(data.reserve_block2)) {
            setReserveBlock2(String(data.reserve_block2[0] || "0"));
            setReserveBlock2Label(String(data.reserve_block2[1] || ""));
          } else {
            setReserveBlock2(String(data.reserve_block2 || "0"));
          }

          if (Array.isArray(data.reserve_block3)) {
            setReserveBlock3(String(data.reserve_block3[0] || "0"));
            setReserveBlock3Label(String(data.reserve_block3[1] || ""));
          } else {
            setReserveBlock3(String(data.reserve_block3 || "0"));
          }

          setReserveButtonName(data.reserve_button_name || "Enroll Now");
          setReserveButtonLink(data.reserve_button_link || "");
        }
      } catch (e) {
        console.debug("No placements-reserve record or fetch failed", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleImageChange = async (
    e: ChangeEvent<HTMLInputElement>,
    index?: number
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // optimistic preview handled by Cloudinary URL after upload

    try {
      const url = await uploadToCloudinary(file);
      if (typeof index === "number") {
        setPlacementImages((prev) => {
          const next = [...prev];
          next[index] = url;
          return next;
        });
      } else {
        setPlacementImages((prev) => [...prev, url]);
      }
      toast.success("Image uploaded");
    } catch (err) {
      console.error("Upload failed", err);
      toast.error("Upload failed");
    }
  };

  const removeImage = (i: number) => {
    setPlacementImages((p) => p.filter((_, idx) => idx !== i));
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      const payload: any = {
        placements_title: { main: placementsTitle },
        placements_subtitle: placementsSubtitle,
        placement_images: placementImages,
        reserve_title: { main: reserveTitle },
        reserve_subtitle: reserveSubtitle,
        reserve_block1: [reserveBlock1, reserveBlock1Label],
        reserve_block2: [reserveBlock2, reserveBlock2Label],
        reserve_block3: [reserveBlock3, reserveBlock3Label],
        reserve_button_name: reserveButtonName,
        reserve_button_link: reserveButtonLink,
      };

      if (recordId) {
        await axios.put(`/placements-reserve/${recordId}`, payload);
        toast.success("Updated successfully");
      } else {
        await axios.post("/placements-reserve", payload);
        toast.success("Saved successfully");
      }
    } catch (err: any) {
      console.error("Save failed", err);
      toast.error(err?.response?.data?.message || "Save failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageCard>
      <div className="w-full">
        {/* MAIN PAGE TITLE */}
        <h1 className="text-3xl font-bold mb-6">
          Palcement and Reserve Section
        </h1>

        <PageCard>
          <h2 className="text-xl font-semibold text-gray-700 mb-6">
            Placement Section
          </h2>

          <InnerCard>
            {/* TITLE HEADING */}
            <label className="block mb-2 font-semibold text-gray-600">
              Title Heading <span className="text-red-500">*</span>
            </label>

            <input
              type="text"
              defaultValue="<h2>For Corporates</h2>"
              className="w-full border border-gray-300 rounded-lg p-3 shadow-sm mb-6
                     focus:ring focus:ring-blue-200"
            />

            {/* DESCRIPTION */}
            <label className="block mb-2 font-semibold text-gray-600">
              Description <span className="text-red-500">*</span>
            </label>

            <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm mb-6">
              <textarea
                rows={8}
                defaultValue={`Urna facilisis porttitor risus, erat aptent aliquam. Pellentesque quisque curae imperdiet mi accumsan mauris curabitur nibh...`}
                className="w-full focus:outline-none text-gray-700 resize-none"
              />
            </div>

            {/* IMAGE UPLOAD CARD */}
            {/* <InnerCard>
              <label className="block mb-3 font-semibold text-gray-600">
                Placement Logos / Images
              </label>

              <div className="space-y-3">
                {placementImages.map((img, idx) => (
                  <div key={idx} className="flex items-center gap-4">
                    <Image src={img} alt={`logo-${idx}`} width={160} height={64} className="object-contain bg-white p-2 rounded" />
                    <label className="px-3 py-2 bg-[#1A3F66] hover:bg-blue-800 text-white rounded cursor-pointer">
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageChange(e, idx)} />
                      Replace
                    </label>
                    <button onClick={() => removeImage(idx)} className="px-3 py-2 bg-red-600 text-white rounded">Remove</button>
                  </div>
                ))}

                <div className="flex items-center gap-4">
                  <label className="px-4 py-2 bg-[#1A3F66] hover:bg-blue-800 text-white rounded-lg cursor-pointer transition flex items-center gap-2">
                    <FiUploadCloud size={18} /> Upload New Image
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                  </label>
                </div>
              </div>
            </InnerCard> */}
            <InnerCard>
              <label className="block mb-4 font-semibold text-gray-600">
                Placement Logos / Images
              </label>

              <PlacementImageGrid
                images={placementImages}
                setImages={setPlacementImages}
                onUpload={(file, index) =>
                  handleImageChange({ target: { files: [file] } } as any, index)
                }
                onRemove={removeImage}
              />
            </InnerCard>
          </InnerCard>
        </PageCard>
        {/* RESERVE SECTION - uses AdminUI components for consistent styling */}
        <div className="mt-6">
          <AdminCard title="Reserve Section">
            <div className="space-y-4">
              <AdminInput
                label="Reserve Title"
                value={reserveTitle}
                onChange={setReserveTitle}
              />
              <AdminTextarea
                label="Reserve Subtitle"
                value={reserveSubtitle}
                onChange={setReserveSubtitle}
                rows={3}
              />

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <AdminInput
                    label="Number (Box 1)"
                    value={reserveBlock1}
                    onChange={setReserveBlock1}
                  />
                  <AdminInput
                    label="Text (Box 1)"
                    value={reserveBlock1Label}
                    onChange={setReserveBlock1Label}
                  />
                </div>
                <div>
                  <AdminInput
                    label="Number (Box 2)"
                    value={reserveBlock2}
                    onChange={setReserveBlock2}
                  />
                  <AdminInput
                    label="Text (Box 2)"
                    value={reserveBlock2Label}
                    onChange={setReserveBlock2Label}
                  />
                </div>
                <div>
                  <AdminInput
                    label="Number (Box 3)"
                    value={reserveBlock3}
                    onChange={setReserveBlock3}
                  />
                  <AdminInput
                    label="Text (Box 3)"
                    value={reserveBlock3Label}
                    onChange={setReserveBlock3Label}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <AdminInput
                  label="Button Name"
                  value={reserveButtonName}
                  onChange={setReserveButtonName}
                />
                <AdminInput
                  label="Button Link(Optional)"
                  value={reserveButtonLink}
                  onChange={setReserveButtonLink}
                />
              </div>
            </div>
          </AdminCard>
        </div>
        {/* SUBMIT BUTTON RIGHT */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSave}
            disabled={loading}
            className="bg-[#1A3F66] hover:bg-blue-800 text-white px-8 py-3 rounded-lg font-semibold shadow transition disabled:opacity-60"
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </PageCard>
  );
}
