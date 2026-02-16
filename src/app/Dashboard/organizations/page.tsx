"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Organization {
  id: string;
  name: string;
  description?: string;
  whatsappNumber?: string;
  planType: string;
  isActive: boolean;
  monthlyMessageCount: number;
  monthlyMessageLimit: number;
  totalConversations: number;
  createdAt: string;
  knowledgeBase?: {
    id: string;
    isModelTrained: boolean;
    lastTrainedAt?: string;
  };
}

export default function OrganizationsPage() {
  const router = useRouter();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newOrgName, setNewOrgName] = useState("");
  const [newOrgDescription, setNewOrgDescription] = useState("");
  const [newOrgIndustry, setNewOrgIndustry] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    try {
      const res = await fetch("/api/organizations");
      const data = await res.json();
      if (data.ok) {
        setOrganizations(data.organizations);
      }
    } catch (error) {
      console.error("Failed to fetch organizations:", error);
    } finally {
      setLoading(false);
    }
  };

  const createOrganization = async () => {
    if (!newOrgName.trim()) {
      alert("Organization name is required");
      return;
    }

    setCreating(true);
    try {
      const res = await fetch("/api/organizations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newOrgName,
          description: newOrgDescription,
          industry: newOrgIndustry,
        }),
      });

      const data = await res.json();
      if (data.ok) {
        setShowCreateModal(false);
        setNewOrgName("");
        setNewOrgDescription("");
        setNewOrgIndustry("");
        fetchOrganizations();
        router.push(`/Dashboard/organizations/${data.organization.id}`);
      } else {
        alert(data.error || "Failed to create organization");
      }
    } catch (error) {
      console.error("Create organization error:", error);
      alert("Failed to create organization");
    } finally {
      setCreating(false);
    }
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return "text-red-500";
    if (percentage >= 70) return "text-yellow-500";
    return "text-green-500";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            WhatsApp Organizations
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage your WhatsApp AI-powered business numbers
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          + Create Organization
        </button>
      </div>

      {organizations.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="text-6xl mb-4">📱</div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No organizations yet
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Create your first organization to get started with WhatsApp AI
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Create Organization
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {organizations.map((org) => {
            const usagePercentage =
              org.monthlyMessageLimit > 0
                ? Math.round(
                    (org.monthlyMessageCount / org.monthlyMessageLimit) * 100
                  )
                : 0;

            return (
              <div
                key={org.id}
                onClick={() => router.push(`/Dashboard/organizations/${org.id}`)}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer p-6 border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                      {org.name}
                    </h3>
                    {org.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {org.description}
                      </p>
                    )}
                  </div>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      org.isActive
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                    }`}
                  >
                    {org.isActive ? "Active" : "Inactive"}
                  </span>
                </div>

                <div className="space-y-3">
                  {org.whatsappNumber ? (
                    <div className="flex items-center text-sm">
                      <span className="text-green-500 mr-2">✓</span>
                      <span className="text-gray-700 dark:text-gray-300">
                        {org.whatsappNumber}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center text-sm text-yellow-600 dark:text-yellow-400">
                      <span className="mr-2">⚠</span>
                      <span>No WhatsApp number provisioned</span>
                    </div>
                  )}

                  {org.knowledgeBase?.isModelTrained ? (
                    <div className="flex items-center text-sm text-green-600 dark:text-green-400">
                      <span className="mr-2">🤖</span>
                      <span>AI Trained</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <span className="mr-2">🤖</span>
                      <span>AI Not Trained</span>
                    </div>
                  )}

                  <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600 dark:text-gray-400">
                        Messages this month
                      </span>
                      <span
                        className={`font-medium ${getUsageColor(
                          usagePercentage
                        )}`}
                      >
                        {org.monthlyMessageCount} / {org.monthlyMessageLimit}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          usagePercentage >= 90
                            ? "bg-red-500"
                            : usagePercentage >= 70
                            ? "bg-yellow-500"
                            : "bg-green-500"
                        }`}
                        style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex justify-between text-sm pt-2">
                    <span className="text-gray-600 dark:text-gray-400">
                      Conversations
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {org.totalConversations}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">
                      {org.planType}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Organization Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              Create Organization
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Organization Name *
                </label>
                <input
                  type="text"
                  value={newOrgName}
                  onChange={(e) => setNewOrgName(e.target.value)}
                  placeholder="e.g., My Business"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={newOrgDescription}
                  onChange={(e) => setNewOrgDescription(e.target.value)}
                  placeholder="Brief description of your organization"
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Industry
                </label>
                <input
                  type="text"
                  value={newOrgIndustry}
                  onChange={(e) => setNewOrgIndustry(e.target.value)}
                  placeholder="e.g., E-commerce, Healthcare, Education"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                disabled={creating}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createOrganization}
                disabled={creating}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creating ? "Creating..." : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
