import { motion } from "motion/react";

interface ProfileCompletionCardProps {
  percentage: number;
}

export default function ProfileCompletionCard({
  percentage,
}: ProfileCompletionCardProps) {
  return (
    <div className="bg-gray-800/50 rounded-lg p-5 border border-gray-700">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white font-semibold">Profile Completion</h3>
        <span className="text-2xl font-bold text-yellow-400">
          {percentage}%
        </span>
      </div>

      <div className="h-2.5 bg-gray-700 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: "0%" }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="h-full bg-yellow-400 rounded-full"
        />
      </div>

      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Basic Info</span>
          <span
            className={`${
              percentage >= 20 ? "text-yellow-400" : "text-gray-500"
            }`}
          >
            {percentage >= 20 ? "Complete" : "Incomplete"}
          </span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Profile Photo</span>
          <span
            className={`${
              percentage >= 40 ? "text-yellow-400" : "text-gray-500"
            }`}
          >
            {percentage >= 40 ? "Complete" : "Incomplete"}
          </span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Interests & Skills</span>
          <span
            className={`${
              percentage >= 60 ? "text-yellow-400" : "text-gray-500"
            }`}
          >
            {percentage >= 60 ? "Complete" : "Incomplete"}
          </span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Biography</span>
          <span
            className={`${
              percentage >= 80 ? "text-yellow-400" : "text-gray-500"
            }`}
          >
            {percentage >= 80 ? "Complete" : "Incomplete"}
          </span>
        </div>
      </div>
    </div>
  );
}
