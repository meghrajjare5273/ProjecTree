// "use client";

// import type React from "react";

// import { useState, useRef } from "react";
// import { Button } from "@/components/ui/button";
// import { toast } from "sonner";
// import { Upload, X, Camera, Loader2 } from "lucide-react";
// import Image from "next/image";

// interface ProfilePhotoStepProps {
//   userData: {
//     profilePhoto: string;
//     // eslint-disable-next-line @typescript-eslint/no-explicit-any
//     [key: string]: any;
//   };
//   updateUserData: (data: Partial<ProfilePhotoStepProps["userData"]>) => void;
// }

// export default function ProfilePhotoStep({
//   userData,
//   updateUserData,
// }: ProfilePhotoStepProps) {
//   const [isUploading, setIsUploading] = useState(false);
//   const [previewUrl, setPreviewUrl] = useState<string>(
//     userData.profilePhoto || ""
//   );
//   const fileInputRef = useRef<HTMLInputElement>(null);

//   // Handle file selection
//   const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (!file) return;

//     // Check file type
//     if (!file.type.startsWith("image/")) {
//       toast.error("Please select an image file");
//       return;
//     }

//     // Check file size (max 5MB)
//     if (file.size > 5 * 1024 * 1024) {
//       toast.error("Image size should be less than 5MB");
//       return;
//     }

//     try {
//       setIsUploading(true);

//       // Create a preview URL
//       const objectUrl = URL.createObjectURL(file);
//       setPreviewUrl(objectUrl);

//       // Upload the file to your server or cloud storage
//       // This is a placeholder - replace with your actual upload logic
//       const formData = new FormData();
//       formData.append("file", file);

//       // Simulate API call
//       await new Promise((resolve) => setTimeout(resolve, 1500));

//       // Update user data with the new profile photo URL
//       // In a real implementation, this would be the URL returned from your upload API
//       updateUserData({ profilePhoto: objectUrl });

//       toast.success("Profile photo uploaded successfully");
//     } catch (error) {
//       console.error("Error uploading profile photo:", error);
//       toast.error("Failed to upload profile photo");
//       setPreviewUrl(userData.profilePhoto || "");
//     } finally {
//       setIsUploading(false);
//     }
//   };

//   // Handle remove photo
//   const handleRemovePhoto = () => {
//     setPreviewUrl("");
//     updateUserData({ profilePhoto: "" });
//     if (fileInputRef.current) {
//       fileInputRef.current.value = "";
//     }
//   };

//   // Trigger file input click
//   const triggerFileInput = () => {
//     if (fileInputRef.current) {
//       fileInputRef.current.click();
//     }
//   };

//   return (
//     <div>
//       <h2 className="text-2xl font-bold text-white mb-6">Profile Photo</h2>
//       <p className="text-gray-300 mb-6">
//         Add a profile photo to help others recognize you. A clear, friendly
//         headshot works best.
//       </p>

//       <div className="flex flex-col items-center justify-center">
//         <div className="mb-6 relative">
//           {previewUrl ? (
//             <div className="relative">
//               <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-yellow-400 shadow-lg">
//                 <Image
//                   src={previewUrl || "/placeholder.svg"}
//                   alt="Profile preview"
//                   width={128}
//                   height={128}
//                   className="w-full h-full object-cover"
//                 />
//               </div>

//               {!isUploading && (
//                 <button
//                   onClick={handleRemovePhoto}
//                   className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
//                   aria-label="Remove photo"
//                 >
//                   <X className="h-4 w-4" />
//                 </button>
//               )}

//               {isUploading && (
//                 <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
//                   <Loader2 className="h-8 w-8 text-yellow-400 animate-spin" />
//                 </div>
//               )}
//             </div>
//           ) : (
//             <div
//               onClick={triggerFileInput}
//               className="w-32 h-32 rounded-full bg-gray-800 border-2 border-dashed border-gray-600 flex items-center justify-center cursor-pointer hover:border-yellow-400 transition-colors"
//             >
//               <Camera className="h-10 w-10 text-gray-400" />
//             </div>
//           )}
//         </div>

//         <input
//           type="file"
//           ref={fileInputRef}
//           onChange={handleFileChange}
//           accept="image/*"
//           className="hidden"
//           disabled={isUploading}
//         />

//         <Button
//           type="button"
//           onClick={triggerFileInput}
//           className="bg-gray-800 hover:bg-gray-700 text-white flex items-center gap-2"
//           disabled={isUploading}
//         >
//           <Upload className="h-4 w-4" />
//           {previewUrl ? "Change Photo" : "Upload Photo"}
//         </Button>

//         <p className="text-gray-400 text-sm mt-4 text-center max-w-md">
//           Recommended: Square image, at least 400x400 pixels. Max size: 5MB.
//           <br />
//           Supported formats: JPG, PNG, GIF
//         </p>
//       </div>
//     </div>
//   );
// }
