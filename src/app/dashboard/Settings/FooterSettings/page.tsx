"use client";

import { useEffect, useState, useCallback } from "react";
import axios from "@/utils/axios";
import { isAxiosError } from "axios";
import toast from "react-hot-toast";
import { FaTrash, FaSave } from "react-icons/fa";
import { BannerBox } from "@/app/dashboard/AllPages/CorporateTraining/components/AdminUI";

interface FooterLink {
  slug: string;
  text: string;
}

interface ContactDetails {
  email: string;
  phone: string;
  locations: string[];
}

interface SocialLinks {
  whatsapp: string;
  instagram: string;
  twitter: string;
  youtube: string;
  facebook: string;
}

interface FooterSettings {
  id: number;
  get_in_touch: string;
  email_placeholder: string;
  logo: string;
  about: string;
  explore: string;
  explore_links: FooterLink[];
  support: string;
  support_links: FooterLink[];
  contact: string;
  contact_details: ContactDetails;
  follow_us: string;
  social_media_icons: string[];
  social_links: SocialLinks;
  copyright: string;
  created_at?: string;
  updated_at?: string;
}

export default function FooterSettingsPage() {
  const [settings, setSettings] = useState<FooterSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Normalize incoming settings from backend so inputs never get `null`.
  const normalizeSettings = (s: Partial<FooterSettings>): FooterSettings => {
    const defaults: FooterSettings = {
      id: s?.id || 0,
      get_in_touch: s?.get_in_touch ?? "",
      email_placeholder: s?.email_placeholder ?? "",
      logo: s?.logo ?? "",
      about: s?.about ?? "",
      explore: s?.explore ?? "",
      explore_links: Array.isArray(s?.explore_links) ? s.explore_links : [],
      support: s?.support ?? "",
      support_links: Array.isArray(s?.support_links) ? s.support_links : [],
      contact: s?.contact ?? "",
      contact_details: {
        email: s?.contact_details?.email ?? "",
        phone: s?.contact_details?.phone ?? "",
        locations: Array.isArray(s?.contact_details?.locations) ? s.contact_details.locations : [],
      },
      follow_us: s?.follow_us ?? "",
      social_media_icons: Array.isArray(s?.social_media_icons) ? s.social_media_icons : [],
      social_links: {
        whatsapp: s?.social_links?.whatsapp ?? "",
        instagram: s?.social_links?.instagram ?? "",
        twitter: s?.social_links?.twitter ?? "",
        youtube: s?.social_links?.youtube ?? "",
        facebook: s?.social_links?.facebook ?? "",
      },
      copyright: s?.copyright ?? "",
      created_at: s?.created_at,
      updated_at: s?.updated_at,
    };

    return defaults;
  };

  // Load footer settings
  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get("/footer-settings");
      const raw = res.data.data || res.data;
      setSettings(normalizeSettings(raw));
    } catch (err) {
      console.error("Failed to load footer settings:", err);
      toast.error("Failed to load footer settings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchSettings();
  }, [fetchSettings]);

  const handleFieldChange = (field: keyof FooterSettings, value: string) => {
    if (settings && field in settings && typeof settings[field] === "string") {
      setSettings({ ...settings, [field]: value });
    }
  };

  // Explore links handlers
  const handleExploreLinkUpdate = (index: number, field: keyof FooterLink, value: string) => {
    if (settings) {
      const updated = [...settings.explore_links];
      updated[index] = { ...updated[index], [field]: value };
      setSettings({ ...settings, explore_links: updated });
    }
  };

  const handleExploreLinkDelete = (index: number) => {
    if (settings) {
      setSettings({
        ...settings,
        explore_links: settings.explore_links.filter((_, i) => i !== index),
      });
    }
  };

  const handleAddExploreLink = () => {
    if (settings) {
      setSettings({
        ...settings,
        explore_links: [...settings.explore_links, { slug: "/", text: "New Link" }],
      });
    }
  };

  // Support links handlers
  const handleSupportLinkUpdate = (index: number, field: keyof FooterLink, value: string) => {
    if (settings) {
      const updated = [...settings.support_links];
      updated[index] = { ...updated[index], [field]: value };
      setSettings({ ...settings, support_links: updated });
    }
  };

  const handleSupportLinkDelete = (index: number) => {
    if (settings) {
      setSettings({
        ...settings,
        support_links: settings.support_links.filter((_, i) => i !== index),
      });
    }
  };

  const handleAddSupportLink = () => {
    if (settings) {
      setSettings({
        ...settings,
        support_links: [...settings.support_links, { slug: "/", text: "New Link" }],
      });
    }
  };

  // Contact details handlers
  const handleLocationUpdate = (index: number, value: string) => {
    if (settings) {
      const updated = [...settings.contact_details.locations];
      updated[index] = value;
      setSettings({
        ...settings,
        contact_details: { ...settings.contact_details, locations: updated },
      });
    }
  };

  const handleLocationDelete = (index: number) => {
    if (settings) {
      setSettings({
        ...settings,
        contact_details: {
          ...settings.contact_details,
          locations: settings.contact_details.locations.filter((_, i) => i !== index),
        },
      });
    }
  };

  const handleAddLocation = () => {
    if (settings) {
      setSettings({
        ...settings,
        contact_details: {
          ...settings.contact_details,
          locations: [...settings.contact_details.locations, ""],
        },
      });
    }
  };

  const handleContactDetailChange = (field: keyof ContactDetails, value: string) => {
    if (settings) {
      setSettings({
        ...settings,
        contact_details: { ...settings.contact_details, [field]: value },
      });
    }
  };

  // Social links handlers
  const handleSocialLinkChange = (platform: keyof SocialLinks, value: string) => {
    if (settings) {
      setSettings({
        ...settings,
        social_links: { ...settings.social_links, [platform]: value },
      });
    }
  };

  const handleSave = async () => {
    if (!settings) return;

    setIsSaving(true);

    try {
      await axios.put("/footer-settings", settings);
      toast.success("Footer settings updated successfully!");
    } catch (error) {
      console.error("Failed to save footer settings:", error);
      let errorMessage = "Failed to save footer settings";
      if (isAxiosError(error)) {
        const respData = error.response?.data as
          | { message?: string; error?: string }
          | undefined;
        errorMessage = respData?.message || respData?.error || errorMessage;
      }
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-gray-600">Loading footer settings...</div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-gray-600">Failed to load settings</div>
      </div>
    );
  }

  // (no-op) socialPlatforms removed — not used

  return (
  <div className="p-6 md:p-8 w-full space-y-8">

    {/* Page Title */}
    <h1 className="text-3xl font-bold text-gray-900">
      Footer Settings
    </h1>

    {/* Logo & General */}
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 border-b pb-3">
        Logo & General
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <BannerBox
          label="Upload Footer Logo"
          image={settings.logo}
          onUpload={(url: string) => handleFieldChange("logo", url)}
        />

        <div>
          <label htmlFor="email-placeholder" className="text-sm text-gray-700 font-medium block mb-1">
            Email Placeholder
          </label>
          <input
            id="email-placeholder"
            type="text"
            value={settings.email_placeholder}
            onChange={(e) => handleFieldChange("email_placeholder", e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
          />
        </div>
      </div>

      <div>
        <label htmlFor="about-us" className="text-sm text-gray-700 font-medium block mb-1">
          About Us
        </label>
        <textarea
          id="about-us"
          rows={3}
          value={settings.about}
          onChange={(e) => handleFieldChange("about", e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
        />
      </div>

      <div>
        <label htmlFor="get-in-touch" className="text-sm text-gray-700 font-medium block mb-1">
          Get in Touch Text
        </label>
        <input
          id="get-in-touch"
          type="text"
          value={settings.get_in_touch}
          onChange={(e) => handleFieldChange("get_in_touch", e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
        />
      </div>
    </div>

    {/* Explore Links */}
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 space-y-6">
      <div className="flex justify-between items-center border-b pb-3">
        <h2 className="text-xl font-semibold text-gray-900">Explore Links</h2>
        <button
          onClick={handleAddExploreLink}
          className="px-4 py-2 bg-[#1A3F66] hover:bg-blue-800 text-white rounded-lg"
        >
           Add Link
        </button>
      </div>

      <div className="space-y-4">
        {settings.explore_links.map((item, index) => (
          <div key={`explore-${item.slug}-${index}`} className="grid grid-cols-12 gap-4 items-center">
            <input
              type="text"
              value={item.text}
              onChange={(e) => handleExploreLinkUpdate(index, "text", e.target.value)}
              className="col-span-5 px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="Link Text"
            />

            <input
              type="text"
              value={item.slug}
              onChange={(e) => handleExploreLinkUpdate(index, "slug", e.target.value)}
              className="col-span-5 px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="/slug"
            />

            <button
              onClick={() => handleExploreLinkDelete(index)}
              className="col-span-2 text-red-600 hover:bg-red-50 py-2 rounded-lg"
            >
              <FaTrash size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>

    {/* Support Links */}
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 space-y-6">
      <div className="flex justify-between items-center border-b pb-3">
        <h2 className="text-xl font-semibold text-gray-900">Support Links</h2>
        <button
          onClick={handleAddSupportLink}
          className="px-4 py-2 bg-[#1A3F66] hover:bg-blue-800 text-white rounded-lg"
        >
           Add Link
        </button>
      </div>

      <div className="space-y-4">
        {settings.support_links.map((item, index) => (
          <div key={`support-${item.slug}-${index}`} className="grid grid-cols-12 gap-4 items-center">
            <input
              type="text"
              value={item.text}
              onChange={(e) => handleSupportLinkUpdate(index, "text", e.target.value)}
              className="col-span-5 px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="Link Text"
            />

            <input
              type="text"
              value={item.slug}
              onChange={(e) => handleSupportLinkUpdate(index, "slug", e.target.value)}
              className="col-span-5 px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="/slug"
            />

            <button
              onClick={() => handleSupportLinkDelete(index)}
              className="col-span-2 text-red-600 hover:bg-red-50 py-2 rounded-lg"
            >
              <FaTrash size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>

    {/* Contact Details */}
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 border-b pb-3">
        Contact Details
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="contact-email" className="text-sm text-gray-700">
            Email
          </label>
          <input
            id="contact-email"
            type="text"
            value={settings.contact_details.email}
            onChange={(e) => handleContactDetailChange("email", e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>

        <div>
          <label htmlFor="contact-phone" className="text-sm text-gray-700">
            Phone
          </label>
          <input
            id="contact-phone"
            type="text"
            value={settings.contact_details.phone}
            onChange={(e) => handleContactDetailChange("phone", e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>
      </div>

      {/* Locations */}
      <div className="space-y-4">
        <div className="flex justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Locations</h3>
          <button
            onClick={handleAddLocation}
            className="px-4 py-2 bg-[#1A3F66] hover:bg-blue-800 text-white rounded-lg"
          >
            Add Location
          </button>x
        </div>

        {settings.contact_details.locations.map((loc, index) => (
          <div key={`location-${index}-${loc}`} className="grid grid-cols-12 gap-4 items-center">
            <input
              type="text"
              value={loc}
              onChange={(e) => handleLocationUpdate(index, e.target.value)}
              className="col-span-10 px-4 py-2 border border-gray-300 rounded-lg"
            />

            <button
              onClick={() => handleLocationDelete(index)}
              className="col-span-2 text-red-600 hover:bg-red-50 py-2 rounded-lg"
            >
              <FaTrash />
            </button>
          </div>
        ))}
      </div>
    </div>

    {/* Social Media */}
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 border-b pb-3">
        Social Media Links
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.keys(settings.social_links).map((platform) => {
          const key = platform as keyof SocialLinks;
          return (
            <div key={platform}>
              <label className="text-sm text-gray-700 capitalize">{platform}</label>
              <input
                type="text"
                value={settings.social_links[key] ?? ""}
                onChange={(e) => handleSocialLinkChange(key, e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          );
        })}
      </div>
    </div>

    {/* Save Button */}
    <div className="flex justify-end">
      <button
        onClick={handleSave}
        disabled={isSaving}
        className="flex items-center gap-2 px-6 py-3 bg-[#1A3F66] text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        <FaSave />
        {isSaving ? "Saving..." : "Save Changes"}
      </button>
    </div>
  </div>
);


}
