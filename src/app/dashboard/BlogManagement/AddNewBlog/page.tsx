"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import TipTapEditor from "@/app/dashboard/AllPages/CorporateTraining/components/TipTapEditor";
import {
  AdminCard,
  AdminInput,
  AdminTextarea,
  BannerBox,
} from "@/app/dashboard/AllPages/CorporateTraining/components/AdminUI";

import axios from "@/utils/axios";
import { isAxiosError } from "axios";
import toast from "react-hot-toast";
import { uploadToCloudinary } from "@/services/cloudinaryUpload";

interface BlogData {
  blog_name: string;
  category_id: number | null;
  banner_image: string;
  thumbnail_image: string;
  short_description: string;
  blog_content: string;
  published_by: string;
  published_at: string | null;
  status: string;
  recent_blog: string;
  meta_title: string;
  meta_description: string;
  meta_keywords: string;
}

interface BlogCategory {
  id: number;
  name: string;
}

export default function AddNewBlogPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const blogId = searchParams.get("blogId");
  const isEditMode = !!blogId;

  /* -------------------- STATES -------------------- */
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [metaKeywords, setMetaKeywords] = useState("");
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [categoryId, setCategoryId] = useState("");
  const [blogTitle, setBlogTitle] = useState("");
  const [shortContent, setShortContent] = useState("");
  const [fullContent, setFullContent] = useState("");
  const [bannerImage, setBannerImage] = useState("");
  const [thumbnailImage, setThumbnailImage] = useState("");
  const [publishedBy, setPublishedBy] = useState("");
  const [publishedAt, setPublishedAt] = useState("");
  const [status, setStatus] = useState("draft");
  const [recentBlog, setRecentBlog] = useState("NO");
  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);

  /* -------------------- FETCH CATEGORIES -------------------- */
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await axios.get("/blog-categories");
        setCategories(res.data);
      } catch (err) {
        console.error("Failed to load blog categories:", err);
        toast.error("Failed to load blog categories");
      }
    };
    void loadCategories();
  }, []);

  /* -------------------- FETCH BLOG DATA (EDIT MODE) -------------------- */
  const fetchBlogData = useCallback(async () => {
    if (!blogId) return;
    try {
      setLoading(true);
      const res = await axios.get(`/blogs/${blogId}`);
      const blog = res.data as BlogData & { blog_id?: number };

      // Pre-populate form with blog data
      setMetaTitle(blog.meta_title || "");
      setMetaDescription(blog.meta_description || "");
      setMetaKeywords(blog.meta_keywords || "");
      setCategoryId(String(blog.category_id || ""));
      setBlogTitle(blog.blog_name || "");
      setShortContent(blog.short_description || "");
      setFullContent(blog.blog_content || "");
      setBannerImage(blog.banner_image || "");
      setThumbnailImage(blog.thumbnail_image || "");
      setPublishedBy(blog.published_by || "");
      setPublishedAt(blog.published_at || "");
      setStatus(blog.status || "draft");
      setRecentBlog(blog.recent_blog || "NO");
    } catch (error) {
      console.error("Failed to load blog data:", error);
      toast.error("Failed to load blog data");
    } finally {
      setLoading(false);
    }
  }, [blogId]);

  useEffect(() => {
    if (isEditMode) {
      void fetchBlogData();
    }
  }, [isEditMode, fetchBlogData]);

  /* -------------------- RESET FORM -------------------- */
  const resetForm = () => {
    setBlogTitle("");
    setFullContent("");
    setShortContent("");
    setBannerImage("");
    setThumbnailImage("");
    setPublishedBy("");
    setPublishedAt("");
    setStatus("draft");
    setRecentBlog("NO");
    setCategoryId("");
    setMetaTitle("");
    setMetaDescription("");
    setMetaKeywords("");
  };

  /* -------------------- SUBMIT HANDLER -------------------- */
  const handleSubmit = async () => {
    // Validate required fields
    if (!blogTitle.trim()) {
      toast.error("Blog title is required!");
      return;
    }
    if (!fullContent.trim()) {
      toast.error("Blog content is required!");
      return;
    }

    try {
      setSubmitting(true);

      let bannerUrl = bannerImage;
      let thumbnailUrl = thumbnailImage;

      // Upload banner image if it's a new file (base64 or file path)
      if (
        bannerImage &&
        (bannerImage.startsWith("data:") || !bannerImage.includes("://"))
      ) {
        try {
          const file = await fetch(bannerImage).then((r) => r.blob());
          bannerUrl = await uploadToCloudinary(new File([file], "banner.jpg"));
        } catch {
          // If conversion fails, use as-is
          bannerUrl = bannerImage;
        }
      }

      // Upload thumbnail image if it's a new file
      if (
        thumbnailImage &&
        (thumbnailImage.startsWith("data:") || !thumbnailImage.includes("://"))
      ) {
        try {
          const file = await fetch(thumbnailImage).then((r) => r.blob());
          thumbnailUrl = await uploadToCloudinary(
            new File([file], "thumbnail.jpg")
          );
        } catch {
          // If conversion fails, use as-is
          thumbnailUrl = thumbnailImage;
        }
      }

      const payload = {
        blog_name: blogTitle,
        category_id: categoryId || null,
        banner_image: bannerUrl,
        thumbnail_image: thumbnailUrl,
        short_description: shortContent,
        blog_content: fullContent,
        published_by: publishedBy,
        published_at: publishedAt || null,
        status,
        recent_blog: recentBlog,
        meta_title: metaTitle,
        meta_description: metaDescription,
        meta_keywords: metaKeywords,
      };

      if (isEditMode && blogId) {
        // Update existing blog (use public fallback in dev)
        await axios.put(`/public/blogs/${blogId}`, payload);
        toast.success("Blog updated successfully!");
      } else {
        // Create new blog (use public fallback in dev)
        await axios.post("/public/blogs", payload);
        toast.success("Blog created successfully!");
        resetForm();
      }

      // Redirect to AllBlogs after success
      router.push("/dashboard/BlogManagement/AllBlogs");
    } catch (error: unknown) {
      console.error("blog operation error:", error);
      let serverMessage = isEditMode
        ? "Failed to update blog!"
        : "Failed to create blog!";
      try {
        if (isAxiosError(error)) {
          const resp = error.response;
          const respData = (resp && resp.data) as
            | {
                message?: string;
                error?: string;
                errors?: Record<string, string[]>;
              }
            | undefined;
          if (resp?.status === 401) {
            serverMessage =
              "Unauthenticated. Please login as admin to manage blogs.";
          } else if (resp?.status === 422 && respData?.errors) {
            const errors = Object.values(respData.errors).flat();
            serverMessage = errors.join(" ");
          } else {
            serverMessage =
              respData?.message ||
              respData?.error ||
              (error as Error).message ||
              serverMessage;
          }
        } else if (error instanceof Error) {
          serverMessage = error.message || serverMessage;
        }
      } catch {
        // fallback
      }
      toast.error(serverMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-gray-600">Loading blog data...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-10">
      <h1 className="text-2xl font-bold text-gray-800">
        {isEditMode ? "Edit Blog" : "Add New Blog"}
      </h1>

      {/* ----------------------------------------------------------- */}
      {/* BLOG META DATA */}
      {/* ----------------------------------------------------------- */}
      <AdminCard title="Blog MetaData">
        <AdminInput
          label="Meta Title"
          value={metaTitle}
          onChange={setMetaTitle}
        />

        <AdminTextarea
          label="Meta Description"
          value={metaDescription}
          onChange={setMetaDescription}
          rows={3}
        />

        <AdminInput
          label="Meta Keywords"
          value={metaKeywords}
          onChange={setMetaKeywords}
        />

        {/* Category Dropdown */}
        <div>
          <label className="text-gray-600 font-semibold mb-1 block">
            Blog Category
          </label>
          <select
            className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={String(cat.id)}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </AdminCard>

      {/* ----------------------------------------------------------- */}
      {/* BLOG DETAILS */}
      {/* ----------------------------------------------------------- */}
      <AdminCard title="Blog Details">
        <AdminInput
          label="Blog Title"
          value={blogTitle}
          onChange={setBlogTitle}
        />

        <AdminTextarea
          label="Blog Short Content"
          value={shortContent}
          onChange={setShortContent}
          rows={3}
        />

        {/* Full Content Editor */}
        <div>
          <label className="text-gray-600 font-semibold mb-1 block">
            Blog Full Content
          </label>
          <TipTapEditor value={fullContent} onChange={setFullContent} />
        </div>

        {/* IMAGES */}
        <BannerBox
          label="Banner Image"
          image={bannerImage}
          onUpload={setBannerImage}
        />

        <BannerBox
          label="Thumbnail Image"
          image={thumbnailImage}
          onUpload={setThumbnailImage}
        />
      </AdminCard>

      {/* ----------------------------------------------------------- */}
      {/* ADDITIONAL FIELDS */}
      {/* ----------------------------------------------------------- */}
      <AdminCard title="Additional Settings">
        <AdminInput
          label="Published By"
          value={publishedBy}
          onChange={setPublishedBy}
        />

        <div>
          <label className="text-gray-600 font-semibold mb-1 block">
            Published At
          </label>
          <input
            type="datetime-local"
            value={publishedAt}
            onChange={(e) => setPublishedAt(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-300"
          />
        </div>

        {/* Status */}
        <div>
          <label className="text-gray-600 font-semibold mb-1 block">
            Status
          </label>
          <select
            className="w-full px-4 py-2 rounded-lg border border-gray-300"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        {/* Recent Blog Flag */}
        <div>
          <label className="text-gray-600 font-semibold mb-1 block">
            Recent Blog
          </label>
          <select
            className="w-full px-4 py-2 rounded-lg border border-gray-300"
            value={recentBlog}
            onChange={(e) => setRecentBlog(e.target.value)}
          >
            <option value="NO">NO</option>
            <option value="YES">YES</option>
          </select>
        </div>
      </AdminCard>

      {/* ----------------------------------------------------------- */}
      {/* SUBMIT BUTTON */}
      {/* ----------------------------------------------------------- */}
      <div className="flex gap-4">
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="px-6 py-3 bg-[#1A3F66] hover:bg-blue-800 text-white rounded-lg transition disabled:bg-gray-400"
        >
          {submitting ? "Saving..." : isEditMode ? "Update Blog" : "Create Blog"}
        </button>
        <button
          onClick={() => router.push("/dashboard/BlogManagement/AllBlogs")}
          className="px-6 py-3 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
