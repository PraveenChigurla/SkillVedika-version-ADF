// "use client";

// import { useState } from "react";
// import TipTapEditor from "@/app/dashboard/AllPages/CorporateTraining/components/TipTapEditor";
// import { BannerBox, AdminInput, AdminTextarea } from "@/app/dashboard/AllPages/CorporateTraining/components/AdminUI";

// export default function TermsConditionsPage() {
  
//   const [termsHeading, setTermsHeading] = useState(
//     "<h2>Terms of<span>use</span></h2>"
//   );

//   const [termsContent, setTermsContent] = useState(`
// <p>Nec vulputate natoque lobortis libero quis. Ultricies quam egestas...</p>
//   `);

//   return (
//     <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-6">
//       {/* PAGE BACKGROUND ADDED */}

//       {/* ⭐ MAIN PAGE HEADING */}
//       <h1 className="text-3xl font-bold text-gray-900 mb-4">
//         Terms And Conditions Page
//       </h1>

//       {/* ⭐ TERMS OF USE SECTION */}
//       <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
//         <h2 className="text-xl text-gray-700 font-semibold mb-4">Terms Of Use Section</h2>

//         <AdminInput
//           label="Page Heading*"
//           value={termsHeading}
//           onChange={setTermsHeading}
//         />

//         {/* ⭐ PAGE CONTENT EDITOR */}
//         <div className="space-y-2">
//           <label className="text-gray-600 font-semibold">Page Content*</label>

//           {/* Light Grey Border Added */}
//           <div className="border border-gray-300 rounded-lg">
//             <TipTapEditor value={termsContent} onChange={setTermsContent} />
//           </div>
//         </div>
//       </section>

//       {/* SUBMIT BUTTON ON RIGHT */}
//       <div className="pt-6 flex justify-end">
//         <button className="px-6 py-2 bg-blue-800 text-white rounded-lg hover:bg-blue-700 transition">
//           Submit
//         </button>
//       </div>
//     </div>
//   );
// }





"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import toast from "react-hot-toast";
import TipTapEditor from "../CorporateTraining/components/TipTapEditor"; 
import { AdminCard, AdminInput, AdminTextarea } from "@/app/dashboard/AllPages/CorporateTraining/components/AdminUI";

export default function TermsAndConditionsPage() {
  const [isSaving, setIsSaving] = useState(false);

  // -----------------------------
  // Local UI state (smooth typing)
  // -----------------------------
  const [title, setTitle] = useState("");
  const [content, setContent] = useState(""); // Tiptap HTML

  // -----------------------------
  // Memoized initial values (PREVENTS glitch)
  // -----------------------------
  const memoTitle = useMemo(() => title, [title]);
  const memoContent = useMemo(() => content, [content]);

  // -----------------------------
  // Save Handler
  // -----------------------------
  const handleSubmit = async () => {
    if (isSaving) return;

    setIsSaving(true);

    try {
      const token =
        globalThis.window !== undefined
          ? globalThis.window.localStorage.getItem("admin_token")
          : null;
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const payload = {
        title: memoTitle,
        content: memoContent,
      };

      const res = await fetch("/api/terms-and-conditions", {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      // Read the response as text first and attempt to parse JSON. If the
      // server returned HTML (for example an error page or redirect), parsing
      // will fail; capture that and show a helpful error instead of throwing
      // a syntax error.
      const text = await res.text();
      let parsed: unknown = null;
      try {
        parsed = JSON.parse(text);
      } catch {
        parsed = null;
      }

      if (!res.ok) {
        // Try to extract a message from parsed JSON, otherwise show raw text
        const p = parsed as Record<string, unknown> | null;
        let msgFromP: string | undefined;
        if (p) {
          if (typeof p["message"] === "string") {
            msgFromP = p["message"] as string;
          } else if (typeof p["error"] === "string") {
            msgFromP = p["error"] as string;
          }
        }
        const msg = msgFromP ?? text ?? `Status ${res.status}`;
        toast.error(String(msg));
        throw new Error(String(msg));
      }

      // success
      const data = (parsed as { data?: Record<string, unknown> } | null) ?? {};
      toast.success("Saved Successfully!");
      if (data && typeof data === "object" && "data" in data) {
        const rec = (data as { data?: Record<string, unknown> }).data;
        setTitle(typeof rec?.["title"] === "string" ? (rec!["title"] as string) : "");
        setContent(typeof rec?.["content"] === "string" ? (rec!["content"] as string) : "");
      }
    } catch (e) {
      console.error(e);
      toast.error("Save failed");
    } finally {
      setIsSaving(false);
    }
  };

  // -----------------------------
  // Fetch on Mount
  // -----------------------------
  useEffect(() => {
    (async () => {
      try {
        const token =
          globalThis.window !== undefined
            ? globalThis.window.localStorage.getItem("admin_token")
            : null;
        const headers: Record<string, string> = {
          Accept: "application/json",
        };
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const res = await fetch("/api/terms-and-conditions", {
          headers,
          cache: "no-store",
        });

        const text = await res.text();
        let parsed: unknown = null;
        try {
          parsed = JSON.parse(text);
        } catch {
          parsed = null;
        }

        if (!res.ok) {
          const p = parsed as Record<string, unknown> | null;
          let msgFromP: string | undefined;
          if (p) {
            if (typeof p["message"] === "string") {
              msgFromP = p["message"] as string;
            } else if (typeof p["error"] === "string") {
              msgFromP = p["error"] as string;
            }
          }
          const msg = msgFromP ?? text;
          console.debug("Failed to load terms: ", msg);
          return;
        }

        const record = (parsed as { data?: Record<string, unknown> } | null)?.data ?? null;
        if (record) {
          setTitle(typeof record["title"] === "string" ? (record["title"] as string) : "");
          setContent(typeof record["content"] === "string" ? (record["content"] as string) : "");
        }
      } catch (err) {
        console.error("Failed to load terms", err);
      }
    })();
  }, []);

  // -----------------------------
  // Render
  // -----------------------------
  return (
    <main className="mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-md p-6 space-y-10 border border-gray-100">
        <h1 className="text-3xl font-semibold">Terms & Conditions</h1>

        <AdminCard title="Terms & Conditions Editor">
          <AdminInput
            label="Page Title"
            value={memoTitle}
            onChange={setTitle}
          />

          <div className="space-y-2">
            <label className="text-gray-600 font-semibold">Content</label>
            <TipTapEditor value={memoContent} onChange={setContent} />
          </div>
        </AdminCard>

        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={isSaving}
            className="px-6 py-3 bg-[#1A3F66] hover:bg-blue-800 text-white rounded-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? "Saving..." : "Submit"}
          </button>
        </div>
      </div>
    </main>
  );
}
