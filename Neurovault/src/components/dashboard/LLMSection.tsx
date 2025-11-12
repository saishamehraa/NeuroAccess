import React, { useState, useEffect } from 'react';
import { Search, Brain, Zap, Code, Globe, CheckCircle } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

interface LLMModel {
  id: string;
  name: string;
  provider: string;
  description: string;
  category: string;
  capabilities: string[];
  usage?: number;
  trend?: number;
  icon?: React.ReactNode;
  color?: string;
}

interface LLMSectionProps {
  onModelSelect: (modelId: string) => void;
}

export function LLMSection({ onModelSelect }: LLMSectionProps) {
  const { theme } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedModel, setSelectedModel] = useState('google/gemma-3n-e4b-it:free');
  const [models, setModels] = useState<LLMModel[]>([]);
  const [loading, setLoading] = useState(true);

  const fallbackModels: LLMModel[] = [
    {
      id: 'gpt-4',
      name: 'GPT-4',
      provider: 'OpenAI',
      description: 'Most capable GPT model, great for complex reasoning and creative tasks',
      category: 'general',
      capabilities: ['Text Generation', 'Code', 'Analysis', 'Creative Writing'],
      usage: 85,
      trend: 12,
      icon: <Brain className="w-6 h-6" />,
      color: '#10B981'
    },
    {
      id: 'claude-3',
      name: 'Claude 3',
      provider: 'Anthropic',
      description: 'Advanced AI assistant with strong reasoning and safety features',
      category: 'general',
      capabilities: ['Reasoning', 'Analysis', 'Writing', 'Math'],
      usage: 72,
      trend: 18,
      icon: <Zap className="w-6 h-6" />,
      color: '#8B5CF6'
    },
    {
      id: 'gemini-pro',
      name: 'Gemini Pro',
      provider: 'Google',
      description: 'Multimodal AI model with strong performance across various tasks',
      category: 'general',
      capabilities: ['Multimodal', 'Reasoning', 'Code', 'Vision'],
      usage: 68,
      trend: 15,
      icon: <Globe className="w-6 h-6" />,
      color: '#F59E0B'
    },
    {
      id: 'codellama',
      name: 'Code Llama',
      provider: 'Meta',
      description: 'Specialized for code generation and programming tasks',
      category: 'coding',
      capabilities: ['Code Generation', 'Debugging', 'Refactoring', 'Documentation'],
      usage: 42,
      trend: 16,
      icon: <Code className="w-6 h-6" />,
      color: '#84CC16'
    },
    {
      id: 'llama-2',
      name: 'Llama 2',
      provider: 'Meta',
      description: 'Open-source large language model for various applications',
      category: 'open-source',
      capabilities: ['Text Generation', 'Conversation', 'Summarization'],
      usage: 45,
      trend: 8,
      icon: <Brain className="w-6 h-6" />,
      color: '#EF4444'
    },
    {
      id: 'mistral-7b',
      name: 'Mistral 7B',
      provider: 'Mistral AI',
      description: 'Efficient open-source model with strong performance',
      category: 'open-source',
      capabilities: ['Text Generation', 'Reasoning', 'Multilingual'],
      usage: 38,
      trend: 22,
      icon: <Zap className="w-6 h-6" />,
      color: '#06B6D4'
    }
  ];

  const categories = [
    { id: 'all', name: 'All Models' },
    { id: 'general', name: 'General Purpose' },
    { id: 'coding', name: 'Code Generation' },
    { id: 'open-source', name: 'Open Source' },
  ];

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const res = await fetch('https://openrouter.ai/api/v1/models');
        const data = await res.json();

        if (data.data && Array.isArray(data.data)) {
          const formattedModels = data.data.map((m: any) => ({
            id: m.id,
            name: m.name,
            provider: m.id.split('/')[0],
            description: m.description || 'No description available',
            category: m.id.includes('code') ? 'coding' :
                      m.id.includes('llama') || m.id.includes('mistral') ? 'open-source' :
                      'general',
            capabilities: m.capabilities || ['Text Generation'],
            usage: Math.floor(Math.random() * 100),
            trend: Math.floor(Math.random() * 25),
            icon: <Brain className="w-6 h-6" />,
            color: `#${Math.floor(Math.random()*16777215).toString(16)}`
          }));

          setModels(formattedModels);
        } else {
          setModels(fallbackModels);
        }
      } catch (err) {
        console.error('Failed to fetch models:', err);
        setModels(fallbackModels);
      } finally {
        setLoading(false);
      }
    };

    fetchModels();
  }, []);

  const filteredModels = models.filter(model => {
    const matchesSearch =
      model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      model.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      model.capabilities.some(cap => cap.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = selectedCategory === 'all' || model.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleModelSelect = (modelId: string) => {
    setSelectedModel(modelId);
    onModelSelect(modelId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2
          className="text-4xl font-bold text-transparent bg-clip-text leading-relaxed transition-all duration-300 mb-4"
          style={{
            backgroundImage: theme === "dark" 
              ? "linear-gradient(to right, #22d3ee, #a855f7, #ec4899)"
              : "linear-gradient(to right, #9333ea, #db2777, #dc2626)"
          }}
        >
          Language Models
        </h2>
        <p className={`text-lg transition-colors duration-300 ${
          theme === 'dark' ? 'text-purple-300' : 'text-purple-700'
        }`}>
          Choose the perfect AI model for your use case
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search
            className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${
              theme === 'dark' ? 'text-purple-400' : 'text-purple-600'
            }`}
          />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search models, capabilities, or use cases..."
            className={`
              w-full pl-10 pr-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2 transition-all duration-300
              bg-transparent border-purple-300 focus:border-pink-500 focus:ring-pink-400
              dark:border-purple-700 dark:focus:border-pink-400 dark:focus:ring-pink-500
              text-gray-900 placeholder-gray-600 dark:text-white dark:placeholder-purple-300
            `}
          />
        </div>

        <div className="flex gap-2 overflow-x-auto scrollbar-thin">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                selectedCategory === category.id
                  ? theme === 'dark'
                    ? 'bg-gradient-to-r from-purple-400/30 to-pink-500/30 text-purple-200 shadow-lg'
                    : 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-800 shadow-lg'
                  : theme === 'dark'
                    ? 'bg-gray-800/30 text-purple-300 hover:bg-gray-700/40 border border-gray-600/30'
                    : 'bg-white/30 text-purple-700 hover:bg-white/50 border border-gray-200/30'
              } backdrop-blur-sm`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Models Grid */}
      {loading ? (
        <div className="text-center py-12">
          <p className={`transition-colors duration-300 ${
            theme === 'dark' ? 'text-purple-300' : 'text-purple-700'
          }`}>
            Loading models...
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredModels.map((model) => (
            <div
              key={model.id}
              className={`p-6 rounded-2xl shadow-xl backdrop-blur-sm border transition-all duration-300 cursor-pointer ${
                selectedModel === model.id
                  ? theme === 'dark'
                    ? 'bg-gradient-to-r from-purple-400/20 to-pink-500/20 border-purple-500/50 scale-105'
                    : 'bg-gradient-to-r from-purple-500/15 to-pink-500/15 border-purple-400/50 scale-105'
                  : theme === 'dark'
                    ? 'bg-gray-800/30 border-gray-600/30 hover:bg-gray-700/40'
                    : 'bg-white/30 border-gray-200/30 hover:bg-white/50'
              }`}
              onClick={() => handleModelSelect(model.id)}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg transition-colors duration-300 ${
                    theme === 'dark' ? 'bg-purple-500/20' : 'bg-purple-500/10'
                  }`} style={{ backgroundColor: `${model.color || '#6b21a8'}20` }}>
                    <div style={{ color: model.color || '#6b21a8' }}>
                      {model.icon || <Brain className="w-6 h-6" />}
                    </div>
                  </div>
                  <div>
                    <h3 className={`font-semibold text-lg transition-colors duration-300 ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      {model.name}
                    </h3>
                    <p className={`text-sm transition-colors duration-300 ${
                      theme === 'dark' ? 'text-purple-300' : 'text-purple-700'
                    }`}>
                      {model.provider}
                    </p>
                  </div>
                </div>

                {selectedModel === model.id && <CheckCircle className="text-green-500" size={24} />}
              </div>

              {/* Description */}
              <p className={`text-sm mb-4 transition-colors duration-300 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
                {model.description}
              </p>

              {/* Capabilities */}
              <div className="mb-4">
                <h4 className={`text-sm font-medium mb-2 transition-colors duration-300 ${
                  theme === 'dark' ? 'text-purple-300' : 'text-purple-700'
                }`}>
                  Capabilities
                </h4>
                <div className="flex flex-wrap gap-2">
                  {model.capabilities.map((capability) => (
                    <span
                      key={capability}
                      className={`px-2 py-1 rounded-full text-xs transition-colors duration-300 ${
                        theme === 'dark'
                          ? 'bg-gray-700/50 text-gray-300'
                          : 'bg-gray-200/50 text-gray-700'
                      }`}
                    >
                      {capability}
                    </span>
                  ))}
                </div>
              </div>

              {/* Stats */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className={`text-xs transition-colors duration-300 ${
                      theme === 'dark' ? 'text-purple-300' : 'text-purple-700'
                    }`}>
                      Usage
                    </p>
                    <p className="font-semibold" style={{ color: model.color }}>
                      {model.usage ?? '--'}%
                    </p>
                  </div>
                  <div className="text-center">
                    <p className={`text-xs transition-colors duration-300 ${
                      theme === 'dark' ? 'text-purple-300' : 'text-purple-700'
                    }`}>
                      Trend
                    </p>
                    <p className="font-semibold text-green-500">
                      +{model.trend ?? 0}%
                    </p>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleModelSelect(model.id);
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    selectedModel === model.id
                      ? 'bg-green-500 text-white'
                      : theme === 'dark'
                        ? 'bg-purple-600/20 text-purple-300 hover:bg-purple-600/30'
                        : 'bg-purple-500/20 text-purple-700 hover:bg-purple-500/30'
                  }`}
                >
                  {selectedModel === model.id ? 'Selected' : 'Select'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No Results */}
      {!loading && filteredModels.length === 0 && (
        <div className="text-center py-12">
          <Brain className={`mx-auto mb-4 transition-colors duration-300 ${
            theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
          }`} size={48} />
          <p className={`text-lg transition-colors duration-300 ${
            theme === 'dark' ? 'text-purple-300' : 'text-purple-700'
          }`}>
            No models found matching your criteria
          </p>
        </div>
      )}
    </div>
  );
}