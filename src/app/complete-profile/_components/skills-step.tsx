// "use client";

// import { useState } from "react";
// import { Label } from "@/components/ui/label";
// import { Button } from "@/components/ui/button";
// import { X, Plus, Search } from "lucide-react";

// interface SkillsStepProps {
//   userData: {
//     skills: string[];
//     // eslint-disable-next-line @typescript-eslint/no-explicit-any
//     [key: string]: any;
//   };
//   updateUserData: (data: Partial<SkillsStepProps["userData"]>) => void;
// }

// // Predefined skill categories
// const skillCategories = [
//   {
//     name: "Programming Languages",
//     options: [
//       "JavaScript",
//       "TypeScript",
//       "Python",
//       "Java",
//       "C#",
//       "Go",
//       "Ruby",
//       "PHP",
//       "Swift",
//       "Kotlin",
//     ],
//   },
//   {
//     name: "Frontend",
//     options: [
//       "React",
//       "Vue",
//       "Angular",
//       "Next.js",
//       "Svelte",
//       "HTML",
//       "CSS",
//       "Tailwind CSS",
//       "SASS",
//       "Redux",
//     ],
//   },
//   {
//     name: "Backend",
//     options: [
//       "Node.js",
//       "Express",
//       "Django",
//       "Flask",
//       "Spring Boot",
//       "Laravel",
//       "ASP.NET",
//       "GraphQL",
//       "REST API",
//       "Microservices",
//     ],
//   },
//   {
//     name: "DevOps & Tools",
//     options: [
//       "Git",
//       "Docker",
//       "Kubernetes",
//       "AWS",
//       "Azure",
//       "GCP",
//       "CI/CD",
//       "Linux",
//       "Bash",
//       "Terraform",
//     ],
//   },
// ];

// export default function SkillsStep({
//   userData,
//   updateUserData,
// }: SkillsStepProps) {
//   const [customSkill, setCustomSkill] = useState("");
//   const [searchTerm, setSearchTerm] = useState("");

//   // Add skill
//   const addSkill = (skill: string) => {
//     if (!skill || skill.trim() === "") return;

//     // Check if skill already exists
//     if (userData.skills.includes(skill)) return;

//     // Add skill
//     updateUserData({ skills: [...userData.skills, skill] });
//   };

//   // Remove skill
//   const removeSkill = (skill: string) => {
//     updateUserData({ skills: userData.skills.filter((s) => s !== skill) });
//   };

//   // Handle custom skill
//   const handleAddCustomSkill = () => {
//     if (!customSkill || customSkill.trim() === "") return;

//     addSkill(customSkill);
//     setCustomSkill("");
//   };

//   // Filter skills based on search term
//   const filteredCategories = searchTerm
//     ? skillCategories
//         .map((category) => ({
//           ...category,
//           options: category.options.filter((option) =>
//             option.toLowerCase().includes(searchTerm.toLowerCase())
//           ),
//         }))
//         .filter((category) => category.options.length > 0)
//     : skillCategories;

//   return (
//     <div>
//       <h2 className="text-2xl font-bold text-white mb-6">Your Skills</h2>
//       <p className="text-gray-300 mb-6">
//         Add skills that showcase your expertise. This helps others understand
//         your strengths and capabilities.
//       </p>

//       {/* Selected skills */}
//       <div className="mb-6">
//         <Label className="text-white mb-2 block">Selected Skills</Label>
//         <div className="flex flex-wrap gap-2 min-h-12 p-3 bg-gray-800/50 rounded-lg border border-gray-700">
//           {userData.skills.length === 0 ? (
//             <p className="text-gray-500 text-sm">No skills selected yet</p>
//           ) : (
//             userData.skills.map((skill) => (
//               <div
//                 key={skill}
//                 className="flex items-center gap-1 px-3 py-1 bg-yellow-400/20 text-yellow-400 rounded-full text-sm"
//               >
//                 {skill}
//                 <button
//                   onClick={() => removeSkill(skill)}
//                   className="ml-1 text-yellow-400 hover:text-yellow-300"
//                   aria-label={`Remove ${skill}`}
//                 >
//                   <X className="h-3 w-3" />
//                 </button>
//               </div>
//             ))
//           )}
//         </div>
//       </div>

//       {/* Search skills */}
//       <div className="mb-6">
//         <Label htmlFor="searchSkills" className="text-white mb-2 block">
//           Search Skills
//         </Label>
//         <div className="relative">
//           <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
//           <input
//             id="searchSkills"
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             placeholder="Search for skills..."
//             className="w-full bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 h-10 rounded-md pl-10 pr-3 transition-all duration-200 focus:ring-2 focus:ring-yellow-400/50 focus:outline-none"
//           />
//         </div>
//       </div>

//       {/* Custom skill */}
//       <div className="mb-8">
//         <Label htmlFor="customSkill" className="text-white mb-2 block">
//           Add Custom Skill
//         </Label>
//         <div className="flex gap-2">
//           <input
//             id="customSkill"
//             value={customSkill}
//             onChange={(e) => setCustomSkill(e.target.value)}
//             placeholder="Enter a custom skill"
//             className="flex-1 bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 h-10 rounded-md px-3 transition-all duration-200 focus:ring-2 focus:ring-yellow-400/50 focus:outline-none"
//             onKeyDown={(e) => {
//               if (e.key === "Enter") {
//                 e.preventDefault();
//                 handleAddCustomSkill();
//               }
//             }}
//           />
//           <Button
//             type="button"
//             onClick={handleAddCustomSkill}
//             className="bg-gray-800 hover:bg-gray-700 text-white"
//             disabled={!customSkill}
//           >
//             <Plus className="h-4 w-4" />
//           </Button>
//         </div>
//       </div>

//       {/* Skill categories */}
//       {filteredCategories.length > 0 ? (
//         <div className="space-y-6">
//           {filteredCategories.map((category) => (
//             <div key={category.name}>
//               <h3 className="text-lg font-medium text-white mb-3">
//                 {category.name}
//               </h3>
//               <div className="flex flex-wrap gap-2">
//                 {category.options.map((option) => (
//                   <button
//                     key={option}
//                     onClick={() => addSkill(option)}
//                     className={`px-3 py-1.5 rounded-full text-sm transition-all duration-200 ${
//                       userData.skills.includes(option)
//                         ? "bg-yellow-400 text-black font-medium"
//                         : "bg-gray-800 text-gray-300 hover:bg-gray-700"
//                     }`}
//                     disabled={userData.skills.includes(option)}
//                   >
//                     {option}
//                   </button>
//                 ))}
//               </div>
//             </div>
//           ))}
//         </div>
//       ) : (
//         <p className="text-gray-400 text-center py-4">
//           No skills found matching your search
//         </p>
//       )}
//     </div>
//   );
// }
