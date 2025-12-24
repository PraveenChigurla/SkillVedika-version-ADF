"use client";

// import { useState, ChangeEvent } from "react";
import { useState, useEffect, ReactNode } from "react";
import axios from "@/utils/axios";
import toast from "react-hot-toast";
// import Image from "next/image";
// import { FiUploadCloud } from "react-icons/fi";

// OUTER WHITE CARD
function PageCard({ children }: { children: ReactNode }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-200 mb-8">
      {children}
    </div>
  );
}

// INNER GREY CARD
function InnerCard({ children }: { children: ReactNode }) {
  return (
    <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200 mb-6">
      {children}
    </div>
  );
}

// Default program list kept at module scope (not shown by admin unless backend sends data)
const DEFAULT_PROGRAM_LIST = [
  { id: 1, title: 'Course Completion', desc: 'Get hands on training from experts' },
  { id: 2, title: 'Quizzes', desc: 'Know where you stand in mastering' },
  { id: 3, title: 'Mock Interview', desc: 'Experience real time interviews with SMEs' },
  { id: 4, title: 'Skillvedika Rating', desc: 'Understand your learning performance through SV score' },
  { id: 5, title: 'Resume Building', desc: 'Build your portfolio with our experts assistance' },
  { id: 6, title: 'Marketing Profile', desc: 'Take advantage of Skill Vedika marketing your skills' },
];

// normalize to ensure controlled inputs always receive strings
function normalizePoints(points: any[] | undefined) {
  if (!Array.isArray(points)) return DEFAULT_PROGRAM_LIST.map((p) => ({ ...p }));
  return points.map((p: any, i: number) => ({
    id: p.id ?? i + 1,
    title: (p.title ?? p.name ?? (typeof p === 'string' ? p : '')) || '',
    desc: (p.desc ?? p.description ?? p.text ?? '') || '',
  }));
}

export default function JobAssistanceProgramPage() {
  // const [preview, setPreview] = useState<any>({});

  // const handleUpload = (e: ChangeEvent<HTMLInputElement>, key: string) => {
  //   const file = e.target.files?.[0];
  //   if (file) {
  //     setPreview((prev: any) => ({
  //       ...prev,
  //       [key]: URL.createObjectURL(file),
  //     }));
  //   }
  // };

  const [saving, setSaving] = useState(false);
  const [recordId, setRecordId] = useState<number | null>(null);
  // start empty — do not show default data on initial load
  const [programs, setPrograms] = useState<any[]>([]);
  const [heroTitle, setHeroTitle] = useState<string>("");
  const [heroSubtitle, setHeroSubtitle] = useState<string>("");

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await axios.get('/course-details/job-assistance');
        const payload = res.data?.data;
        if (!payload) return;
        if (!mounted) return;
        setRecordId(payload.id ?? null);
        // title can be stored as object {text:..} or plain
        if (payload.title) {
          if (typeof payload.title === 'string') setHeroTitle(payload.title);
          else if (typeof payload.title === 'object') setHeroTitle(payload.title.text ?? JSON.stringify(payload.title));
        }
        if (payload.subtitle) setHeroSubtitle(payload.subtitle ?? '');
        if (payload.points) setPrograms(normalizePoints(payload.points));
      } catch (e) {
        console.debug('Could not load job assistance content', e);
      }
    };
    void load();
    return () => { mounted = false; };
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        title: heroTitle,
        subtitle: heroSubtitle,
        points: programs,
      };

      if (recordId) {
        const res = await axios.put(`/course-details/job-assistance/${recordId}`, payload);
        toast.success('Updated Successfully');
        if (res.data?.data?.id) setRecordId(res.data.data.id);
      } else {
        const res = await axios.post(`/course-details/job-assistance`, payload);
        toast.success('Saved successfully');
        if (res.data?.data?.id) setRecordId(res.data.data.id);
      }
    } catch (err: any) {
      console.error('save error', err);
      toast.error(err?.response?.data?.message ?? 'Could not save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageCard>
      <div className="w-full">
        {/* PAGE TITLE */}
        <h1 className="text-3xl font-bold mb-8">
          Job Assistance Program Section
        </h1>

        {/* ================================================= */}
        {/*                HERO SECTION CARD                  */}
        {/* ================================================= */}

        <PageCard>
          <h2 className="text-xl font-semibold mb-4 text-gray-700">
            Hero Section
          </h2>

          <InnerCard>
            <label className="font-semibold block mb-2 text-gray-600">
              Title Heading <span className="text-red-500 ">*</span>
            </label>
            <input
              type="text"
              value={heroTitle}
              onChange={(e) => setHeroTitle(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 shadow-sm mb-6"
            />

            <label className="font-semibold block mb-2 text-gray-600">
              Title Description <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={4}
              value={heroSubtitle}
              onChange={(e) => setHeroSubtitle(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 shadow-sm mb-6"
            />

          </InnerCard>
        </PageCard>

        {/* ================================================= */}
        {/*              PROGRAM LIST CARDS                   */}
        {/* ================================================= */}

        {programs.map((p, idx) => (
          <PageCard key={p.id}>
            <h2 className="text-xl font-semibold mb-4 text-gray-700">
              Job Assistance Program {p.id}
            </h2>

            <InnerCard>
              <label className="font-semibold block mb-2 text-gray-600">
                Program Title
              </label>
              <input
                type="text"
                value={p.title ?? p.name ?? ''}
                onChange={(e) =>
                  setPrograms((prev) => {
                    const next = [...prev];
                    next[idx] = { ...next[idx], title: e.target.value };
                    return next;
                  })
                }
                className="w-full border border-gray-300 rounded-lg p-3 shadow-sm mb-6"
              />

              <label className="font-semibold block mb-2 text-gray-600">
                Program Description
              </label>
              <textarea
                rows={3}
                value={p.desc ?? p.description ?? ''}
                onChange={(e) =>
                  setPrograms((prev) => {
                    const next = [...prev];
                    next[idx] = { ...next[idx], desc: e.target.value };
                    return next;
                  })
                }
                className="w-full border border-gray-300 rounded-lg p-3 shadow-sm mb-6"
              />
            </InnerCard>
          </PageCard>
        ))}

        {/* SUBMIT BUTTON – RIGHT SIDE */}
        <div className="flex justify-end mt-8">
          <button
            onClick={() => void handleSave()}
            className="bg-[#1A3F66] hover:bg-blue-800 text-white px-10 py-3 rounded-lg shadow transition font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Submit'}
          </button>
        </div>
      </div>
    </PageCard>
  );
}
