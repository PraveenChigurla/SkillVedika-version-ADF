"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { AdminCard, AdminInput } from "../CorporateTraining/components/AdminUI";

export default function CourseListingPage() {
  const [isSaving, setIsSaving] = useState(false);

  const [heading, setHeading] = useState("");
  const [subHeading, setSubHeading] = useState("");
  const [categoryHeading, setCategoryHeading] = useState("");

  /* ===================== FETCH EXISTING DATA ===================== */
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/course-page-content`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });

        if (!res.ok) {
          console.error(
            "Failed to fetch course content",
            res.status,
            res.statusText
          );
          toast.error(`Failed to load course content: ${res.status}`);
          return;
        }

        const data = await res.json();
        if (!data) return;

        setHeading(data.heading || "");
        setSubHeading(data.subheading || "");
        setCategoryHeading(data.sidebar_heading || "");
      } catch (err) {
        console.error("Network error while fetching course content", err);
        toast.error("Network error: Failed to fetch course content");
      }
    })();
  }, []);

  /* ===================== SAVE DATA ===================== */
  async function saveData() {
    setIsSaving(true);
    console.log("=== Course Listing Save Started ===");

    // Client-side validation: ensure required fields are present
    const trimmedHeading = heading.trim();
    const trimmedSubHeading = subHeading.trim();
    const trimmedCategoryHeading = categoryHeading.trim();

    if (!trimmedHeading || !trimmedSubHeading || !trimmedCategoryHeading) {
      toast.error("Please fill all required fields before submitting.");
      setIsSaving(false);
      return;
    }

    const payload = {
      heading: trimmedHeading,
      subheading: trimmedSubHeading,
      sidebar_heading: trimmedCategoryHeading,
    };

    console.log("Payload:", payload);

    try {
      const url = `/api/course-page-content`;
      console.log("Fetching:", url);

      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      console.log("Response status:", res.status, "ok:", res.ok);

      let result: Record<string, unknown> | null = null;
      try {
        result = (await res.json()) as Record<string, unknown>;
        console.log("Response JSON:", result);
      } catch (e) {
        console.debug("Non-JSON response", e);
        result = { message: `HTTP ${res.status}` };
      }

      if (res.ok) {
        console.log("Success! Updating UI...");
        toast.success("Course Page Updated Successfully!");
      } else {
        // Try to show a useful error from validation or message
        let message = "Failed to update";
        if (result && typeof result === "object") {
          const r = result as Record<string, unknown>;
          if (Object.prototype.hasOwnProperty.call(r, "errors")) {
            const errs = r["errors"];
            if (errs && typeof errs === "object") {
              const errObj = errs as Record<string, unknown>;
              const firstKey = Object.keys(errObj)[0];
              const firstVal = firstKey ? errObj[firstKey] : undefined;
              if (Array.isArray(firstVal) && firstVal.length > 0) {
                const firstMsg = firstVal[0];
                if (typeof firstMsg === "string") message = firstMsg;
              }
            }
          } else if (Object.prototype.hasOwnProperty.call(r, "message")) {
            const m = r["message"];
            if (typeof m === "string") message = m;
          }
        }
        console.error("Server error:", message);
        toast.error(message || "Failed to update");
      }
    } catch (err) {
      console.error("=== FETCH ERROR ===", err);
      const msg =
        err && typeof err === "object" && "message" in err
          ? (err as unknown as { message?: string }).message
          : String(err);
      toast.error(msg || "Network error: Failed to fetch");
    } finally {
      setIsSaving(false);
    }
  }

  /* ===================== UI ===================== */
  return (
    <section
      className="bg-white p-6 rounded-2xl shadow-sm"
      style={{ border: "1px solid rgba(16,24,40,0.08)" }}
    >
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Course Listing Page
      </h1>

      <div className="space-y-6">
        <AdminCard title="Course Listing Hero Section">
          <AdminInput label="Heading*" value={heading} onChange={setHeading} />

          <AdminInput
            label="Sub Heading*"
            value={subHeading}
            onChange={setSubHeading}
          />

          <AdminInput
            label="Sidebar Heading*"
            value={categoryHeading}
            onChange={setCategoryHeading}
          />
        </AdminCard>

        <div className="flex justify-end">
          <button
            onClick={saveData}
            className="bg-[#1A3F66] hover:bg-blue-800 text-white px-6 py-2.5 rounded-xl shadow-sm transition cursor-pointer"
          >
            {isSaving ? "Saving..." : "Submit"}
          </button>
        </div>
      </div>
    </section>
  );
}
