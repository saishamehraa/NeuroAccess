// src/components/PromptGallery.tsx

import { motion } from "motion/react";
import { PromptCard } from "./PromptCard";
import { PromptGridCard } from "./PromptGridCard";
import { type Prompt } from "../data/promptsData";
import { useState, useMemo } from "react";
import { Button } from "./ui/button";
import { Bookmark, Sparkles, Search } from "./SimpleIcons";

interface PromptGalleryProps {
  prompts: Prompt[]; // This is the filtered list for display
  allPrompts: Prompt[]; // This is the FULL list, needed for the "View Saved" feature
  onPromptClick: (prompt: Prompt) => void;
  viewMode: "gallery" | "grid";
  onToggleSave: (id: string | number) => void;
  onSaveCustomPrompt: (prompt: any) => void;
}

// FIX: We now accept `allPrompts` as a prop to correctly handle the "View Saved" feature.
export function PromptGallery({ prompts, allPrompts, onPromptClick, viewMode, onToggleSave }: PromptGalleryProps) {
  const [viewSaved, setViewSaved] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // --- REMOVED ---
  // We no longer need a separate state for the prompts list or a useEffect to sync it.
  // The component will now directly use the `prompts` prop for rendering.

  // FIX: Calculate savedPrompts from the FULL list (`allPrompts`) to avoid filtering bugs.
  const savedPrompts = useMemo(() => allPrompts.filter((p) => p.saved), [allPrompts]);

  // This logic remains the same, but it now correctly operates on the full list of saved prompts.
  const filteredSavedPrompts = useMemo(() => {
    if (!searchQuery) return savedPrompts;
    return savedPrompts.filter((p) =>
      [p.text, p.category, p.useCase, ...(p.tags || [])]
        .some((field) =>
          field?.toLowerCase().includes(searchQuery.toLowerCase())
        )
    );
  }, [savedPrompts, searchQuery]);


  // Logic for displaying the main gallery (either grid or row view)
  const renderMainGallery = () => {
    // Show a message if no prompts match the filters.
    if (prompts.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">No prompts found matching your criteria.</p>
          <p className="text-gray-500 text-sm mt-2">Try adjusting your search terms or filters.</p>
        </div>
      );
    }

    if (viewMode === "grid") {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {/* FIX: Directly map over the `prompts` prop */}
          {prompts.map((prompt) => (
            <motion.div
              key={String(prompt.id)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <PromptGridCard
                prompt={prompt}
                onClick={() => onPromptClick(prompt)}
                saved={prompt.saved ?? false}
                onToggleSave={() => onToggleSave(prompt.id)}
              />
            </motion.div>
          ))}
        </div>
      );
    }

    // Gallery (scrolling rows) view
    const chunkSize = 6;
    const promptRows = [];
    // FIX: Directly use the `prompts` prop
    for (let i = 0; i < prompts.length; i += chunkSize) {
      promptRows.push(prompts.slice(i, i + chunkSize));
    }

    return (
      <div className="space-y-8">
        {promptRows.map((row, rowIndex) => (
          <div key={rowIndex} className="overflow-hidden">
            <motion.div
              className="flex gap-6"
              animate={{ x: rowIndex % 2 === 0 ? [-100, -2200] : [-2200, -100] }}
              transition={{ duration: 30 + rowIndex * 5, repeat: Infinity, ease: "linear" }}
            >
              {[...row, ...row, ...row, ...row].map((prompt, index) => (
                <PromptCard
                  key={`row${rowIndex}-${String(prompt.id)}-${index}`}
                  text={prompt.text}
                  icon={prompt.icon}
                  color={prompt.color}
                  onClick={() => onPromptClick(prompt)}
                  saved={prompt.saved ?? false}
                  onToggleSave={() => onToggleSave(prompt.id)}
                />
              ))}
            </motion.div>
          </div>
        ))}
      </div>
    );
  };

  // Logic for displaying the saved prompts view
  const renderSavedGallery = () => {
    return (
      <div className="space-y-6">
        <div className="relative max-w-2xl mx-auto">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search saved prompts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-2 pl-12 rounded-md bg-gray-800 text-white border border-gray-700 placeholder-gray-400"
          />
        </div>
        {filteredSavedPrompts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No saved prompts found.</p>
            <p className="text-gray-500 text-sm mt-2">Try searching or save a new prompt to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredSavedPrompts.map((prompt) => (
              <motion.div
                key={String(prompt.id)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <PromptGridCard
                  prompt={prompt}
                  onClick={() => onPromptClick(prompt)}
                  saved={true}
                  onToggleSave={() => onToggleSave(prompt.id)}
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    );
  };


  return (
    <div className="py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">
          {viewSaved ? `Saved Prompts (${savedPrompts.length})` : "Prompts Gallery"}
        </h2>
        <Button
          onClick={() => setViewSaved(!viewSaved)}
          variant="outline"
          className={viewSaved ? "" : "border-yellow-500/50 text-yellow-300 hover:bg-yellow-500/10"}
        >
          {viewSaved ? (
            <><Sparkles className="w-4 h-4 mr-2" /> View All Prompts</>
          ) : (
            <><Bookmark className="w-4 h-4 mr-2" /> View Saved ({savedPrompts.length})</>
          )}
        </Button>
      </div>

      {viewSaved ? renderSavedGallery() : renderMainGallery()}
    </div>
  );
}