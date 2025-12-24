"use client";

import { useEffect, useState } from "react";
import {
  AdminInput,
  AdminTextarea,
  BannerBox,
} from "../CorporateTraining/components/AdminUI";
import toast from "react-hot-toast";

// Use an existing default image from public/default-uploads to avoid 404s
const DEFAULT_IMAGE = "/default-uploads/Skill-vedika-Logo.jpg";

export default function AboutPage() {
  const [heroHeading, setHeroHeading] = useState("");
  const [heroContent, setHeroContent] = useState("");
  const [heroBanner, setHeroBanner] = useState<string>(DEFAULT_IMAGE);

  const [demoHeading, setDemoHeading] = useState("");
  const [demoPoints, setDemoPoints] = useState<{ id: string; text: string }[]>([]);

  const [isSaving, setIsSaving] = useState(false);

  // Tab state
  const [activeTab, setActiveTab] = useState<string>("hero");

  // extract JSON parts
  const parseTwoPart = (html: string) => {
    if (!html) return { part1: "", part2: "" };
    const regex = /<span>(.*?)<\/span>/i;
    const match = regex.exec(html);
    const highlight = match ? match[1] : "";
    const part1 = highlight
      ? html.replace(/<span>.*?<\/span>/i, "").trim()
      : html;
    return { part1, part2: highlight };
  };

  const buildHtmlFromParts = (obj: any) => {
    if (!obj) return "";
    return obj.part2 ? `${obj.part1}<span>${obj.part2}</span>` : obj.part1;
  };

  // LOAD DATA
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/about");
        const text = await res.text();
        let json;
        try {
          json = JSON.parse(text);
        } catch (error_) {
          console.error("GET /api/about returned non-JSON response:", text);
          if (process.env.NODE_ENV === "development") {
            console.debug("Parse error details:", error_);
          }
          return;
        }
        const data = json.data || {};

        if (data.aboutus_title)
          setHeroHeading(buildHtmlFromParts(data.aboutus_title));

        setHeroContent(data.aboutus_description ?? "");
        if (data.aboutus_image) setHeroBanner(data.aboutus_image);

        if (data.demo_title)
          setDemoHeading(buildHtmlFromParts(data.demo_title));

        // Handle demo_content - can be array of objects {title: string} or array of strings
        if (Array.isArray(data.demo_content)) {
          setDemoPoints(
            data.demo_content.map((item: any, index: number) => {
              // Handle both formats: {title: "..."} or just "string"
              const text = typeof item === 'string' ? item : (item?.title || "");
              return {
                id: `demo-point-${index}-${Date.now()}`,
                text: text || "",
              };
            })
          );
        } else {
          setDemoPoints([]);
        }
      } catch (err) {
        console.error("Load error:", err);
        toast.error("Network Error");
      }
    }

    load();
  }, []);

  // SAVE DATA
  const handleSubmit = async () => {
    if (isSaving) return;
    setIsSaving(true);

    const payload = {
      aboutus_title: parseTwoPart(heroHeading),
      aboutus_description: heroContent,
      aboutus_image: heroBanner,

      demo_title: parseTwoPart(demoHeading),
      demo_content: demoPoints
        .map((point) => ({ title: point.text?.trim() }))
        .filter((point) => point.title && point.title !== ''),
    };

    try {
      const res = await fetch("/api/about", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const text = await res.text();
      let json;
      try {
        json = JSON.parse(text);
      } catch (error_) {
        // Server returned non-JSON (likely an HTML error page). Log it for debugging.
        console.error("POST /api/about returned non-JSON response:", text);
        if (process.env.NODE_ENV === "development") {
          console.debug("Parse error details:", error_);
        }
        toast.error("Save failed: server error (see console)");
        return;
      }

      if (res.ok) {
        toast.success("About Page Saved Successfully!");
      } else {
        toast.error(json.message || "Save failed");
      }
    } catch (err) {
      console.error("POST /api/about failed:", err);
      toast.error("Network Error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm">
      <h1 className="text-2xl font-bold mb-6">About Page</h1>

      {/* Tabs Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-1 overflow-x-auto">
          {[
            { id: "hero", label: "Hero Section" },
            { id: "demo", label: "Live Free Demo" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 font-medium text-sm whitespace-nowrap border-b-2 transition-colors cursor-pointer ${
                activeTab === tab.id
                  ? "border-[#1A3F66] text-[#1A3F66]"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        {activeTab === "hero" && (
          <div className="p-6 space-y-4">
            <div>
              <AdminInput
                label="Heading"
                value={heroHeading}
                onChange={setHeroHeading}
              />
              <p className="text-xs text-gray-500 mt-1">
                Format: "Text <span>Highlighted Text</span>" (Text inside &lt;span&gt; tags will appear highlighted on the website)
              </p>
            </div>

            <AdminTextarea
              label="Content"
              value={heroContent}
              onChange={setHeroContent}
            />

            <BannerBox
              label="Banner Image"
              image={heroBanner}
              onUpload={(url) => setHeroBanner(url)}
            />
          </div>
        )}

        {activeTab === "demo" && (
          <div className="p-6 space-y-4">
            <div>
              <AdminInput
                label="Demo Heading"
                value={demoHeading}
                onChange={setDemoHeading}
              />
              <p className="text-xs text-gray-500 mt-1">
                Format: "Text <span>Highlighted Text</span>" (Text inside &lt;span&gt; tags will appear highlighted on the website)
              </p>
            </div>

            <div className="space-y-4 pt-2 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-700">Demo Points (Bullet Points):</p>
                <button
                  type="button"
                  onClick={() => {
                    setDemoPoints([
                      ...demoPoints,
                      {
                        id: `demo-point-${Date.now()}-${Math.random()}`,
                        text: "",
                      },
                    ]);
                  }}
                  className="px-4 py-2 bg-[#1A3F66] hover:bg-blue-800 text-white rounded-lg text-sm font-medium transition cursor-pointer"
                >
                  + Add Point
                </button>
              </div>

              {demoPoints.length === 0 ? (
                <p className="text-sm text-gray-500 italic py-4 text-center border border-dashed border-gray-300 rounded-lg">
                  No demo points added yet. Click "Add Point" to add one.
                </p>
              ) : (
                demoPoints.map((point, index) => (
                  <div
                    key={point.id || `demo-point-${index}`}
                    className="p-4 border border-gray-200 rounded-lg space-y-3 bg-white"
                  >
                    <div className="flex items-center justify-between">
                      <label className="text-gray-600 font-semibold">
                        Demo Point {index + 1}*
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          const newPoints = demoPoints.filter((_, i) => i !== index);
                          setDemoPoints(newPoints);
                        }}
                        className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm font-medium transition cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                    <AdminInput
                      label=""
                      value={point.text}
                      onChange={(value) => {
                        const newPoints = [...demoPoints];
                        newPoints[index] = { ...newPoints[index], text: value };
                        setDemoPoints(newPoints);
                      }}
                    />
                  </div>
                ))
              )}
              
              <p className="text-xs text-gray-500 mt-1">
                Each point will appear as a bullet point on the website
              </p>
            </div>
          </div>
        )}
      </div>

      {/* SUBMIT */}
      <div className="flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={isSaving}
          className="px-6 py-3 bg-[#1A3F66] hover:bg-blue-800 text-white rounded-xl cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? "Saving..." : "Submit"}
        </button>
      </div>
     
    </div>
  );
}
