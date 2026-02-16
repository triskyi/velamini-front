"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

interface Organization {
  id: string;
  name: string;
  description?: string;
  whatsappNumber?: string;
  displayName?: string;
  planType: string;
  isActive: boolean;
  monthlyMessageCount: number;
  monthlyMessageLimit: number;
  totalConversations: number;
  totalMessages: number;
  businessHoursEnabled: boolean;
  businessHoursStart?: string;
  businessHoursEnd?: string;
  timezone?: string;
  autoReplyEnabled: boolean;
  welcomeMessage?: string;
  industry?: string;
  website?: string;
  contactEmail?: string;
  knowledgeBase?: {
    id: string;
    isModelTrained: boolean;
    lastTrainedAt?: string;
  };
}

interface Stats {
  totalConversations: number;
  totalMessages: number;
  monthlyMessageCount: number;
  monthlyMessageLimit: number;
  usagePercentage: number;
  recentConversations: any[];
}

type Tab = "overview" | "settings" | "ai" | "analytics";

export default function OrganizationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orgId = params.id as string;

  const [organization, setOrganization] = useState<Organization | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [saving, setSaving] = useState(false);

  // Number provisioning
  const [showNumberSearch, setShowNumberSearch] = useState(false);
  const [searchCountry, setSearchCountry] = useState("US");
  const [availableNumbers, setAvailableNumbers] = useState<any[]>([]);
  const [searchingNumbers, setSearchingNumbers] = useState(false);
  const [provisioning, setProvisioning] = useState(false);

  useEffect(() => {
    fetchOrganization();
    fetchStats();
  }, [orgId]);

  const fetchOrganization = async () => {
    try {
      const res = await fetch(`/api/organizations/${orgId}`);
      const data = await res.json();
      if (data.ok) {
        setOrganization(data.organization);
      }
    } catch (error) {
      console.error("Failed to fetch organization:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch(`/api/organizations/${orgId}/stats`);
      const data = await res.json();
      if (data.ok) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  const searchNumbers = async () => {
    setSearchingNumbers(true);
    try {
      const res = await fetch(
        `/api/organizations/search-numbers?country=${searchCountry}`
      );
      const data = await res.json();
      if (data.ok) {
        setAvailableNumbers(data.numbers);
      } else {
        alert(data.error || "Failed to search numbers");
      }
    } catch (error) {
      console.error("Search numbers error:", error);
      alert("Failed to search numbers");
    } finally {
      setSearchingNumbers(false);
    }
  };

  const provisionNumber = async (phoneNumber: string) => {
    if (!confirm(`Provision number ${phoneNumber}? This will incur charges.`)) {
      return;
    }

    setProvisioning(true);
    try {
      const res = await fetch(`/api/organizations/${orgId}/provision-number`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber }),
      });

      const data = await res.json();
      if (data.ok) {
        alert("Number provisioned successfully!");
        setShowNumberSearch(false);
        fetchOrganization();
      } else {
        alert(data.error || "Failed to provision number");
      }
    } catch (error) {
      console.error("Provision number error:", error);
      alert("Failed to provision number");
    } finally {
      setProvisioning(false);
    }
  };

  const releaseNumber = async () => {
    if (
      !confirm(
        "Are you sure you want to release this number? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`/api/organizations/${orgId}/provision-number`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (data.ok) {
        alert("Number released successfully");
        fetchOrganization();
      } else {
        alert(data.error || "Failed to release number");
      }
    } catch (error) {
      console.error("Release number error:", error);
      alert("Failed to release number");
    }
  };

  const updateOrganization = async (updates: Partial<Organization>) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/organizations/${orgId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      const data = await res.json();
      if (data.ok) {
        setOrganization(data.organization);
        alert("Settings saved successfully");
      } else {
        alert(data.error || "Failed to save settings");
      }
    } catch (error) {
      console.error("Update organization error:", error);
      alert("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const trainAI = () => {
    router.push(`/Dashboard/training?orgId=${orgId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Organization not found
          </h1>
          <button
            onClick={() => router.push("/Dashboard/organizations")}
            className="text-blue-600 hover:underline"
          >
            Back to organizations
          </button>
        </div>
      </div>
    );
  }

  const usagePercentage = stats?.usagePercentage || 0;

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.push("/Dashboard/organizations")}
          className="text-blue-600 hover:underline mb-4 flex items-center gap-2"
        >
          ← Back to Organizations
        </button>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {organization.name}
            </h1>
            {organization.description && (
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                {organization.description}
              </p>
            )}
          </div>
          <span
            className={`px-3 py-1 rounded text-sm font-medium ${
              organization.isActive
                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
            }`}
          >
            {organization.isActive ? "Active" : "Inactive"}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <nav className="flex gap-8">
          {[
            { id: "overview", label: "Overview" },
            { id: "settings", label: "Settings" },
            { id: "ai", label: "AI Training" },
            { id: "analytics", label: "Analytics" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === "overview" && (
          <>
            {/* WhatsApp Number Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                WhatsApp Number
              </h2>

              {organization.whatsappNumber ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div>
                      <div className="font-mono text-lg font-medium text-gray-900 dark:text-white">
                        {organization.whatsappNumber}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Customers can text this number to access your AI
                      </div>
                    </div>
                    <button
                      onClick={releaseNumber}
                      className="px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      Release Number
                    </button>
                  </div>

                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                      📱 How to use:
                    </h3>
                    <ol className="text-sm text-gray-700 dark:text-gray-300 space-y-1 list-decimal list-inside">
                      <li>Save this number in WhatsApp</li>
                      <li>Train your AI assistant (see AI Training tab)</li>
                      <li>Share this number with your customers</li>
                      <li>They can text it anytime to get AI-powered responses</li>
                    </ol>
                  </div>
                </div>
              ) : (
                <div>
                  {!showNumberSearch ? (
                    <div className="text-center p-6">
                      <div className="text-4xl mb-3">📱</div>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        No WhatsApp number provisioned yet
                      </p>
                      <button
                        onClick={() => {
                          setShowNumberSearch(true);
                          searchNumbers();
                        }}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Provision a Number
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex gap-3">
                        <select
                          value={searchCountry}
                          onChange={(e) => setSearchCountry(e.target.value)}
                          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                        >
                          <option value="US">United States</option>
                          <option value="CA">Canada</option>
                          <option value="GB">United Kingdom</option>
                          <option value="RW">Rwanda</option>
                          <option value="KE">Kenya</option>
                          <option value="UG">Uganda</option>
                        </select>
                        <button
                          onClick={searchNumbers}
                          disabled={searchingNumbers}
                          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                          {searchingNumbers ? "Searching..." : "Search Numbers"}
                        </button>
                        <button
                          onClick={() => setShowNumberSearch(false)}
                          className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                        >
                          Cancel
                        </button>
                      </div>

                      {availableNumbers.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Available numbers:
                          </p>
                          {availableNumbers.map((num) => (
                            <div
                              key={num.phoneNumber}
                              className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
                            >
                              <span className="font-mono text-gray-900 dark:text-white">
                                {num.phoneNumber}
                              </span>
                              <button
                                onClick={() => provisionNumber(num.phoneNumber)}
                                disabled={provisioning}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                              >
                                {provisioning ? "Provisioning..." : "Select"}
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Usage Stats */}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Monthly Messages
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.monthlyMessageCount} / {stats.monthlyMessageLimit}
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-3">
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

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Total Conversations
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.totalConversations}
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Total Messages
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.totalMessages}
                  </div>
                </div>
              </div>
            )}

            {/* AI Status */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                AI Assistant Status
              </h2>
              {organization.knowledgeBase?.isModelTrained ? (
                <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div>
                    <div className="flex items-center gap-2 text-green-700 dark:text-green-300 font-medium">
                      <span>✓</span>
                      <span>AI is trained and ready</span>
                    </div>
                    {organization.knowledgeBase.lastTrainedAt && (
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Last trained:{" "}
                        {new Date(
                          organization.knowledgeBase.lastTrainedAt
                        ).toLocaleString()}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={trainAI}
                    className="px-4 py-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                  >
                    Retrain AI
                  </button>
                </div>
              ) : (
                <div className="text-center p-6">
                  <div className="text-4xl mb-3">🤖</div>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    AI assistant not trained yet
                  </p>
                  <button
                    onClick={trainAI}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Train Your AI
                  </button>
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === "settings" && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                General Settings
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Organization Name
                  </label>
                  <input
                    type="text"
                    value={organization.name}
                    onChange={(e) =>
                      setOrganization({ ...organization, name: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    value={organization.description || ""}
                    onChange={(e) =>
                      setOrganization({
                        ...organization,
                        description: e.target.value,
                      })
                    }
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Welcome Message
                  </label>
                  <textarea
                    value={organization.welcomeMessage || ""}
                    onChange={(e) =>
                      setOrganization({
                        ...organization,
                        welcomeMessage: e.target.value,
                      })
                    }
                    placeholder="Sent to new customers on first message"
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={organization.autoReplyEnabled}
                    onChange={(e) =>
                      setOrganization({
                        ...organization,
                        autoReplyEnabled: e.target.checked,
                      })
                    }
                    className="w-4 h-4"
                  />
                  <label className="text-sm text-gray-700 dark:text-gray-300">
                    Enable auto-reply
                  </label>
                </div>

                <button
                  onClick={() => updateOrganization(organization)}
                  disabled={saving}
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Settings"}
                </button>
              </div>
            </div>

            {/* Business Hours */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Business Hours
              </h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={organization.businessHoursEnabled}
                    onChange={(e) =>
                      setOrganization({
                        ...organization,
                        businessHoursEnabled: e.target.checked,
                      })
                    }
                    className="w-4 h-4"
                  />
                  <label className="text-sm text-gray-700 dark:text-gray-300">
                    Enable business hours (only respond during set hours)
                  </label>
                </div>

                {organization.businessHoursEnabled && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Start Time
                      </label>
                      <input
                        type="time"
                        value={organization.businessHoursStart || "09:00"}
                        onChange={(e) =>
                          setOrganization({
                            ...organization,
                            businessHoursStart: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        End Time
                      </label>
                      <input
                        type="time"
                        value={organization.businessHoursEnd || "17:00"}
                        onChange={(e) =>
                          setOrganization({
                            ...organization,
                            businessHoursEnd: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  </div>
                )}

                <button
                  onClick={() => updateOrganization(organization)}
                  disabled={saving}
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Business Hours"}
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "ai" && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              AI Training
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Train your AI assistant with your organization's information,
              personality, and knowledge base.
            </p>
            <button
              onClick={trainAI}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go to AI Training
            </button>
          </div>
        )}

        {activeTab === "analytics" && stats && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Recent Conversations
              </h2>
              {stats.recentConversations.length > 0 ? (
                <div className="space-y-3">
                  {stats.recentConversations.map((conv) => (
                    <div
                      key={conv.id}
                      className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {conv.userId}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(conv.lastMessageAt).toLocaleString()}
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {conv.lastMessage}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No conversations yet
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
