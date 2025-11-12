import { Card, CardContent, CardHeader } from "./ui/card"; 
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { motion } from "motion/react";
import { type Prompt } from "../data/promptsData";
import { Eye, Copy, Sparkles, Bookmark } from "./SimpleIcons"; // ✅ use Bookmark

interface PromptGridCardProps {
  prompt: Prompt;
  onClick: () => void;
  saved: boolean;
  onToggleSave: () => void;
}

export function PromptGridCard({ prompt, onClick, saved, onToggleSave }: PromptGridCardProps) {
  const Icon = prompt.icon;

  const handleCopyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(prompt.fullPrompt);
    // Optionally add a toast
  };

  const handleSaveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleSave();
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner": return "bg-green-500/20 text-green-300";
      case "intermediate": return "bg-yellow-500/20 text-yellow-300";
      case "advanced": return "bg-red-500/20 text-red-300";
      default: return "bg-gray-500/20 text-gray-300";
    }
  };

  return (
    <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
      <Card
        className="bg-gray-900/50 border-gray-700 hover:border-purple-500/50 transition-all duration-300 cursor-pointer group h-full backdrop-blur-sm"
        onClick={onClick}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div
              className={`w-12 h-12 bg-gradient-to-r ${prompt.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}
            >
              <Icon className="w-6 h-6 text-white" />
            </div>

            <div className="flex gap-1">
              {/* Save Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSaveClick}
                className={`transition-opacity duration-200 ${
                  saved
                    ? "text-yellow-400"
                    : "text-gray-400 hover:text-white opacity-0 group-hover:opacity-100"
                }`}
              >
                <Bookmark className="w-4 h-4" /> {/* ✅ replaced Star with Bookmark */}
              </Button>

              {/* Copy Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyClick}
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-gray-400 hover:text-white"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-white group-hover:text-purple-300 transition-colors">
              {prompt.text}
            </h3>
            <p className="text-sm text-gray-400 line-clamp-2">{prompt.useCase}</p>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="flex flex-wrap gap-2 mb-3">
            <Badge className={getDifficultyColor(prompt.difficulty)}>
              {prompt.difficulty}
            </Badge>
            {prompt.tags.slice(0, 2).map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="bg-gray-700 text-gray-300 text-xs"
              >
                {tag}
              </Badge>
            ))}
            {prompt.tags.length > 2 && (
              <Badge
                variant="secondary"
                className="bg-gray-700 text-gray-300 text-xs"
              >
                +{prompt.tags.length - 2}
              </Badge>
            )}
          </div>

          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              className="border-purple-500/50 text-purple-300 hover:bg-purple-500/10 group-hover:border-purple-400"
            >
              <Eye className="w-4 h-4 mr-1" />
              View Details
            </Button>
            <Sparkles className="w-4 h-4 text-purple-400 opacity-60 group-hover:opacity-100 transition-opacity" />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
