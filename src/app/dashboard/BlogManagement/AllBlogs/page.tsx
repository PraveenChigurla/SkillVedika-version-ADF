"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { FaEdit, FaTrash } from "react-icons/fa";
import axios from "@/utils/axios";
import { isAxiosError } from "axios";
import toast from "react-hot-toast";

interface Blog {
  blog_id: number;
  blog_name: string;
  banner_image: string;
  thumbnail_image: string;
  status: string;
  created_at: string | null;
  updated_at: string | null;
  category_id: number | null;
  short_description: string;
  blog_content: string;
  published_by: string;
  published_at: string | null;
  recent_blog: string;
  meta_title: string;
  meta_description: string;
  meta_keywords: string;
}

export default function AllBlogs() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(
    null
  );

  /* -------------------- FETCH BLOGS -------------------- */
  const fetchBlogs = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get("/blogs");
      // normalize response shapes: support array or { data: [...] }
      const raw = response.data ?? [];
      const list = Array.isArray(raw) ? raw : raw.data ?? [];
      // Ensure required fields are present to avoid runtime crashes
      const safe = (list || []).map((b: any) => ({
        ...b,
        blog_name: b.blog_name || b.title || b.name || "",
        banner_image: b.banner_image ?? b.image ?? b.thumbnail ?? null,
      }));
      setBlogs(safe);
    } catch (error) {
      console.error("Failed to fetch blogs:", error);
      toast.error("Failed to load blogs");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchBlogs();
  }, [fetchBlogs]);

  /* -------------------- RESOLVE IMAGE URL -------------------- */
  const resolveImageUrl = (imageUrl: any): string => {
    const fallback = "/placeholder.png";
    if (!imageUrl) return fallback;
    // If object, prefer common keys
    if (typeof imageUrl === "object") {
      const candidate = imageUrl.secure_url || imageUrl.url || imageUrl.path || imageUrl.src || imageUrl.thumbnail;
      if (!candidate) return fallback;
      imageUrl = candidate;
    }
    if (typeof imageUrl !== "string") return fallback;
    if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
      return imageUrl;
    }
    if (imageUrl.startsWith("/")) return imageUrl;
    return `/storage/${imageUrl}`;
  };

  /* -------------------- FORMAT DATE -------------------- */
  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "N/A";
    }
  };

  /* -------------------- STATUS COLOR -------------------- */
  const getStatusColor = (status: string): string => {
    switch (status?.toLowerCase()) {
      case "published":
        return "bg-green-200 text-green-700";
      case "draft":
        return "bg-yellow-200 text-yellow-700";
      case "archived":
        return "bg-gray-200 text-gray-700";
      default:
        return "bg-gray-200 text-gray-700";
    }
  };

  /* -------------------- HANDLE EDIT -------------------- */
  const handleEdit = (blogId: number) => {
    router.push(`/dashboard/BlogManagement/AddNewBlog?blogId=${blogId}`);
  };

  /* -------------------- HANDLE DELETE -------------------- */
  const handleDelete = async (blogId: number) => {
    try {
      await axios.delete(`/blogs/${blogId}`);
      toast.success("Blog deleted successfully!");
      setShowDeleteConfirm(null);
      await fetchBlogs();
    } catch (error) {
      console.error("Failed to delete blog:", error);
      let errorMessage = "Failed to delete blog";
      if (isAxiosError(error)) {
        const respData = error.response?.data as
          | { message?: string; error?: string }
          | undefined;
        errorMessage = respData?.message || respData?.error || errorMessage;
      }
      toast.error(errorMessage);
    }
  };

  /* -------------------- FILTER BLOGS -------------------- */
  const filtered = blogs.filter((blog) => {
    const name = (blog.blog_name || "").toString().toLowerCase();
    const idStr = (blog.blog_id ?? "").toString();
    const q = search.toLowerCase();
    return name.includes(q) || idStr.includes(search);
  });

  return (
    <div className="p-8 bg-white rounded-3xl shadow-md border border-gray-200">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">All Blogs</h1>

        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/dashboard/BlogManagement/AddNewBlog")}
            className="bg-[#1A3F66] hover:bg-blue-800 text-white px-6 py-2.5 rounded-xl shadow-sm transition"
          >
            Add New Blog
          </button>

          <input
            type="text"
            placeholder="Search blogs..."
            className="px-4 py-2 border border-gray-300 rounded-xl shadow-sm w-64 focus:ring focus:ring-blue-200 outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* LOADING STATE */}
      {loading && (
        <div className="py-8 text-center text-gray-500">Loading blogs...</div>
      )}

      {/* TABLE */}
      {!loading && (
        <div className="overflow-x-auto rounded-2xl bg-white">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-4 px-6 font-semibold text-gray-700 text-left">
                  ID
                </th>
                <th className="py-4 px-6 font-semibold text-gray-700 text-left">
                  Blog Title
                </th>
                <th className="py-4 px-6 font-semibold text-gray-700 text-center">
                  Banner Image
                </th>
                <th className="py-4 px-6 font-semibold text-gray-700 text-left">
                  Created Date
                </th>
                <th className="py-4 px-6 font-semibold text-gray-700 text-left">
                  Last Updated Date
                </th>
                <th className="py-4 px-6 font-semibold text-gray-700 text-left">
                  Status
                </th>
                <th className="py-4 px-6 font-semibold text-gray-700 text-right">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((blog) => (
                <tr
                  key={blog.blog_id}
                  className="border-b border-gray-200 align-middle"
                >
                  {/* ID */}
                  <td className="py-4 px-6 text-gray-800 text-left align-middle">
                    {blog.blog_id}
                  </td>

                  {/* TITLE */}
                  <td className="py-4 px-6 text-gray-800 text-left align-middle">
                    {blog.blog_name}
                  </td>

                  {/* BANNER IMAGE */}
                  <td className="py-4 px-6 text-center align-middle">
                    <img
                      src={resolveImageUrl(blog.banner_image)}
                      alt={blog.blog_name}
                      className="w-32 h-20 object-cover rounded-lg shadow-sm"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/placeholder.png";
                      }}
                    />
                  </td>

                  {/* DATES */}
                  <td className="py-4 px-6 text-gray-700 text-left align-middle">
                    {formatDate(blog.created_at)}
                  </td>
                  <td className="py-4 px-6 text-gray-700 text-left align-middle">
                    {formatDate(blog.updated_at)}
                  </td>

                  {/* STATUS */}
                  <td className="py-4 px-6 align-middle">
                    <span
                      className={`${getStatusColor(
                        blog.status
                      )} px-4 py-1 rounded-full text-sm`}
                    >
                      {blog.status || "Unknown"}
                    </span>
                  </td>

                  {/* ACTIONS */}
                  <td className="py-4 px-6 text-right align-middle">
                    <div className="flex items-center justify-end gap-4">
                      <button
                        onClick={() => handleEdit(blog.blog_id)}
                        className="text-yellow-600 bg-[#FFF6C4] p-2 rounded-xl shadow-sm hover:bg-[#FFEF9E] transition flex items-center justify-center cursor-pointer"
                        title="Edit blog"
                      >
                        <FaEdit size={18} />
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(blog.blog_id)}
                        className="text-red-600 bg-[#FFE3E3] p-2 rounded-xl shadow-sm hover:bg-[#FFCCCC] transition flex items-center justify-center cursor-pointer"
                        title="Delete blog"
                      >
                        <FaTrash size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="py-8 text-center text-gray-500 italic"
                  >
                    {search ? "No blogs found." : "No blogs yet."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {showDeleteConfirm !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 rounded-2xl">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-sm w-full mx-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Confirm Delete
            </h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this blog? This action cannot be
              undone.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(showDeleteConfirm)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
