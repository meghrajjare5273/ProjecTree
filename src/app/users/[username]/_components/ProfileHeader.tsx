// "use client";

// import Image from "next/image";
// import Link from "next/link";
// import {
//   MapPin,
//   Github,
//   Linkedin,
//   Twitter,
//   Globe,
//   Calendar,
//   Users,
//   FolderOpen,
// } from "lucide-react";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent } from "@/components/ui/card";
// import { Separator } from "@/components/ui/separator";
// import FollowButton from "@/components/follow-button";
// import type { JsonArray, JsonObject } from "@prisma/client/runtime/library";

// interface StreamlinedProfileHeaderProps {
//   user: {
//     id: string;
//     name: string | null;
//     username: string;
//     image: string | null;
//     bio: string | null;
//     socialLinks: string | number | boolean | JsonObject | JsonArray;
//     location?: string | null;
//     interests: string[];
//     skills: string[];
//     createdAt: string;
//     _count?: {
//       followers: number;
//       following: number;
//     };
//   };
//   currentUserId: string | null;
//   stats: {
//     projects: number;
//     events: number;
//     total: number;
//   };
// }

// export default function StreamlinedProfileHeader({
//   user,
//   currentUserId,
//   stats,
// }: StreamlinedProfileHeaderProps) {
//   const getSocialIcon = (platform: string) => {
//     switch (platform.toLowerCase()) {
//       case "github":
//         return <Github className="w-4 h-4" />;
//       case "linkedin":
//         return <Linkedin className="w-4 h-4" />;
//       case "twitter":
//         return <Twitter className="w-4 h-4" />;
//       default:
//         return <Globe className="w-4 h-4" />;
//     }
//   };

//   const displayName = user.name || user.username || "";
//   const userBio = user.bio || "";
//   const userImage = user.image || "/placeholder.svg?height=80&width=80";
//   const userSocialLinks = user.socialLinks || {};
//   const userCreatedAt = user.createdAt || new Date().toISOString();
//   const followersCount = user._count?.followers || 0;
//   const followingCount = user._count?.following || 0;

//   return (
//     <Card className="bg-[#1a1a1a]/90 border-[#333333]">
//       <CardContent className="p-6">
//         {/* Main Profile Section */}
//         <div className="flex items-start gap-4 mb-6">
//           <div className="relative w-20 h-20 rounded-full border-2 border-[#333333] overflow-hidden flex-shrink-0">
//             <Image
//               src={userImage || "/placeholder.svg"}
//               alt={displayName}
//               fill
//               className="object-cover"
//             />
//           </div>

//           <div className="flex-1 min-w-0">
//             <div className="flex items-start justify-between">
//               <div>
//                 <h1 className="text-xl font-bold text-white truncate">
//                   {displayName}
//                 </h1>
//                 <p className="text-[#ffcc00] text-sm">@{user.username}</p>
//               </div>

//               {currentUserId && user.id && currentUserId !== user.id && (
//                 <FollowButton userId={user.id} username={user.username} />
//               )}
//             </div>

//             {userBio && (
//               <p className="mt-2 text-gray-300 text-sm leading-relaxed">
//                 {userBio}
//               </p>
//             )}
//           </div>
//         </div>

//         {/* Stats Row */}
//         <div className="flex items-center gap-6 mb-4 text-sm">
//           <div className="flex items-center gap-1">
//             <span className="font-semibold text-white">{stats.total}</span>
//             <span className="text-gray-400">Posts</span>
//           </div>
//           <div className="flex items-center gap-1">
//             <FolderOpen className="w-4 h-4 text-[#ffcc00]" />
//             <span className="font-semibold text-white">{stats.projects}</span>
//             <span className="text-gray-400">Projects</span>
//           </div>
//           <div className="flex items-center gap-1">
//             <Calendar className="w-4 h-4 text-[#ffcc00]" />
//             <span className="font-semibold text-white">{stats.events}</span>
//             <span className="text-gray-400">Events</span>
//           </div>
//           <Link
//             href={`/users/${user.username}/followers`}
//             className="flex items-center gap-1 hover:text-[#ffcc00] transition-colors"
//           >
//             <Users className="w-4 h-4" />
//             <span className="font-semibold text-white">{followersCount}</span>
//             <span className="text-gray-400">Followers</span>
//           </Link>
//           <Link
//             href={`/users/${user.username}/following`}
//             className="flex items-center gap-1 hover:text-[#ffcc00] transition-colors"
//           >
//             <span className="font-semibold text-white">{followingCount}</span>
//             <span className="text-gray-400">Following</span>
//           </Link>
//         </div>

