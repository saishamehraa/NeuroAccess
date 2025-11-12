import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Textarea } from "./ui/textarea";
import { toast } from "sonner";
import { type Prompt } from "../data/promptsData";
import { Copy, Share2, Bookmark, Edit, Sparkles, ExternalLink } from "./SimpleIcons";
import { useState } from "react";

interface PromptModalProps {
  prompt: Prompt;
  onClose: () => void;
  //onToggleSave: (id: string | number, isCurrentlySaved:boolean) => void;
  onToggleSave: (id: string | number) => void;
}

export function PromptModal({ prompt, onClose, onToggleSave }: PromptModalProps) {
  const [customizedPrompt, setCustomizedPrompt] = useState(prompt.fullPrompt);
  const [isEditing, setIsEditing] = useState(false);

  const Icon = prompt.icon;

  const handleCopy = () => {
    navigator.clipboard.writeText(customizedPrompt);
    toast.success("Prompt copied to clipboard!");
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: prompt.text,
        text: customizedPrompt,
        url: window.location.href
      });
    } else {
      handleCopy();
    }
  };

  const handleSave = () => {
    //onToggleSave(prompt.id, prompt.saved ?? false);
    onToggleSave(prompt.id);
    // In a real app, this would save to user's collection
    toast.success("Prompt saved to your collection!");
  };

  const handleOpenInChatGPT = () => {
    const encodedPrompt = encodeURIComponent(customizedPrompt);
    window.open(`https://chat.openai.com/?q=${encodedPrompt}`, '_blank');
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'intermediate': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'advanced': return 'bg-red-500/20 text-red-300 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] bg-gray-900 border-gray-700 text-white overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start gap-4">
            <div className={`w-16 h-16 bg-gradient-to-r ${prompt.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
              <Icon className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-2xl font-bold text-white mb-2">
                {prompt.text}
              </DialogTitle>
              <DialogDescription className="text-gray-300 text-base">
                {prompt.useCase}
              </DialogDescription>
              
              {/* Metadata */}
              <div className="flex flex-wrap gap-2 mt-4">
                <Badge className={getDifficultyColor(prompt.difficulty)}>
                  <Sparkles className="w-3 h-3 mr-1" />
                  {prompt.difficulty}
                </Badge>
                {prompt.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="bg-gray-700 text-gray-300">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Prompt Content */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Prompt Template</h3>
              <Button
                onClick={() => setIsEditing(!isEditing)}
                variant="outline"
                size="sm"
                className="border-purple-500/50 text-purple-300 hover:bg-purple-500/10"
              >
                <Edit className="w-4 h-4 mr-1" />
                {isEditing ? 'Preview' : 'Customize'}
              </Button>
            </div>
            
            {isEditing ? (
              <Textarea
                value={customizedPrompt}
                onChange={(e) => setCustomizedPrompt(e.target.value)}
                className="min-h-[200px] bg-gray-800 border-gray-600 text-white focus:border-purple-500"
                placeholder="Customize your prompt..."
              />
            ) : (
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-600">
                <pre className="whitespace-pre-wrap text-sm text-gray-300 font-mono">
                  {customizedPrompt}
                </pre>
              </div>
            )}
          </div>

          {/* Example Usage */}
          {prompt.example && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-white">Example Usage</h3>
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <p className="text-blue-300 text-sm">{prompt.example}</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-700">
            <Button
              onClick={handleCopy}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy Prompt
            </Button>
            
            <Button
              onClick={handleOpenInChatGPT}
              variant="outline"
              className="border-green-500/50 text-green-300 hover:bg-green-500/10"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Open in ChatGPT
            </Button>
            
            <Button
              onClick={handleShare}
              variant="outline"
              className="border-blue-500/50 text-blue-300 hover:bg-blue-500/10"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
            
            <Button
              onClick={handleSave}
              variant="outline"
              className="border-yellow-500/50 text-yellow-300 hover:bg-yellow-500/10"
            >
              <Bookmark className="w-4 h-4 mr-2" />
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}