"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

// Force dynamic rendering to prevent build-time pre-rendering
export const dynamic = 'force-dynamic';

export default function OnboardingPage() {
  const router = useRouter();
  const sessionResult = useSession();
  const [selectedType, setSelectedType] = useState<"personal" | "organization" | null>(null);
  const [loading, setLoading] = useState(false);
  const [organizationName, setOrganizationName] = useState("");
  const [industry, setIndustry] = useState("");

  // Handle case where useSession returns undefined during build
  if (!sessionResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  const { data: session, update, status } = sessionResult;

  useEffect(() => {
    // Check if user already completed onboarding
    if (session?.user && (session.user as any).onboardingComplete) {
      redirectToDashboard((session.user as any).accountType);
    }
  }, [session]);

  // Show loading while session is being fetched
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to signin if not authenticated
  if (status === "unauthenticated") {
    router.push("/auth/signin");
    return null;
  }

  const redirectToDashboard = (accountType: string) => {
    if (accountType === "organization") {
      router.push("/Dashboard/organizations");
    } else {
      router.push("/Dashboard");
    }
  };

  const handleContinue = async () => {
    if (!selectedType) {
      alert("Please select an account type");
      return;
    }

    if (selectedType === "organization" && !organizationName.trim()) {
      alert("Please enter your organization name");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/user/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountType: selectedType,
          organizationName: selectedType === "organization" ? organizationName : undefined,
          industry: selectedType === "organization" ? industry : undefined,
        }),
      });

      const data = await response.json();

      if (data.ok) {
        // Update session
        await update();
        
        // Redirect based on account type
        redirectToDashboard(selectedType);
      } else {
        alert(data.error || "Failed to complete onboarding");
      }
    } catch (error) {
      console.error("Onboarding error:", error);
      alert("Failed to complete onboarding");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white text-center">
          <h1 className="text-3xl font-bold mb-2">Welcome to Velamini! 🎉</h1>
          <p className="text-blue-100">Let's set up your account in just a few steps</p>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              How will you use Velamini?
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Choose the option that best describes your needs
            </p>
          </div>

          {/* Account Type Selection */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Personal Account */}
            <div
              onClick={() => setSelectedType("personal")}
              className={`cursor-pointer border-2 rounded-xl p-6 transition-all hover:shadow-lg ${
                selectedType === "personal"
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg"
                  : "border-gray-200 dark:border-gray-700 hover:border-blue-300"
              }`}
            >
              <div className="text-center mb-4">
                <div className="text-6xl mb-3">👤</div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Personal Account
                </h3>
              </div>
              <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Create your virtual self/digital twin</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Train AI with your personality & knowledge</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Share your virtual self with others</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Chat with other people's virtual selves</span>
                </li>
              </ul>
              {selectedType === "personal" && (
                <div className="mt-4 pt-4 border-t border-blue-200 dark:border-blue-700">
                  <span className="text-blue-600 dark:text-blue-400 font-medium flex items-center justify-center gap-2">
                    <span>✓</span> Selected
                  </span>
                </div>
              )}
            </div>

            {/* Organization Account */}
            <div
              onClick={() => setSelectedType("organization")}
              className={`cursor-pointer border-2 rounded-xl p-6 transition-all hover:shadow-lg ${
                selectedType === "organization"
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg"
                  : "border-gray-200 dark:border-gray-700 hover:border-blue-300"
              }`}
            >
              <div className="text-center mb-4">
                <div className="text-6xl mb-3">🏢</div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Organization Account
                </h3>
              </div>
              <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Get dedicated WhatsApp business numbers</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>AI-powered customer support 24/7</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Train AI with your business knowledge</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Analytics & conversation insights</span>
                </li>
              </ul>
              {selectedType === "organization" && (
                <div className="mt-4 pt-4 border-t border-blue-200 dark:border-blue-700">
                  <span className="text-blue-600 dark:text-blue-400 font-medium flex items-center justify-center gap-2">
                    <span>✓</span> Selected
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Organization Details (shown when organization is selected) */}
          {selectedType === "organization" && (
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 mb-8 space-y-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                Tell us about your organization
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Organization Name *
                </label>
                <input
                  type="text"
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                  placeholder="e.g., Acme Corp, My Business"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Industry (Optional)
                </label>
                <select
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Select industry...</option>
                  <option value="E-commerce">E-commerce</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Education">Education</option>
                  <option value="Finance">Finance</option>
                  <option value="Technology">Technology</option>
                  <option value="Hospitality">Hospitality</option>
                  <option value="Real Estate">Real Estate</option>
                  <option value="Retail">Retail</option>
                  <option value="Food & Beverage">Food & Beverage</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-4">
            <button
              onClick={() => router.push("/Dashboard")}
              className="px-6 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Skip for now
            </button>
            <button
              onClick={handleContinue}
              disabled={!selectedType || loading}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {loading ? "Setting up..." : "Continue"}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 dark:bg-gray-900/50 p-4 text-center text-sm text-gray-600 dark:text-gray-400">
          You can always change these settings later in your account settings
        </div>
      </div>
    </div>
  );
}
