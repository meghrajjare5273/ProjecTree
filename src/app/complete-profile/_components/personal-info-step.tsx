// "use client";

// import type React from "react";

// import { useState } from "react";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { toast } from "sonner";
// import { Loader2 } from "lucide-react";
// // import { authClient } from "@/lib/auth-client";

// interface PersonalInfoStepProps {
//   userData: {
//     firstName: string;
//     lastName: string;
//     username: string;
//     email: string;
//     // eslint-disable-next-line @typescript-eslint/no-explicit-any
//     [key: string]: any;
//   };
//   updateUserData: (data: Partial<PersonalInfoStepProps["userData"]>) => void;
// }

// export default function PersonalInfoStep({
//   userData,
//   updateUserData,
// }: PersonalInfoStepProps) {
//   const [isCheckingUsername, setIsCheckingUsername] = useState(false);
//   const [usernameError, setUsernameError] = useState("");

//   // Handle username check
//   const checkUsernameAvailability = async (username: string) => {
//     if (!username || username.trim() === "") {
//       setUsernameError("Username is required");
//       return false;
//     }

//     if (username.length < 3) {
//       setUsernameError("Username must be at least 3 characters");
//       return false;
//     }

//     if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
//       setUsernameError(
//         "Username can only contain letters, numbers, underscores and dashes"
//       );
//       return false;
//     }

//     try {
//       setIsCheckingUsername(true);

//       // Call your API to check username availability
//     //   const isAvailable = await authClient.checkUsernameAvailability(username);

//     //   if (!isAvailable) {
//     //     setUsernameError("This username is already taken");
//     //     return false;
//     //   }

//       setUsernameError("");
//       return true;
//     } catch (error) {
//       console.error("Error checking username:", error);
//       toast.error("Failed to check username availability");
//       return false;
//     } finally {
//       setIsCheckingUsername(false);
//     }
//   };

//   // Handle input change
//   const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;

//     if (name === "username") {
//       updateUserData({ [name]: value });

//       // Debounce username check
//       if (value && value.trim() !== "") {
//         const timer = setTimeout(() => {
//           checkUsernameAvailability(value);
//         }, 500);

//         return () => clearTimeout(timer);
//       } else {
//         setUsernameError("");
//       }
//     } else {
//       updateUserData({ [name]: value });
//     }
//   };

//   return (
//     <div>
//       <h2 className="text-2xl font-bold text-white mb-6">
//         Personal Information
//       </h2>
//       <p className="text-gray-300 mb-6">
//         Let&apos;s start with the basics. This information will be displayed on your
//         public profile.
//       </p>

//       <div className="space-y-6">
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           <div className="space-y-2">
//             <Label htmlFor="firstName" className="text-white">
//               First Name
//             </Label>
//             <Input
//               id="firstName"
//               name="firstName"
//               value={userData.firstName}
//               onChange={handleInputChange}
//               placeholder="Enter your first name"
//               className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 h-11 transition-all duration-200 focus:ring-2 focus:ring-yellow-400/50"
//               required
//             />
//           </div>

//           <div className="space-y-2">
//             <Label htmlFor="lastName" className="text-white">
//               Last Name
//             </Label>
//             <Input
//               id="lastName"
//               name="lastName"
//               value={userData.lastName}
//               onChange={handleInputChange}
//               placeholder="Enter your last name"
//               className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 h-11 transition-all duration-200 focus:ring-2 focus:ring-yellow-400/50"
//               required
//             />
//           </div>
//         </div>

//         <div className="space-y-2">
//           <Label htmlFor="username" className="text-white">
//             Username
//           </Label>
//           <div className="relative">
//             <Input
//               id="username"
//               name="username"
//               value={userData.username}
//               onChange={handleInputChange}
//               placeholder="Choose a unique username"
//               className={`bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 h-11 transition-all duration-200 focus:ring-2 focus:ring-yellow-400/50 ${
//                 usernameError ? "border-red-500 focus:ring-red-500" : ""
//               }`}
//               required
//             />
//             {isCheckingUsername && (
//               <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
//                 <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
//               </div>
//             )}
//           </div>
//           {usernameError && (
//             <p className="text-red-500 text-sm mt-1">{usernameError}</p>
//           )}
//           {!usernameError && userData.username && !isCheckingUsername && (
//             <p className="text-green-500 text-sm mt-1">Username is available</p>
//           )}
//         </div>

//         <div className="space-y-2">
//           <Label htmlFor="email" className="text-white">
//             Email
//           </Label>
//           <Input
//             id="email"
//             name="email"
//             value={userData.email}
//             onChange={handleInputChange}
//             placeholder="Enter your email"
//             type="email"
//             className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 h-11 transition-all duration-200 focus:ring-2 focus:ring-yellow-400/50"
//             disabled
//           />
//           <p className="text-gray-500 text-xs">Email cannot be changed</p>
//         </div>

//         <div className="space-y-2">
//           <Label htmlFor="location" className="text-white">
//             Location
//           </Label>
//           <Input
//             id="location"
//             name="location"
//             value={userData.location || ""}
//             onChange={handleInputChange}
//             placeholder="City, Country"
//             className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 h-11 transition-all duration-200 focus:ring-2 focus:ring-yellow-400/50"
//           />
//         </div>
//       </div>
//     </div>
//   );
// }
