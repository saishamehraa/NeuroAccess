import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { toast } from "sonner";
import { 
  Wand2, 
  Copy, 
  Save, 
  Lightbulb, 
  Target, 
  Users, 
  Settings,
  CheckCircle,
  Info
} from "./SimpleIcons";

interface CustomPromptBuilderProps {
  onClose: () => void;
  onSaveCustomPrompt: (prompt: any) => void;
}

const promptEngineringTips = [
  {
    title: "Be Specific and Clear",
    description: "Provide clear, detailed instructions. Vague prompts lead to vague results.",
    example: "Instead of 'Write about dogs', use 'Write a 500-word informative article about Golden Retriever care for new pet owners'",
    icon: Target,
    type: "success"
  },
  {
    title: "Define the Role",
    description: "Tell the AI what role to take on for better context and expertise.",
    example: "Act as a professional marketing consultant with 10 years of experience...",
    icon: Users,
    type: "info"
  },
  {
    title: "Specify Format and Structure",
    description: "Clearly define how you want the output formatted.",
    example: "Format your response as: 1. Introduction 2. Main Points (bullet format) 3. Conclusion",
    icon: Settings,
    type: "warning"
  },
  {
    title: "Provide Context and Constraints",
    description: "Give background information and any limitations or requirements.",
    example: "Target audience: beginners, Tone: friendly and encouraging, Length: 300 words max",
    icon: Info,
    type: "info"
  }
];

const promptTemplates = [
  {
    name: "Content Creation",
    template: "Act as a [ROLE] with expertise in [DOMAIN]. Create a [TYPE OF CONTENT] about [TOPIC] for [TARGET AUDIENCE]. The content should be [TONE] and approximately [LENGTH]. Include [SPECIFIC REQUIREMENTS] and focus on [KEY OBJECTIVES]."
  },
  {
    name: "Problem Solving",
    template: "I need help solving [PROBLEM DESCRIPTION]. My goal is to [DESIRED OUTCOME]. The constraints are [LIMITATIONS]. Please provide a step-by-step solution that considers [IMPORTANT FACTORS] and is suitable for [CONTEXT/SITUATION]."
  },
  {
    name: "Analysis & Research",
    template: "Analyze [SUBJECT/DATA] from the perspective of [VIEWPOINT/FRAMEWORK]. Focus on [SPECIFIC ASPECTS] and provide insights about [AREAS OF INTEREST]. Consider [RELEVANT FACTORS] and present findings in [PREFERRED FORMAT]."
  },
  {
    name: "Creative & Design",
    template: "Design [CREATIVE WORK] for [PURPOSE/GOAL]. The style should be [AESTHETIC DIRECTION] targeting [AUDIENCE]. Include [REQUIRED ELEMENTS] and ensure it conveys [KEY MESSAGE/EMOTION]. Consider [CONSTRAINTS/REQUIREMENTS]."
  }
];

