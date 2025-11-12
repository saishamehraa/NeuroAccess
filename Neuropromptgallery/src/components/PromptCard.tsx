import { motion } from "motion/react";
import { Bookmark } from "./SimpleIcons"; // ✅ import bookmark icon

interface PromptCardProps {
  text: string;
  icon: any;
  color: string;
  saved?: boolean;
  onToggleSave?: () => void;
  onClick: () => void;
}

export function PromptCard({ 
  text, 
  icon: Icon, 
  color, 
  onClick, 
  saved, 
  onToggleSave 
}: PromptCardProps) {
  return (
    <motion.div
      className={`flex-shrink-0 w-80 h-24 bg-gradient-to-r ${color} rounded-2xl p-4 flex items-center gap-4 shadow-2xl hover:shadow-3xl transition-all duration-300 cursor-pointer group border border-white/10 relative overflow-hidden`}
      whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
    >
      {/* Animated background effect */}
      <motion.div 
        className="absolute inset-0 bg-white/10 rounded-2xl"
        initial={{ x: '-100%' }}
        whileHover={{ x: '100%' }}
        transition={{ duration: 0.6 }}
      />
      
      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm group-hover:bg-white/30 group-hover:scale-110 transition-all duration-300 relative z-10">
        <Icon className="w-6 h-6 text-white drop-shadow-sm" />
      </div>
      <div className="flex-1 relative z-10">
        <p className="text-white font-medium leading-tight drop-shadow-sm group-hover:text-white/90 transition-colors">
          {text}
        </p>
      </div>
      
      {/* Click indicator */}
      <motion.div
        className="absolute top-2 right-10 w-2 h-2 bg-white/40 rounded-full"
        animate={{ opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 2, repeat: Infinity }}
      />

      {/* Save button (top-right corner) */}
      {onToggleSave && (
        <button
          onClick={(e) => {
            e.stopPropagation(); // prevents triggering card click
            onToggleSave();
          }}
          className={`absolute top-2 right-2 p-1 rounded-full z-20 transition-colors ${
            saved ? "bg-green-500 text-white" : "bg-gray-700 text-gray-300"
          }`}
        >
          <Bookmark className="w-4 h-4" /> {/* ✅ replaced ★/☆ with Bookmark */}
        </button>
      )}
    </motion.div>
  );
}
