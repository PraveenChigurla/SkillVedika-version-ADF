"use client";

import { useEffect, useState, useCallback } from "react";
import axios from "@/utils/axios"; // ← your axios instance
import { FiSearch } from "react-icons/fi";
import { FaEdit } from "react-icons/fa";

import { AdminInput, AdminTextarea } from "@/app/dashboard/AllPages/CorporateTraining/components/AdminUI";

interface SeoRow {
  id: number;
  page_name: string;
  meta_title: string;
  meta_description: string;
  meta_keywords: string;
  updated_at: string;
}

export default function SEOManagementPage() {
  const [rows, setRows] = useState<SeoRow[]>([]);
  // loading state not used in UI; omitted to avoid unused variable warnings
  const [search, setSearch] = useState("");

  // Modal State
  const [openModal, setOpenModal] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [metaKeywords, setMetaKeywords] = useState("");
  const [pageName, setPageName] = useState("");

  // -------------------------------------------
  // LOAD ALL SEO ROWS
  // -------------------------------------------
  const fetchRows = useCallback(async () => {
    try {
      const res = await axios.get("/seo");
      // backend returns either a single object (latest) or an array depending on implementation.
      // Normalize into an array for the UI table.
      const payload = res.data?.data;
      if (Array.isArray(payload)) setRows(payload);
      else if (payload) setRows([payload]);
      else setRows([]);
    } catch (err) {
      console.error(err);
    } finally {
    }
  }, []);

  useEffect(() => {
    // call fetchRows inside effect via the stable callback
    void fetchRows();
  }, [fetchRows]);

  // -------------------------------------------
  // OPEN MODAL + LOAD SEO DETAILS
  // -------------------------------------------
  const openEditModal = async (id: number) => {
    setSelectedId(id);
    setOpenModal(true);

    try {
      const res = await axios.get(`/seo/${id}`);
      const data = res.data.data;

      setPageName(data.page_name);
      setMetaTitle(data.meta_title || "");
      setMetaDescription(data.meta_description || "");
      setMetaKeywords(data.meta_keywords || "");
    } catch (err) {
      console.error(err);
    }
  };

  // -------------------------------------------
  // UPDATE SEO
  // -------------------------------------------
  const handleSave = async () => {
    if (!selectedId) return;

    try {
      await axios.post(`/seo/${selectedId}`, {
        meta_title: metaTitle,
        meta_description: metaDescription,
        meta_keywords: metaKeywords,
      });

      setOpenModal(false);
      fetchRows();
    } catch (err) {
      console.error(err);
    }
  };

  // -------------------------------------------
  // FILTER TABLE
  // -------------------------------------------
  const filteredRows = rows.filter((row) =>
    row.page_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-white shadow-sm rounded-2xl p-8 mb-8">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">All SEO</h1>

        <div className="relative w-72">
          <FiSearch className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="search page..."
            className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2 shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-gray-50 p-6 rounded-xl shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-y-0">
            <thead>
              <tr className="text-gray-700 font-semibold">
                <th className="py-3 px-4">ID</th>
                <th className="py-3 px-4">Page</th>
                <th className="py-3 px-4">Meta Title</th>
                <th className="py-3 px-4">Meta Description</th>
                <th className="py-3 px-4">Last Updated Date</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredRows.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center text-red-500 py-4 text-sm"
                  >
                    No SEO data found.
                  </td>
                </tr>
              )}

              {filteredRows.map((row) => (
                <tr
                  key={row.id}
                  className="bg-white shadow rounded-lg hover:shadow-md transition"
                >
                  <td className="py-3 px-4">{row.id}</td>
                  <td className="py-3 px-4 font-medium">{row.page_name}</td>
                  <td className="py-3 px-4">{row.meta_title}</td>
                  <td className="py-3 px-4 truncate max-w-xs">
                    {row.meta_description}
                  </td>
                  <td className="py-3 px-4">
                    {new Date(row.updated_at).toLocaleString()}
                  </td>

                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => openEditModal(row.id)}
                      className="p-2 bg-yellow-500 text-white rounded-lg shadow hover:bg-yellow-600 transition"
                    >
                      <FaEdit size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ------------------------------------------- */}
      {/* EDIT MODAL */}
      {/* ------------------------------------------- */}
      {openModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-[600px] shadow-xl space-y-5">
            <h2 className="text-xl font-bold">
              Edit SEO — <span className="text-blue-700">{pageName}</span>
            </h2>

            <AdminInput
              label="Meta Title*"
              value={metaTitle}
              onChange={setMetaTitle}
            />

            <AdminTextarea
              label="Meta Description*"
              value={metaDescription}
              onChange={setMetaDescription}
              rows={4}
            />

            <AdminTextarea
              label="Meta Keywords*"
              value={metaKeywords}
              onChange={setMetaKeywords}
              rows={3}
            />

            {/* ACTIONS */}
            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={() => setOpenModal(false)}
                className="px-4 py-2 border rounded-lg"
              >
                Cancel
              </button>

              <button
                onClick={handleSave}
                className="px-6 py-2 bg-[#1A3F66] hover:bg-blue-800 text-white rounded-lg shadow"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
