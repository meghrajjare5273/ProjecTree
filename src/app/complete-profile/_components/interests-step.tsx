// /* eslint-disable @typescript-eslint/no-explicit-any */
// "use client";

// import { useState } from "react";
// import { Label } from "@/components/ui/label";
// import { Button } from "@/components/ui/button";
// import { X, Plus } from "lucide-react";

// interface InterestsStepProps {
//   userData: {
//     interests: string[];
//     [key: string]:string;
//   };
//   updateUserData: (data: Partial<InterestsStepProps["userData"]>) => void;
// }

// // Predefined interest categories
// const interestCategories = [
//   {
//     name: "Technology",
//     options: [
//       "Web Development",
//       "Mobile Apps",
//       "AI & Machine Learning",
//       "Blockchain",
//       "IoT",
//       "Cloud Computing",
//       "Cybersecurity",
//       "Data Science",
//     ],
//   },
//   {
//     name: "Business",
//     options: [
//       "Startups",
//       "Entrepreneurship",
//       "Marketing",
//       "Finance",
//       "Product Management",
//       "E-commerce",
//       "Remote Work",
//       "Leadership",
//     ],
//   },
//   {
//     name: "Creative",
//     options: [
//       "Design",
//       "UI/UX",
//       "Photography",
//       "Video Production",
//       "Writing",
//       "Music",
//       "Animation",
//       "3D Modeling",
//     ],
//   },
//   {
//     name: "Personal",
//     options: [
//       "Travel",
//       "Fitness",
//       "Gaming",
//       "Reading",
//       "Cooking",
//       "Sustainability",
//       "Mental Health",
//       "Productivity",
//     ],
//   },
// ];

// export default function InterestsStep({
//   userData,
//   updateUserData,
// }: InterestsStepProps) {
//   const [customInterest, setCustomInterest] = useState("");

//   // Add interest
//   const addInterest = (interest: string) => {
//     if (!interest || interest.trim() === "") return;

//     // Check if interest already exists
//     if (userData.interests.includes(interest)) return;

//     // Add interest
//     updateUserData({ interests: [...userData.interests, interest] });
//   };

//   // Remove interest
//   const removeInterest = (interest: string) => {
//     updateUserData({
//       interests: userData.interests.filter((i) => i !== interest),
//     });
//   };

//   // Handle custom interest
//   const handleAddCustomInterest = () => {
//     if (!customInterest || customInterest.trim() === "") return;

//     addInterest(customInterest);
//     setCustomInterest("");
//   };

//   return (
//     <div>
//       <h2 className="text-2xl font-bold text-white mb-6">Your Interests</h2>
//       <p className="text-gray-300 mb-6">
//         Select interests that matter to you. This helps us connect you with
//         relevant projects and people.
//       </p>

//       {/* Selected interests */}
//       <div className="mb-6">
//         <Label className="text-white mb-2 block">Selected Interests</Label>
//         <div className="flex flex-wrap gap-2 min-h-12 p-3 bg-gray-800/50 rounded-lg border border-gray-700">
//           {userData.interests.length === 0 ? (
//             <p className="text-gray-500 text-sm">No interests selected yet</p>
//           ) : (
//             userData.interests.map((interest) => (
//               <div
//                 key={interest}
//                 className="flex items-center gap-1 px-3 py-1 bg-yellow-400/20 text-yellow-400 rounded-full text-sm"
//               >
//                 {interest}
//                 <button
//                   onClick={() => removeInterest(interest)}
//                   className="ml-1 text-yellow-400 hover:text-yellow-300"
//                   aria-label={`Remove ${interest}`}
//                 >
//                   <X className="h-3 w-3" />
//                 </button>
//               </div>
//             ))
//           )}
//         </div>
//       </div>

//       {/* Custom interest */}
//       <div className="mb-8">
//         <Label htmlFor="customInterest" className="text-white mb-2 block">
//           Add Custom Interest
//         </Label>
//         <div className="flex gap-2">
//           <input
//             id="customInterest"
//             value={customInterest}
//             onChange={(e) => setCustomInterest(e.target.value)}
//             placeholder="Enter a custom interest"
//             className="flex-1 bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 h-10 rounded-md px-3 transition-all duration-200 focus:ring-2 focus:ring-yellow-400/50 focus:outline-none"
//             onKeyDown={(e) => {
//               if (e.key === "Enter") {
//                 e.preventDefault();
//                 handleAddCustomInterest();
//               }
//             }}
//           />
//           <Button
//             type="button"
//             onClick={handleAddCustomInterest}
//             className="bg-gray-800 hover:bg-gray-700 text-white"
//             disabled={!customInterest}
//           >
//             <Plus className="h-4 w-4" />
//           </Button>
//         </div>
//       </div>

//       {/* Interest categories */}
//       <div className="space-y-6">
//         {interestCategories.map((category) => (
//           <div key={category.name}>
//             <h3 className="text-lg font-medium text-white mb-3">
//               {category.name}
//             </h3>
//             <div className="flex flex-wrap gap-2">
//               {category.options.map((option) => (
//                 <button
//                   key={option}
//                   onClick={() => addInterest(option)}
//                   className={`px-3 py-1.5 rounded-full text-sm transition-all duration-200 ${
//                     userData.interests.includes(option)
//                       ? "bg-yellow-400 text-black font-medium"
//                       : "bg-gray-800 text-gray-300 hover:bg-gray-700"
//                   }`}
//                   disabled={userData.interests.includes(option)}
//                 >
//                   {option}
//                 </button>
//               ))}
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }
