"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  AdminInput,
  AdminTextarea,
  BannerBox,
} from "@/app/dashboard/AllPages/CorporateTraining/components/AdminUI";

export default function BlogListingPage() {
  const [isSaving, setIsSaving] = useState(false);

  const [heroHeading, setHeroHeading] = useState("");
  const [heroDescription, setHeroDescription] = useState("");
  const [categoryHeading, setCategoryHeading] = useState("");
  const [bannerImage, setBannerImage] = useState("");

  const [demoHeading, setDemoHeading] = useState("");
  const [demoSubContent, setDemoSubContent] = useState("");
  const [demoPoints, setDemoPoints] = useState<{ id: string; text: string }[]>([]);

  // Tab state
  const [activeTab, setActiveTab] = useState<string>("hero");

  // Load saved data on mount
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/blog-page");
        if (!res.ok) {
          console.warn("Could not fetch saved blog-page settings", res.status);
          return;
        }
        const text = await res.text();
        let response: unknown = null;
        try {
          response = JSON.parse(text);
        } catch {
          console.error("GET /api/blog-page returned non-JSON response:", text);
          return;
        }

        // Backend returns { data: {...} }, so unwrap it
        const responseObj = response && typeof response === "object" ? (response as Record<string, unknown>) : null;
        const data = responseObj?.data;
        
        if (!data || typeof data !== "object" || Object.keys(data as Record<string, unknown>).length === 0) {
          console.debug("No blog-page data from backend or empty data");
          return;
        }

        const dataObj = data as Record<string, unknown>;
        const heroTitle = dataObj.hero_title && typeof dataObj.hero_title === "object" ? (dataObj.hero_title as Record<string, unknown>) : null;
        const demoTitle = dataObj.demo_title && typeof dataObj.demo_title === "object" ? (dataObj.demo_title as Record<string, unknown>) : null;

        // Helper: Extract title from object or string (handles part1/part2 format)
        const extractTitle = (title: unknown, fallback: string): string => {
          if (!title) return fallback;
          if (typeof title === "string") return title;
          const titleObj = title as { text?: string; part1?: string; part2?: string };
          // If part1 and part2 exist, combine them with a space; otherwise use text
          if (titleObj.part1 && titleObj.part2) {
            return `${titleObj.part1} ${titleObj.part2}`;
          }
          // If only part1 exists, use it
          if (titleObj.part1) {
            return titleObj.part1;
          }
          // Fall back to text
          return titleObj.text ?? fallback;
        };

        // Map backend fields to state
        setHeroHeading(extractTitle(heroTitle, ""));
        setHeroDescription(String(dataObj.hero_description ?? ""));
        setCategoryHeading(String(dataObj.sidebar_name ?? ""));
        setBannerImage(String(dataObj.hero_image ?? ""));
        setDemoHeading(extractTitle(demoTitle, ""));
        setDemoSubContent(String(dataObj.demo_subtitle ?? ""));
        
        // Handle demo_points as array of strings - load into dynamic array
        const pointsArray = Array.isArray(dataObj.demo_points) ? dataObj.demo_points : [];
        setDemoPoints(
          pointsArray.map((text: string, index: number) => ({
            id: `demo-point-${index}-${Date.now()}`,
            text: text || "",
          }))
        );
      } catch (err: unknown) {
        console.error("Failed to load blog-page settings:", err);
      }
    }

    load();
  }, []);

  const handleSubmit = async () => {
    setIsSaving(true);

    // Helper: Parse title into {text, part1, part2} format
    // The website frontend Hero component checks for part1/part2 first, then falls back to text
    // We'll try to intelligently split the input if it looks like it has two parts
    const parseTitle = (input: string): { text: string; part1?: string; part2?: string } => {
      if (!input || !input.trim()) {
        return { text: "" };
      }
      
      const trimmed = input.trim();
      
      // Check for pipe separator: "Part1 | Part2"
      if (trimmed.includes(" | ")) {
        const parts = trimmed.split(" | ");
        if (parts.length === 2) {
          return {
            text: trimmed,
            part1: parts[0].trim(),
            part2: parts[1].trim(),
          };
        }
      }
      
      // For titles like "Explore Our Latest Blogs!", try to split on the last word
      // This is a heuristic - split on the last space before punctuation or last word
      const words = trimmed.split(/\s+/);
      if (words.length >= 2) {
        // Take last 1-2 words as part2, rest as part1
        // For "Explore Our Latest Blogs!" -> part1: "Explore Our Latest", part2: "Blogs!"
        const lastWord = words[words.length - 1];
        const restWords = words.slice(0, -1);
        
        // If last word ends with punctuation and is short, use it as part2
        if (lastWord.match(/[!?.]$/) && lastWord.length <= 15) {
          return {
            text: trimmed,
            part1: restWords.join(" "),
            part2: lastWord,
          };
        }
      }
      
      // Default: save as text (frontend will use it if part1/part2 don't exist)
      return { text: trimmed };
    };

    const heroTitlePayload = parseTitle(heroHeading ?? "");
    const demoTitlePayload = parseTitle(demoHeading ?? "");

    const payload = {
      hero_title: heroTitlePayload,
      hero_description: heroDescription ?? "",
      sidebar_name: categoryHeading ?? "",
      hero_image: bannerImage ?? "",
      demo_title: demoTitlePayload,
      demo_subtitle: demoSubContent ?? "",
      demo_points: demoPoints
        .map((point) => point.text?.trim())
        .filter((point: string) => point && point !== ''),
    };

    try {
      const res = await fetch("/api/blog-page", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      console.log("POST /api/blog-page/update - Response status:", res.status, "ok:", res.ok);

      const text = await res.text();
      let data: unknown = null;
      try {
        data = JSON.parse(text);
      } catch {
        data = null;
      }

      console.debug("POST /api/blog-page/update response status:", res.status, "body:", data ?? text);

      if (!res.ok) {
        const dataObj = data && typeof data === "object" ? (data as Record<string, unknown>) : undefined;
        const msg = dataObj && ("message" in dataObj || "error" in dataObj)
          ? String(dataObj["message"] ?? dataObj["error"])
          : text || `Status ${res.status}`;
        toast.error(String(msg));
        throw new Error(String(msg));
      }

      // success path
      toast.success("Saved successfully.");

      // re-fetch fresh data to ensure UI matches backend
      try {
        const responseText = await fetch("/api/blog-page").then(r => r.text());
        let body: unknown = null;
        try {
          body = JSON.parse(responseText);
        } catch {
          return;
        }

        // Unwrap { data: {...} } structure
        const bodyObj = body && typeof body === "object" ? (body as Record<string, unknown>) : null;
        const freshData = bodyObj?.data;
        
        if (freshData && typeof freshData === "object" && Object.keys(freshData as Record<string, unknown>).length > 0) {
          const freshDataObj = freshData as Record<string, unknown>;
          const heroTitle = freshDataObj.hero_title && typeof freshDataObj.hero_title === "object" ? (freshDataObj.hero_title as Record<string, unknown>) : null;
          const demoTitle = freshDataObj.demo_title && typeof freshDataObj.demo_title === "object" ? (freshDataObj.demo_title as Record<string, unknown>) : null;

          // Helper: Extract title from object (handles part1/part2 format)
          const extractTitleForReload = (title: unknown): string => {
            if (!title) return "";
            if (typeof title === "string") return title;
            const titleObj = title as { text?: string; part1?: string; part2?: string };
            if (titleObj.part1 && titleObj.part2) {
              return `${titleObj.part1} ${titleObj.part2}`;
            }
            return titleObj.text ?? "";
          };

          setHeroHeading(extractTitleForReload(heroTitle));
          setHeroDescription(String(freshDataObj.hero_description ?? ""));
          setCategoryHeading(String(freshDataObj.sidebar_name ?? ""));
          setBannerImage(String(freshDataObj.hero_image ?? ""));
          setDemoHeading(extractTitleForReload(demoTitle));
          setDemoSubContent(String(freshDataObj.demo_subtitle ?? ""));
          
          // Handle demo_points as array of strings - load into dynamic array
          const pointsArray = Array.isArray(freshDataObj.demo_points) ? freshDataObj.demo_points : [];
          setDemoPoints(
            pointsArray.map((text: string, index: number) => ({
              id: `demo-point-${index}-${Date.now()}`,
              text: text || "",
            }))
          );
        }
      } catch (e: unknown) {
        console.debug("Failed to re-fetch after save:", e);
      }
    } catch (err: unknown) {
      let msg = "Failed to save blog page.";
      if (err instanceof Error) msg = err.message;
      else if (typeof err === "string") msg = err;
      else msg = String(err ?? msg);
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="bg-white p-8 rounded-2xl shadow-sm">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Blog Page</h1>

      {/* Tabs Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-1 overflow-x-auto">
          {[
            { id: "hero", label: "Blog Hero Section" },
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
          <div className="p-6 space-y-5">
            <div>
              <label htmlFor="page-heading" className="text-gray-600 block mb-1 font-semibold">
                Page Heading*
              </label>
              <input
                id="page-heading"
                value={heroHeading}
                onChange={(e) => setHeroHeading(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300"
              />
              <p className="text-xs text-gray-500 mt-1">
                Format: Simple text or "Text part1 Text part2" (If using parts, first part gets gradient styling on the website)
              </p>
            </div>
            <AdminTextarea label="Page Content" value={heroDescription} onChange={setHeroDescription} />
            <BannerBox label="Banner Image" image={bannerImage} onUpload={setBannerImage} />
            <AdminInput label="Category Heading" value={categoryHeading} onChange={setCategoryHeading} />
          </div>
        )}

        {activeTab === "demo" && (
          <div className="p-6 space-y-5">
            <div>
              <label htmlFor="demo-heading" className="text-gray-600 block mb-1 font-semibold">
                Demo Section Heading*
              </label>
              <input
                id="demo-heading"
                value={demoHeading}
                onChange={(e) => setDemoHeading(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300"
              />
              <p className="text-xs text-gray-500 mt-1">
                This is the main heading displayed on the website (e.g., "Get A Live Free Demo")
              </p>
            </div>

            <AdminTextarea label="Demo Sub Content" value={demoSubContent} onChange={setDemoSubContent} />

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
                      <label className="text-sm font-semibold text-gray-700">
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

              {demoPoints.length > 0 && (
                <p className="text-xs text-gray-500 mt-2">
                  Each point will appear as a bullet point on the website
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Submit Button */}
      <div className="flex justify-end mt-6">
        <button
          onClick={handleSubmit}
          disabled={isSaving}
          className="px-6 py-3 bg-[#1A3F66] hover:bg-blue-800 text-white rounded-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow"
        >
          {isSaving ? "Saving..." : "Submit"}
        </button>
      </div>
    </section>
  );
}
