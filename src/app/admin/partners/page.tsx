"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";

interface Partner {
  _id: Id<"partners">;
  name: string;
  slug: string;
  logoUrl?: string;
  primaryColor: string;
  licenseExpiry: number;
}

export default function PartnersAdminPage() {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#00d2ff");
  const [licenseExpiry, setLicenseExpiry] = useState("");
  const [editingId, setEditingId] = useState<Id<"partners"> | null>(null);

  const partners = useQuery(api.partners.getAllPartners) as Partner[] | undefined;
  const createPartner = useMutation(api.partners.createPartner);
  const updatePartner = useMutation(api.partners.updatePartner);
  const deletePartner = useMutation(api.partners.deletePartner);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const expiryDate = new Date(licenseExpiry).getTime();
    
    if (editingId) {
      await updatePartner({
        id: editingId,
        name,
        logoUrl: logoUrl || undefined,
        primaryColor,
        licenseExpiry: expiryDate,
      });
      setEditingId(null);
    } else {
      await createPartner({
        name,
        slug,
        logoUrl: logoUrl || undefined,
        primaryColor,
        licenseExpiry: expiryDate,
      });
    }
    
    resetForm();
  };

  const handleEdit = (partner: Partner) => {
    setEditingId(partner._id);
    setName(partner.name);
    setSlug(partner.slug);
    setLogoUrl(partner.logoUrl || "");
    setPrimaryColor(partner.primaryColor);
    setLicenseExpiry(new Date(partner.licenseExpiry).toISOString().split('T')[0]);
  };

  const handleDelete = async (id: Id<"partners">) => {
    if (confirm("Are you sure you want to delete this partner?")) {
      await deletePartner({ id });
    }
  };

  const resetForm = () => {
    setName("");
    setSlug("");
    setLogoUrl("");
    setPrimaryColor("#00d2ff");
    setLicenseExpiry("");
    setEditingId(null);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  const isExpired = (timestamp: number) => {
    return timestamp < Date.now();
  };

  return (
    <div className="min-h-screen bg-[#0b0e14] text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Partner Management</h1>

        {/* Form */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">{editingId ? "Edit Partner" : "Add New Partner"}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Partner Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={!!editingId}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-[#00d2ff] disabled:opacity-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Slug (subdomain)</label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  required
                  disabled={!!editingId}
                  placeholder="e.g., company-name"
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-[#00d2ff] disabled:opacity-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Logo URL (optional)</label>
                <input
                  type="url"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="https://example.com/logo.png"
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-[#00d2ff]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Primary Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-12 h-10 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-[#00d2ff]"
                  />
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">License Expiry Date</label>
                <input
                  type="date"
                  value={licenseExpiry}
                  onChange={(e) => setLicenseExpiry(e.target.value)}
                  required
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-[#00d2ff]"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-6 py-2 bg-[#00d2ff] text-black font-bold rounded-lg hover:bg-[#00d2ff]/80 transition-colors"
              >
                {editingId ? "Update Partner" : "Add Partner"}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-2 bg-white/10 text-white font-bold rounded-lg hover:bg-white/20 transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Partners List */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h2 className="text-xl font-bold mb-4">Existing Partners</h2>
          {partners && partners.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4">Name</th>
                    <th className="text-left py-3 px-4">Slug</th>
                    <th className="text-left py-3 px-4">Color</th>
                    <th className="text-left py-3 px-4">License Expiry</th>
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="text-left py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {partners.map((partner) => (
                    <tr key={partner._id} className="border-b border-white/10 hover:bg-white/5">
                      <td className="py-3 px-4">{partner.name}</td>
                      <td className="py-3 px-4 font-mono">{partner.slug}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-6 h-6 rounded"
                            style={{ backgroundColor: partner.primaryColor }}
                          />
                          <span className="font-mono">{partner.primaryColor}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">{formatDate(partner.licenseExpiry)}</td>
                      <td className="py-3 px-4">
                        {isExpired(partner.licenseExpiry) ? (
                          <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm">
                            Expired
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">
                            Active
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(partner)}
                            className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(partner._id)}
                            className="px-3 py-1 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-[#a1a1aa]">No partners found. Add your first partner above.</p>
          )}
        </div>
      </div>
    </div>
  );
}