//         <Separator className="bg-[#333333] mb-4" />

//         {/* Details Row */}
//         <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mb-4">
//           {Object.entries(userSocialLinks).map(([platform, url]) => (
//             <a
//               key={platform}
//               href={url as string}
//               target="_blank"
//               rel="noopener noreferrer"
//               className="flex items-center gap-1 hover:text-[#ffcc00] transition-colors"
//             >
//               {getSocialIcon(platform)}
//               <span className="capitalize">{platform}</span>
//             </a>
//           ))}
//           {user.location && (
//             <div className="flex items-center gap-1">
//               <MapPin className="w-4 h-4" />
//               <span>{user.location}</span>
//             </div>
//           )}
//           <div className="flex items-center gap-1">
//             <Calendar className="w-4 h-4" />
//             <span>
//               Joined{" "}
//               {new Date(userCreatedAt).toLocaleDateString(undefined, {
//                 year: "numeric",
//                 month: "long",
//               })}
//             </span>
//           </div>
//         </div>

//         {/* Skills & Interests */}
//         {(user.skills.length > 0 || user.interests.length > 0) && (
//           <div className="space-y-3">
//             {user.skills.length > 0 && (
//               <div>
//                 <h3 className="text-white text-sm font-medium mb-2">Skills</h3>
//                 <div className="flex flex-wrap gap-2">
//                   {user.skills.slice(0, 8).map((skill, index) => (
//                     <Badge
//                       key={index}
//                       variant="secondary"
//                       className="bg-[#252525] text-gray-300 hover:bg-[#333333] text-xs"
//                     >
//                       {skill}
//                     </Badge>
//                   ))}
//                   {user.skills.length > 8 && (
//                     <Badge
//                       variant="outline"
//                       className="text-xs text-gray-400 border-[#333333]"
//                     >
//                       +{user.skills.length - 8} more
//                     </Badge>
//                   )}
//                 </div>
//               </div>
//             )}

//             {user.interests.length > 0 && (
//               <div>
//                 <h3 className="text-white text-sm font-medium mb-2">
//                   Interests
//                 </h3>
//                 <div className="flex flex-wrap gap-2">
//                   {user.interests.slice(0, 6).map((interest, index) => (
//                     <Badge
//                       key={index}
//                       variant="outline"
//                       className="bg-[#252525]/50 text-[#ffcc00] border-[#ffcc00]/30 hover:bg-[#333333] text-xs"
//                     >
//                       {interest}
//                     </Badge>
//                   ))}
//                   {user.interests.length > 6 && (
//                     <Badge
//                       variant="outline"
//                       className="text-xs text-gray-400 border-[#333333]"
//                     >
//                       +{user.interests.length - 6} more
//                     </Badge>
//                   )}
//                 </div>
//               </div>
//             )}
//           </div>
//         )}

//         {/* Action Buttons */}
//         {currentUserId && user.id && currentUserId !== user.id && (
//           <div className="flex gap-2 mt-4 pt-4 border-t border-[#333333]">
//             <Button
//               variant="outline"
//               size="sm"
//               className="border-[#333333] text-white hover:bg-[#252525] bg-transparent"
//             >
//               Message
//             </Button>
//             <Button
//               variant="outline"
//               size="sm"
//               className="border-[#333333] text-white hover:bg-[#252525] bg-transparent"
//             >
//               Share Profile
//             </Button>
//           </div>
//         )}
//       </CardContent>
//     </Card>
//   );
// }
