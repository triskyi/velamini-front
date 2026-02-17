"use client";

import Image from "next/image";
import { CheckCircle2, Mail, MapPin, ArrowUpRight } from "lucide-react";
import { Card, CardContent, Avatar, AvatarImage, AvatarFallback, Button, Chip, Link as HeroLink } from "@heroui/react";
import Link from "next/link"; // Keep next/link for internal navigation if needed


interface ProfileViewProps {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  knowledgeBase?: any;
}


export default function ProfileView({ user, knowledgeBase }: ProfileViewProps) {
  const fullName = knowledgeBase?.fullName || user?.name || "User Name";
  const email = user?.email || "email@example.com";
  const location = knowledgeBase?.currentLocation || "";
  const cover =
    knowledgeBase?.coverImage ||
    "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=2070&auto=format&fit=crop";

  // socials (safe parse)
  const socialLinks = knowledgeBase?.socialLinks
    ? (() => {
      try {
        return JSON.parse(knowledgeBase.socialLinks);
      } catch {
        return {};
      }
    })()
    : {};

  return (
    <div className="w-full text-foreground bg-background min-h-full p-4 sm:p-6 lg:p-8">
      <div className="mx-auto w-full max-w-7xl space-y-8">

        {/* Profile Card */}
        <Card className="w-full">
          <div className="relative h-44 sm:h-60 w-full overflow-hidden">
            <Image
              src={cover}
              alt="Cover"
              fill
              className="object-cover opacity-80"
              unoptimized
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/60" />
          </div>

          <CardContent className="px-5 sm:px-8 pb-8 pt-0 relative overflow-visible">
            <div className="flex flex-col md:flex-row md:items-end gap-6 -mt-12 sm:-mt-16 relative z-10">
              <Avatar className="w-28 h-28 sm:w-36 sm:h-36 border-4 border-background text-3xl font-bold flex items-center justify-center overflow-hidden rounded-full">
                {user?.image ? (
                  <AvatarImage src={user.image} className="w-full h-full object-cover" />
                ) : (
                  <AvatarFallback className="w-full h-full bg-primary flex items-center justify-center text-white">
                    {(fullName?.[0] || "U").toUpperCase()}
                  </AvatarFallback>
                )}
              </Avatar>

              <div className="flex-1 pb-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">{fullName}</h1>
                    <div className="flex items-center gap-2 mt-2">
                      <Chip color="default" variant="soft" size="sm">Virtual Self</Chip>
                      <div className="flex items-center gap-1 text-small text-default-500">
                        <CheckCircle2 className="w-4 h-4 text-primary" />
                        <span>Verified</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Columns */}
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content (Bio/Experience Placeholder) */}
              <div className="lg:col-span-2 space-y-6">
                <Card className="bg-default-50 dark:bg-default-100/50 shadow-none border border-default-100">
                  <CardContent className="p-6">
                    <h3 className="text-large font-semibold mb-4">About Me</h3>
                    <p className="text-default-500">
                      {knowledgeBase?.bio || "No detailed bio currently available. Complete your training to populate this section."}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar: Contact & Socials */}
              <div className="space-y-4">
                <Card className="bg-default-50 dark:bg-default-100/50 shadow-none border border-default-100">
                  <CardContent className="p-4 gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-default-200 text-default-600">
                        <Mail className="w-5 h-5" />
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <p className="text-tiny uppercase font-bold text-default-500">Email</p>
                        <p className="text-small font-medium truncate" title={email}>{email}</p>
                      </div>
                    </div>

                    {location && (
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-default-200 text-default-600">
                          <MapPin className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-tiny uppercase font-bold text-default-500">Location</p>
                          <p className="text-small font-medium">{location}</p>
                        </div>
                      </div>
                    )}

                    {socialLinks?.website && (
                      <HeroLink
                        href={socialLinks.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full no-underline"
                      >
                        <Button
                          variant="secondary"
                          className="w-full flex justify-between items-center"
                        >
                          Website
                          <ArrowUpRight className="w-4 h-4" />
                        </Button>
                      </HeroLink>
                    )}

                  

                  </CardContent>
                </Card>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