export function CustomPromptBuilder({ onClose, onSaveCustomPrompt }: CustomPromptBuilderProps) {
  const [activeTab, setActiveTab] = useState("builder");
  const [promptData, setPromptData] = useState({
    title: "",
    role: "",
    task: "",
    context: "",
    format: "",
    audience: "",
    tone: "",
    length: "",
    constraints: "",
    examples: ""
  });
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("");

  const generatePrompt = () => {
    let prompt = "";
    
    if (promptData.role) {
      prompt += `Act as a ${promptData.role}. `;
    }
    
    if (promptData.task) {
      prompt += `${promptData.task}. `;
    }
    
    if (promptData.context) {
      prompt += `Context: ${promptData.context}. `;
    }
    
    if (promptData.audience) {
      prompt += `Target audience: ${promptData.audience}. `;
    }
    
    if (promptData.tone) {
      prompt += `Tone: ${promptData.tone}. `;
    }
    
    if (promptData.length) {
      prompt += `Length: ${promptData.length}. `;
    }
    
    if (promptData.format) {
      prompt += `Format: ${promptData.format}. `;
    }
    
    if (promptData.constraints) {
      prompt += `Constraints: ${promptData.constraints}. `;
    }
    
    if (promptData.examples) {
      prompt += `Examples to consider: ${promptData.examples}. `;
    }

    setGeneratedPrompt(prompt.trim());
    setActiveTab("preview");
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedPrompt);
    toast.success("Prompt copied to clipboard!");
  };

  const handleSave = () => {
  const newPrompt = {
    //id: Date.now(), // Generate a unique ID for the new prompt
    text: promptData.title || "Custom Prompt",
    fullPrompt: generatedPrompt,
    useCase: promptData.task || "A user-generated prompt.",
    category: "custom", // Add a custom category
    difficulty: "advanced", // Or a default value
    color: "from-purple-500 to-blue-500", // Default color
    //icon: Wand2, // Default icon
    tags: ["custom"],
    saved: true
  };

  onSaveCustomPrompt(newPrompt); // Call the parent's function
  onClose(); // Close the modal
    // In a real app, this would save to user's custom prompts
    toast.success("Custom prompt saved successfully!");
  };

  const useTemplate = (template: string) => {
    setGeneratedPrompt(template);
    setActiveTab("preview");
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'success': return 'text-green-400';
      case 'warning': return 'text-yellow-400';
      case 'info': return 'text-blue-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] bg-gray-900 border-gray-700 text-white overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
            <Wand2 className="w-6 h-6 text-purple-400" />
            Custom Prompt Builder
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
          <TabsList className="grid w-full grid-cols-4 bg-gray-800">
            <TabsTrigger value="builder" className="data-[state=active]:bg-purple-600">
              Builder
            </TabsTrigger>
            <TabsTrigger value="templates" className="data-[state=active]:bg-purple-600">
              Templates
            </TabsTrigger>
            <TabsTrigger value="tips" className="data-[state=active]:bg-purple-600">
              Tips
            </TabsTrigger>
            <TabsTrigger value="preview" className="data-[state=active]:bg-purple-600">
              Preview
            </TabsTrigger>
          </TabsList>

          <TabsContent value="builder" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title" className="text-white">Prompt Title</Label>
                  <Input
                    id="title"
                    value={promptData.title}
                    onChange={(e) => setPromptData({...promptData, title: e.target.value})}
                    placeholder="Give your prompt a descriptive title"
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>

                <div>
                  <Label htmlFor="role" className="text-white">AI Role/Persona</Label>
                  <Input
                    id="role"
                    value={promptData.role}
                    onChange={(e) => setPromptData({...promptData, role: e.target.value})}
                    placeholder="e.g., expert marketing consultant, professional writer"
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>

                <div>
                  <Label htmlFor="task" className="text-white">Main Task</Label>
                  <Textarea
                    id="task"
                    value={promptData.task}
                    onChange={(e) => setPromptData({...promptData, task: e.target.value})}
                    placeholder="Describe what you want the AI to do"
                    className="bg-gray-800 border-gray-600 text-white"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="context" className="text-white">Context/Background</Label>
                  <Textarea
                    id="context"
                    value={promptData.context}
                    onChange={(e) => setPromptData({...promptData, context: e.target.value})}
                    placeholder="Provide relevant background information"
                    className="bg-gray-800 border-gray-600 text-white"
                    rows={2}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="audience" className="text-white">Target Audience</Label>
                  <Input
                    id="audience"
                    value={promptData.audience}
                    onChange={(e) => setPromptData({...promptData, audience: e.target.value})}
                    placeholder="e.g., beginners, professionals, students"
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="tone" className="text-white">Tone</Label>
                    <Select value={promptData.tone} onValueChange={(value) => setPromptData({...promptData, tone: value})}>
                      <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                        <SelectValue placeholder="Select tone" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-600">
                        <SelectItem value="professional">Professional</SelectItem>
                        <SelectItem value="casual">Casual</SelectItem>
                        <SelectItem value="friendly">Friendly</SelectItem>
                        <SelectItem value="formal">Formal</SelectItem>
                        <SelectItem value="creative">Creative</SelectItem>
                        <SelectItem value="persuasive">Persuasive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="length" className="text-white">Length</Label>
                    <Input
                      id="length"
                      value={promptData.length}
                      onChange={(e) => setPromptData({...promptData, length: e.target.value})}
                      placeholder="e.g., 500 words, 3 paragraphs"
                      className="bg-gray-800 border-gray-600 text-white"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="format" className="text-white">Output Format</Label>
                  <Input
                    id="format"
                    value={promptData.format}
                    onChange={(e) => setPromptData({...promptData, format: e.target.value})}
                    placeholder="e.g., bullet points, numbered list, essay format"
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>

                <div>
                  <Label htmlFor="constraints" className="text-white">Constraints/Requirements</Label>
                  <Textarea
                    id="constraints"
                    value={promptData.constraints}
                    onChange={(e) => setPromptData({...promptData, constraints: e.target.value})}
                    placeholder="Any specific limitations or requirements"
                    className="bg-gray-800 border-gray-600 text-white"
                    rows={2}
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                onClick={generatePrompt}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                <Wand2 className="w-4 h-4 mr-2" />
                Generate Prompt
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="templates" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {promptTemplates.map((template, index) => (
                <Card key={index} className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">{template.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-300 text-sm mb-4 font-mono bg-gray-900 p-3 rounded">
                      {template.template}
                    </p>
                    <Button
                      onClick={() => useTemplate(template.template)}
                      variant="outline"
                      className="border-purple-500/50 text-purple-300 hover:bg-purple-500/10"
                    >
                      Use Template
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="tips" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {promptEngineringTips.map((tip, index) => {
                const IconComponent = tip.icon;
                return (
                  <Card key={index} className="bg-gray-800 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <IconComponent className={`w-5 h-5 ${getIconColor(tip.type)}`} />
                        {tip.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-300 mb-3">{tip.description}</p>
                      <div className="bg-gray-900 p-3 rounded border-l-4 border-purple-500">
                        <p className="text-sm text-purple-300 font-mono">{tip.example}</p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="preview" className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Generated Prompt</h3>
                <div className="flex gap-2">
                  <Button
                    onClick={handleCopy}
                    variant="outline"
                    className="border-green-500/50 text-green-300 hover:bg-green-500/10"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                  <Button
                    onClick={handleSave}
                    variant="outline"
                    className="border-blue-500/50 text-blue-300 hover:bg-blue-500/10"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                </div>
              </div>
              
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-600">
                <pre className="whitespace-pre-wrap text-gray-300 font-mono text-sm">
                  {generatedPrompt || "Generate a prompt using the Builder tab to see it here."}
                </pre>
              </div>

              {generatedPrompt && (
                <div className="space-y-2">
                  <h4 className="font-medium text-white">Quality Check:</h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge className="bg-green-500/20 text-green-300">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Good length
                    </Badge>
                    <Badge className="bg-blue-500/20 text-blue-300">
                      <Info className="w-3 h-3 mr-1" />
                      Clear instructions
                    </Badge>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}