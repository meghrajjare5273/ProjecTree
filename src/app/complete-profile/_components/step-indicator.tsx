// import { motion } from "motion/react";

// interface StepIndicatorProps {
//   currentStep: number;
//   totalSteps: number;
// }

// export default function StepIndicator({
//   currentStep,
//   totalSteps,
// }: StepIndicatorProps) {
//   const steps = Array.from({ length: totalSteps }, (_, i) => i + 1);

//   return (
//     <div className="relative">
//       {/* Line connecting steps */}
//       <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-700 -translate-y-1/2" />

//       {/* Steps */}
//       <div className="relative flex justify-between">
//         {steps.map((step) => (
//           <div key={step} className="flex flex-col items-center">
//             <motion.div
//               initial={{ scale: 0.8 }}
//               animate={{
//                 scale: currentStep === step ? 1.1 : 1,
//                 backgroundColor:
//                   step <= currentStep
//                     ? "#FACC15"
//                     : step === currentStep + 1
//                     ? "#4B5563"
//                     : "#1F2937",
//               }}
//               className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-all duration-300 ${
//                 step <= currentStep
//                   ? "bg-yellow-400 text-black"
//                   : step === currentStep + 1
//                   ? "bg-gray-600 text-white border border-gray-500"
//                   : "bg-gray-800 text-gray-400 border border-gray-700"
//               }`}
//             >
//               {step < currentStep ? (
//                 <svg
//                   className="w-4 h-4"
//                   fill="currentColor"
//                   viewBox="0 0 20 20"
//                 >
//                   <path
//                     fillRule="evenodd"
//                     d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
//                     clipRule="evenodd"
//                   />
//                 </svg>
//               ) : (
//                 step
//               )}
//             </motion.div>

//             <span
//               className={`mt-2 text-xs ${
//                 step === currentStep
//                   ? "text-yellow-400 font-medium"
//                   : step < currentStep
//                   ? "text-gray-300"
//                   : "text-gray-500"
//               }`}
//             >
//               {step === 1 && "Personal"}
//               {step === 2 && "Photo"}
//               {step === 3 && "Interests"}
//               {step === 4 && "Skills"}
//               {step === 5 && "Bio"}
//             </span>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }
