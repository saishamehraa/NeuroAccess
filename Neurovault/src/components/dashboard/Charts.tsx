// components/dashboard/Charts.tsx
import { useState, useEffect, useCallback } from "react";
import { Search, TrendingUp, Users, Zap, ExternalLink, RefreshCw, AlertCircle, BarChart3 } from "lucide-react";
import { useTheme } from "../../hooks/useTheme";
import { DashboardCard } from "./DashboardCard";
// --- NEW: Import recharts components ---
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  Tooltip, // Recharts Tooltip
  PieChart,
  Pie,
  Cell,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
} from "recharts";

interface LLMData {
  id: string;
  name: string;
  usage: number;
  trend: number;
  category: string;
  color: string;
  provider: string;
  description?: string;
  pricing?: {
    prompt: number;
    completion: number;
  };
}

interface ChartsProps {
  onModelSelect: (modelId: string) => void;
}

const COLORS = [
  "#10B981", "#8B5CF6", "#F59E0B", "#EF4444", 
  "#06B6D4", "#84CC16", "#F97316", "#EC4899",
  "#3B82F6", "#6366F1", "#F43F5E", "#8B5A2B"
];

// Fallback data for when API fails
const FALLBACK_DATA: LLMData[] = [
  {
    id: "openai/gpt-4",
    name: "GPT-4",
    usage: 85,
    trend: 12,
    category: "general",
    color: "#10B981",
    provider: "OpenAI",
    description: "Most capable GPT model for complex reasoning",
    pricing: { prompt: 0.03, completion: 0.06 }
  },
  {
    id: "anthropic/claude-3",
    name: "Claude 3",
    usage: 72,
    trend: 18,
    category: "general", 
    color: "#8B5CF6",
    provider: "Anthropic",
    description: "Advanced AI with strong safety features",
    pricing: { prompt: 0.015, completion: 0.075 }
  },
  {
    id: "google/gemini-pro",
    name: "Gemini Pro",
    usage: 68,
    trend: 15,
    category: "general",
    color: "#F59E0B",
    provider: "Google",
    description: "Multimodal AI model",
    pricing: { prompt: 0.0005, completion: 0.0015 }
  },
  {
    id: "meta-llama/codellama",
    name: "Code Llama",
    usage: 45,
    trend: 22,
    category: "coding",
    color: "#84CC16",
    provider: "Meta",
    description: "Specialized for code generation",
    pricing: { prompt: 0.0, completion: 0.0 }
  },
  {
    id: "mistralai/mistral-7b",
    name: "Mistral 7B",
    usage: 38,
    trend: 25,
    category: "open-source",
    color: "#06B6D4",
    provider: "Mistral AI",
    description: "Efficient open-source model",
    pricing: { prompt: 0.0002, completion: 0.0002 }
  },
  {
    id: "openai/gpt-3.5-turbo",
    name: "GPT-3.5 Turbo",
    usage: 92,
    trend: 8,
    category: "general",
    color: "#3B82F6",
    provider: "OpenAI",
    description: "Fast and cost-effective",
    pricing: { prompt: 0.001, completion: 0.002 }
  }
];

// --- NEW: Custom Tooltip for Mini Charts ---
const MiniTooltip = ({ active, payload, label }: any) => {
  // Check if payload exists and has data
  if (active && payload && payload.length) {
    // Attempt to get original data and current point data safely
    const data = payload[0]?.payload; 
    const point = payload[0]; 

    // Check if essential data exists before proceeding
    if (!point || typeof point.value === 'undefined') {
      return null; // Don't render tooltip if data is missing
    }

    // Determine name based on context
    const name = data?.name || label || point?.payload?.name; 
    const value = point.value;
    const dataKey = point.dataKey || 'value'; // Fallback dataKey

    return (
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-2 rounded shadow-lg border border-gray-200 dark:border-gray-700 text-xs z-50 relative"> {/* Added z-index */}
        {name && <p className="font-bold mb-1" style={{ color: data?.color || point?.color || point?.payload?.fill || '#000' }}>{name}</p>}
        <p>
          <span className="capitalize">{dataKey}: </span>
          {/* Ensure value is a number before calling toFixed */}
         {/* <span className="font-medium">
            {value > 0 && dataKey === 'trend' ? '+' : ''}
            {typeof value === 'number' ? value.toFixed(0) : value}% 
          </span>*/}
          <span className="font-medium">
            {value > 0 && dataKey === 'trend' ? '+' : ''}
            {typeof value === 'number' ? value.toFixed(0) : value}
            {dataKey === 'trend' || dataKey === 'usage' ? '%' : ''} {/* Suffix based on dataKey */}
          </span>
        </p>
      </div>
    );
  }
  return null;
};


export function Charts({ onModelSelect }: ChartsProps) {
  const { theme } = useTheme();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [hoveredModel, setHoveredModel] = useState<string | null>(null); // Kept for original logic
  const [llmData, setLlmData] = useState<LLMData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [sortBy, setSortBy] = useState<'usage' | 'trend' | 'name'>('usage');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const categories = [
    { id: "all", name: "All Models", count: 0 },
    { id: "general", name: "General Purpose", count: 0 },
    { id: "coding", name: "Code Generation", count: 0 },
    { id: "open-source", name: "Open Source", count: 0 },
  ];

  // --- NO CHANGE TO LOGIC HERE ---
  const categoriesWithCounts = categories.map(cat => ({
    ...cat,
    count: cat.id === 'all' ? llmData.length : llmData.filter(m => m.category === cat.id).length
  }));

  const fetchLLMData = useCallback(async () => {
    // --- NO CHANGE TO LOGIC HERE ---
        setLoading(true);
    setError(null);
    
    try {
      // Try multiple data sources
      const sources = [
        {
          url: "https://openrouter.ai/api/v1/models",
          transform: (data: any) => {
            if (!data.data || !Array.isArray(data.data)) return null;
            return data.data.map((m: any, idx: number) => ({
              id: m.id,
              name: m.name || m.id.split('/').pop(),
              usage: Math.floor(Math.random() * 100), // Simulated usage
              trend: Math.floor(Math.random() * 30) - 10,
              category: m.id.includes('code') || m.id.includes('codellama') ? 'coding' :
                       m.id.includes('llama') || m.id.includes('mistral') || m.id.includes('vicuna') ? 'open-source' :
                       'general',
              color: COLORS[idx % COLORS.length],
              provider: m.id.split('/')[0] || 'Unknown',
              description: m.description || 'No description available',
              pricing: m.pricing || { prompt: 0, completion: 0 }
            }));
          }
        }
      ];

      let modelData: LLMData[] | null = null;

      for (const source of sources) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 8000);

          const res = await fetch(source.url, {
            signal: controller.signal,
            headers: {
              'Accept': 'application/json',
            }
          });

          clearTimeout(timeoutId);

          if (res.ok) {
            const data = await res.json();
            modelData = source.transform(data);
            if (modelData && modelData.length > 0) {
              break; // Successfully got data
            }
          }
        } catch (fetchError) {
          console.warn(`Failed to fetch from ${source.url}:`, fetchError);
          continue; // Try next source
        }
      }

      if (!modelData || modelData.length === 0) {
        console.warn("All API sources failed, using fallback data");
        modelData = FALLBACK_DATA.map((model, _idx) => ({
          ...model,
          // Add some realistic variance to the fallback data
          usage: model.usage + Math.floor(Math.random() * 10) - 5,
          trend: model.trend + Math.floor(Math.random() * 10) - 5,
        }));
      }

      setLlmData(modelData);
      setLastUpdated(new Date());
      
    } catch (err: any) {
      console.error("Failed to fetch LLM data:", err);
      setError("Unable to load model data. Using cached information.");
      setLlmData(FALLBACK_DATA);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // --- NO CHANGE TO LOGIC HERE ---
    fetchLLMData();
    const interval = setInterval(fetchLLMData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchLLMData]);

  const filteredData = llmData
    // --- NO CHANGE TO LOGIC HERE ---
    .filter((model) => {
      const matchesSearch = model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           model.provider.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           model.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "all" || model.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'usage': comparison = (a.usage || 0) - (b.usage || 0); break;
        case 'trend': comparison = (a.trend || 0) - (b.trend || 0); break;
        case 'name': comparison = a.name.localeCompare(b.name); break;
      }
      return sortDirection === 'desc' ? -comparison : comparison;
    });

  // Keep maxUsage as it was used in the original code, even though we replace the visual element
  const maxUsage = Math.max(...filteredData.map((m) => m.usage || 0), 1); 
  const avgTrend = filteredData.length > 0 ? filteredData.reduce((sum, m) => sum + (m.trend || 0), 0) / filteredData.length : 0;

  // --- NO CHANGE TO HANDLERS ---
  const handleModelClick = (modelId: string) => {
    onModelSelect(modelId);
  };

  const handleSort = (newSortBy: typeof sortBy) => {
    if (sortBy === newSortBy) {
      setSortDirection(prev => prev === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(newSortBy);
      setSortDirection('desc');
    }
  };

  const formatLastUpdated = () => {
    // --- NO CHANGE TO LOGIC HERE ---
        if (!lastUpdated) return 'Never';
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - lastUpdated.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    return lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // --- Theme text color helper ---
  const textColor = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const mutedTextColor = theme === 'dark' ? 'text-gray-400' : 'text-gray-600';
  const chartBgColor = theme === 'dark' ? '#4b5563' : '#e5e7eb'; // For backgrounds in charts
  const chartTextColor = theme === 'dark' ? '#e5e7eb' : '#374151'; // For text inside charts

  return (
    <div className="space-y-6">
      {/* Header, Status, Error Banner, Search/Filters/Sort */}
      {/* --- NO CHANGE TO THESE SECTIONS --- */}
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
          LLM Analytics Dashboard
        </h2>
        <p className={`text-lg transition-colors duration-300 ${
          theme === "dark" ? "text-purple-300" : "text-purple-700"
        }`}>
          Real-time analysis of AI language models performance
        </p>
        
        {/* Status Bar */}
        <div className="flex items-center justify-center gap-4 mt-4">
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
            error 
              ? 'bg-red-500/20 text-red-400'
              : 'bg-green-500/20 text-green-400'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              error ? 'bg-red-400' : 'bg-green-400 animate-pulse'
            }`} />
            {error ? 'Data Error' : 'Live Data'}
          </div>
          
          <span className={`text-sm ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Last updated: {formatLastUpdated()}
          </span>
          
          <button
            onClick={fetchLLMData}
            disabled={loading}
            className={`p-1 rounded-lg transition-all duration-300 ${
              theme === 'dark'
                ? 'text-purple-400 hover:text-purple-300 hover:bg-purple-500/20'
                : 'text-purple-600 hover:text-purple-700 hover:bg-purple-500/20'
            } ${loading ? 'animate-spin cursor-not-allowed' : ''}`}
            title="Refresh data"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className={`p-4 rounded-xl border flex items-start gap-3 ${
          theme === 'dark'
            ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-300'
            : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-700'
        }`}>
          <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Notice</p>
            <p className="text-sm">{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-yellow-400 hover:text-yellow-300"
          >
            ×
          </button>
        </div>
      )}

      {/* Search + Filters + Sort */}
      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search
            className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${
              theme === "dark" ? "text-purple-400" : "text-purple-600"
            }`}
          />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search models, providers..."
            className={`
              w-full pl-10 pr-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2 transition-all duration-300
              bg-transparent border-purple-300 focus:border-pink-500 focus:ring-pink-400
              dark:border-purple-700 dark:focus:border-pink-400 dark:focus:ring-pink-500
              ${textColor} placeholder-gray-600 dark:placeholder-purple-300
            `}
          />
        </div>

        <div className="flex gap-2 overflow-x-auto scrollbar-thin">
          {categoriesWithCounts.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 whitespace-nowrap ${
                selectedCategory === category.id
                  ? theme === "dark"
                    ? "bg-gradient-to-r from-purple-400/30 to-pink-500/30 text-purple-200 shadow-lg"
                    : "bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-800 shadow-lg"
                  : theme === "dark"
                  ? "bg-gray-800/30 text-purple-300 hover:bg-gray-700/40 border border-gray-600/30"
                  : "bg-white/30 text-purple-700 hover:bg-white/50 border border-gray-200/30"
              } backdrop-blur-sm`}
            >
              {category.name} ({category.count})
            </button>
          ))}
        </div>

        {/* Sort Controls */}
        <div className="flex gap-2">
          {(['usage', 'trend', 'name'] as const).map((sort) => (
            <button
              key={sort}
              onClick={() => handleSort(sort)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 capitalize ${
                sortBy === sort
                  ? theme === 'dark'
                    ? 'bg-purple-500/30 text-purple-200'
                    : 'bg-purple-500/20 text-purple-800'
                  : theme === 'dark'
                    ? 'text-gray-400 hover:text-purple-300'
                    : 'text-gray-600 hover:text-purple-700'
              }`}
            >
              {sort} {sortBy === sort && (sortDirection === 'desc' ? '↓' : '↑')}
            </button>
          ))}
        </div>
      </div>


      {/* Summary Stats */}
      {/* --- NO CHANGE TO THIS SECTION --- */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <DashboardCard title="Total Models" icon={<BarChart3 className="text-blue-500" size={24} />}>
          <p className="text-2xl font-bold text-blue-500">{filteredData.length}</p>
          <p className={`text-sm mt-1 ${mutedTextColor}`}>
            Available models
          </p>
        </DashboardCard>
        {/* ... other summary cards ... */}
              <DashboardCard title="Most Active" icon={<Zap className="text-yellow-500" size={24} />}>
          <p className="text-xl font-bold text-yellow-500">
            {filteredData.reduce(
              (max, model) => (model.usage > (max?.usage || 0) ? model : max),
              filteredData[0]
            )?.name?.split(' ')[0] || "N/A"}
          </p>
          <p className={`text-sm mt-1 ${mutedTextColor}`}>
            {filteredData.reduce((max, model) => (model.usage > (max?.usage || 0) ? model : max), filteredData[0])?.usage || 0}% usage
          </p>
        </DashboardCard>

        <DashboardCard title="Fastest Growing" icon={<TrendingUp className="text-green-500" size={24} />}>
          <p className="text-xl font-bold text-green-500">
            {filteredData.reduce(
              (max, model) => (model.trend > (max?.trend || -100) ? model : max),
              filteredData[0]
            )?.name?.split(' ')[0] || "N/A"}
          </p>
          <p className={`text-sm mt-1 ${mutedTextColor}`}>
            +{filteredData.reduce((max, model) => (model.trend > (max?.trend || -100) ? model : max), filteredData[0])?.trend || 0}% growth
          </p>
        </DashboardCard>

        <DashboardCard title="Avg. Growth" icon={<Users className="text-purple-500" size={24} />}>
          <p className="text-xl font-bold text-purple-500">
            {avgTrend > 0 ? '+' : ''}{!isNaN(avgTrend) ? avgTrend.toFixed(1) : 'N/A'}% {/* Added NaN check */}
          </p>
          <p className={`text-sm mt-1 ${mutedTextColor}`}>
            7-day average
          </p>
        </DashboardCard>
      </div>


      {/* Charts */}
      {loading ? (
        // --- NO CHANGE ---
        <div className="text-center py-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <RefreshCw className="animate-spin text-purple-500" size={32} />
          </div>
          <p className={`text-lg ${theme === 'dark' ? 'text-purple-300' : 'text-purple-700'}`}>
            Loading analytics data...
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* --- USAGE STATISTICS - Enhanced List Item --- */}
          <DashboardCard title="Usage Statistics" icon={<Users className="text-blue-500" size={24} />}>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredData.length === 0 ? (
                <p className={`text-center py-8 ${mutedTextColor}`}>
                  No models found matching your criteria
                </p>
              ) : (
                filteredData.map((model) => (
                  // --- Keep Existing List Item Structure & Logic ---
                  <div
                    key={model.id}
                    className={`p-4 rounded-xl transition-all duration-300 cursor-pointer border group ${
                      hoveredModel === model.id
                        ? theme === "dark" ? "bg-gray-700/50 scale-[1.02] border-purple-500/30 shadow-xl" : "bg-gray-100/50 scale-[1.02] border-purple-400/30 shadow-xl"
                        : theme === "dark" ? "bg-gray-700/30 hover:bg-gray-700/40 border-gray-600/20" : "bg-gray-100/30 hover:bg-gray-100/40 border-gray-200/20"
                    }`}
                    onMouseEnter={() => setHoveredModel(model.id)}
                    onMouseLeave={() => setHoveredModel(null)}
                    onClick={() => handleModelClick(model.id)}
                  >
                    <div className="flex items-center justify-between">
                      {/* --- Left side: Name and Provider --- */}
                      <div className="flex-1 mr-4 overflow-hidden"> {/* Added flex-1 and overflow */}
                        <span className={`font-medium transition-colors duration-300 ${textColor} truncate block`}> {/* Added truncate */}
                          {model.name}
                        </span>
                        <p className={`text-xs mt-1 ${mutedTextColor} truncate block`}> {/* Added truncate */}
                          {model.provider}
                        </p>
                      </div>
                      {/* --- Right side: Usage % and Mini Chart --- */}
                      <div className="flex items-center gap-3 flex-shrink-0"> {/* Added flex-shrink-0 */}
                        {/* --- NEW: Radial Progress Chart --- */}
                        <div className="w-[40px] h-[40px]"> {/* Use fixed size */}
                          <ResponsiveContainer width="100%" height="100%">
                            <RadialBarChart 
                              cx="50%" cy="50%" 
                              innerRadius="60%" outerRadius="100%" 
                              barSize={6} 
                              data={[{ usage: model.usage || 0, fill: model.color }]} // Data needs fill property
                              startAngle={90} 
                              endAngle={-270}
                            >
                              <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                              <RadialBar 
                                background={{ fill: chartBgColor }} // background color
                                dataKey='usage' 
                                cornerRadius={3} // rounded ends
                                angleAxisId={0} 
                                isAnimationActive={false} // Disable animation for performance in list
                              >
                                
                               <Cell fill={model.color} />
                              </RadialBar>

                               {/* Text inside */}
                               <text 
                                x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" 
                                className="text-[10px] font-semibold"
                                fill={chartTextColor}
                              >
                                {model.usage}%
                              </text>
                            </RadialBarChart>
                          </ResponsiveContainer>
                        </div>
                        {/* --- End Radial Chart --- */}
                         {hoveredModel === model.id && (
                          <ExternalLink size={16} className="text-pink-500 group-hover:scale-110 transition-transform" />
                        )}
                      </div>
                    </div>
                     {/* Pricing Info (Keep as before) */}
                    {model.pricing && hoveredModel === model.id && (
                      <div className={`mt-2 text-xs ${mutedTextColor}`}>
                        ${model.pricing.prompt}/1K • ${model.pricing.completion}/1K
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </DashboardCard>

          {/* --- GROWTH TRENDS - Enhanced List Item --- */}
          <DashboardCard title="Growth Trends" icon={<TrendingUp className="text-green-500" size={24} />}>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredData.length === 0 ? (
                 <p className={`text-center py-8 ${mutedTextColor}`}>
                   No trend data available
                 </p>
              ) : (
                filteredData
                  .sort((a, b) => (b.trend || 0) - (a.trend || 0)) // Keep sorting logic
                  .map((model) => (
                     // --- Keep Existing List Item Structure & Logic ---
                    <div
                      key={model.id}
                       className={`p-4 rounded-xl transition-all duration-300 cursor-pointer border group ${
                        hoveredModel === model.id
                          ? theme === "dark" ? "bg-gray-700/50 scale-[1.02] border-purple-500/30 shadow-xl" : "bg-gray-100/50 scale-[1.02] border-purple-400/30 shadow-xl"
                          : theme === "dark" ? "bg-gray-700/30 hover:bg-gray-700/40 border-gray-600/20" : "bg-gray-100/30 hover:bg-gray-100/40 border-gray-200/20"
                      }`}
                      onMouseEnter={() => setHoveredModel(model.id)}
                      onMouseLeave={() => setHoveredModel(null)}
                      onClick={() => handleModelClick(model.id)}
                    >
                      <div className="flex items-center justify-between">
                         {/* --- Left side: Name and Provider --- */}
                        <div className="flex-1 mr-4 overflow-hidden"> {/* Added flex-1 and overflow */}
                          <span className={`font-medium transition-colors duration-300 ${textColor} truncate block`}> {/* Added truncate */}
                            {model.name}
                          </span>
                          <p className={`text-xs mt-1 ${mutedTextColor} truncate block`}> {/* Added truncate */}
                            {model.provider}
                          </p>
                        </div>
                        {/* --- Right side: Mini Bar Chart and Text --- */}
                        <div className="flex items-center gap-3 w-1/3 flex-shrink-0"> {/* Added flex-shrink-0 */}
                          {/* --- NEW: Mini Horizontal Bar --- */}
                           <div className="flex-1 h-[16px]"> {/* Use fixed height */}
                            <ResponsiveContainer width="100%" height="100%">
                               <BarChart layout="vertical" data={[{ trend: model.trend || 0, name: model.name }]}>
                                {/* Adjust domain for better visualization of negative/positive */}
                                {/*<XAxis type="number" domain={['auto', 'auto']} hide /> */}
                                <XAxis 
                                       type="number" 
                                       domain={[
                                       (dataMin: number) => Math.min(dataMin, 0), 
                                       (dataMax: number) => Math.max(dataMax, 0)
                                      ]} 
                                     hide 
                                />
                                <Bar dataKey="trend" barSize={10} radius={[4, 4, 4, 4]} isAnimationActive={false}>
                                  <Cell fill={model.trend > 0 ? '#10B981' : '#EF4444'} />
                                </Bar>
                                <Tooltip content={<MiniTooltip />} cursor={false} position={{ x: 0, y: -25 }}/> {/* Adjust position */}
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                          {/* --- End Mini Bar --- */}
                          <span className={`text-sm font-semibold w-12 text-right ${model.trend > 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {model.trend > 0 ? '+' : ''}{model.trend}%
                          </span>
                           {hoveredModel === model.id && (
                            <ExternalLink size={16} className="text-pink-500 group-hover:scale-110 transition-transform" />
                          )}
                        </div>
                      </div>
                       {/* Trend Description (Keep as before) */}
                      {hoveredModel === model.id && (
                        <div className={`mt-2 text-xs ${mutedTextColor}`}>
                           {model.trend > 15 ? '🚀 Rapidly growing' :
                           model.trend > 5 ? '📈 Steady growth' :
                           model.trend >= 0 ? '➡️ Stable' :
                           '📉 Declining usage'}
                        </div>
                      )}
                    </div>
                  ))
              )}
            </div>
          </DashboardCard>
        </div>
      )}

      {/* Enhanced Performance Metrics */}
      {/* --- NO CHANGE TO THIS SECTION --- */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <DashboardCard title="Most Active" icon={<Zap className="text-yellow-500" size={28} />}>
          <div className="text-center">
            <p className="text-xl font-bold text-yellow-500 mb-1">
              {filteredData.reduce(
                (max, model) => (model.usage > (max?.usage || 0) ? model : max),
                filteredData[0]
              )?.name || "N/A"}
            </p>
            <p className={`text-sm ${mutedTextColor}`}>
              {filteredData.reduce((max, model) => (model.usage > (max?.usage || 0) ? model : max), filteredData[0])?.usage || 0}% usage rate
            </p>
          </div>
        </DashboardCard>
{/* ... other cards ... */}
        <DashboardCard title="Fastest Growing" icon={<TrendingUp className="text-green-500" size={28} />}>
          <div className="text-center">
            <p className="text-xl font-bold text-green-500 mb-1">
              {filteredData.reduce(
                (max, model) => (model.trend > (max?.trend || -100) ? model : max),
                filteredData[0]
              )?.name || "N/A"}
            </p>
            <p className={`text-sm ${mutedTextColor}`}>
              +{filteredData.reduce((max, model) => (model.trend > (max?.trend || -100) ? model : max), filteredData[0])?.trend || 0}% this week
            </p>
          </div>
        </DashboardCard>

        <DashboardCard title="Total Categories" icon={<Users className="text-blue-500" size={28} />}>
          <div className="text-center">
            <p className="text-xl font-bold text-blue-500 mb-1">
              {categoriesWithCounts.filter(c => c.id !== 'all' && c.count > 0).length}
            </p>
            <p className={`text-sm ${mutedTextColor}`}>
              Active categories
            </p>
          </div>
        </DashboardCard>

        <DashboardCard title="Avg. Performance" icon={<BarChart3 className="text-purple-500" size={28} />}>
          <div className="text-center">
            {/* Added check for filteredData.length to avoid division by zero */}
            <p className="text-xl font-bold text-purple-500 mb-1">
              {filteredData.length > 0 
                ? (filteredData.reduce((sum, m) => sum + (m.usage || 0), 0) / filteredData.length).toFixed(1) 
                : '0.0'}%
            </p>
            <p className={`text-sm ${mutedTextColor}`}>
              Average usage
            </p>
          </div>
        </DashboardCard>
      </div>


      {/* Market Insights */}
       {/* --- CATEGORY BREAKDOWN - Enhanced List Item --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* --- Top Performers / Growth Leaders (NO CHANGE) --- */}
        <DashboardCard title="Top Performers" icon={<Zap className="text-yellow-500" size={24} />}>
         <div className="space-y-3">
            {filteredData
              .sort((a, b) => (b.usage || 0) - (a.usage || 0))
              .slice(0, 5)
              .map((model, index) => (
                <div key={model.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      index === 0 ? 'bg-yellow-500 text-white' :
                      index === 1 ? 'bg-gray-400 text-white' :
                      index === 2 ? 'bg-orange-500 text-white' :
                      theme === 'dark' ? 'bg-gray-600 text-gray-300' : 'bg-gray-300 text-gray-700'
                    }`}>
                      {index + 1}
                    </span>
                    <span className={`text-sm font-medium ${textColor}`}>
                      {model.name}
                    </span>
                  </div>
                  <span className="text-sm font-semibold" style={{ color: model.color }}>
                    {model.usage}%
                  </span>
                </div>
              ))}
          </div>
        </DashboardCard>
        <DashboardCard title="Growth Leaders" icon={<TrendingUp className="text-green-500" size={24} />}>
          <div className="space-y-3">
            {filteredData
              .sort((a, b) => (b.trend || 0) - (a.trend || 0))
              .slice(0, 5)
              .map((model, index) => (
                <div key={model.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      model.trend > 15 ? 'bg-green-500 text-white' :
                      model.trend > 5 ? 'bg-yellow-500 text-white' :
                      theme === 'dark' ? 'bg-gray-600 text-gray-300' : 'bg-gray-300 text-gray-700'
                    }`}>
                      {index + 1}
                    </span>
                    <span className={`text-sm font-medium ${textColor}`}>
                      {model.name}
                    </span>
                  </div>
                  <span className={`text-sm font-semibold ${
                    model.trend > 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {model.trend > 0 ? '+' : ''}{model.trend}%
                  </span>
                </div>
              ))}
          </div>
        </DashboardCard>

        <DashboardCard title="Category Breakdown" icon={<BarChart3 className="text-purple-500" size={24} />}>
          <div className="space-y-4"> {/* Increased spacing */}
            {categoriesWithCounts
              .filter(cat => cat.id !== 'all' && cat.count > 0)
              .sort((a, b) => b.count - a.count)
              .map((category, index) => {
                // Ensure llmData.length is not zero before dividing
                const totalModels = llmData.length > 0 ? llmData.length : 1; 
                const percentage = (category.count / totalModels) * 100;
                // Data for the colored slice
                const pieChartData = [{ name: category.name, value: percentage, fill: COLORS[index % COLORS.length] }];
                // Data for the background gray slice
                const backgroundData = [{ name: 'background', value: 100 - percentage, fill: chartBgColor }]; 

                return (
                  <div key={category.id} className="flex items-center gap-3">
                     {/* --- NEW: Mini Pie Chart Slice --- */}
                     <div className="w-[32px] h-[32px] flex-shrink-0"> {/* Use fixed size */}
                       <ResponsiveContainer width="100%" height="100%">
                         <PieChart>
                          {/* Background gray circle */}
                          <Pie 
                            data={[{value: 100}]}
                            dataKey="value" 
                            cx="50%" cy="50%" 
                            innerRadius="60%"
                            outerRadius="100%" 
                            startAngle={90} // Start at top
                            endAngle={450} // Full circle
                            fill={chartBgColor}
                            isAnimationActive={false}
                            stroke="none" // No border for background
                           />
                           {/* Colored slice representing percentage */}
                           <Pie 
                            data={pieChartData} 
                            dataKey="value" 
                            cx="50%" cy="50%" 
                            innerRadius="60%" // Makes it a donut
                            outerRadius="100%" 
                            startAngle={90} // Start at top
                            endAngle={90 + (percentage * 3.6)} // Calculate end angle based on percentage
                            isAnimationActive={false}
                            stroke="none" // No border for foreground
                           >
                              {/* Apply fill from pieChartData */}
                              {pieChartData.map((entry, idx) => (
                                <Cell key={`cell-${idx}`} fill={entry.fill} />
                              ))}
                           </Pie>
                         </PieChart>
                       </ResponsiveContainer>
                     </div>
                     {/* --- End Mini Pie --- */}
                    <div className="flex-grow overflow-hidden"> {/* Added overflow */}
                      <div className="flex items-center justify-between text-sm">
                        <span className={`font-medium ${textColor} truncate`}> {/* Added truncate */}
                          {category.name}
                        </span>
                        <span className={`font-semibold ${theme === 'dark' ? 'text-purple-300' : 'text-purple-700'} flex-shrink-0 ml-2`}> {/* Added shrink/margin */}
                          {category.count} ({percentage.toFixed(0)}%)
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </DashboardCard>
      </div>

      {/* Data Source Attribution */}
       {/* --- NO CHANGE TO THIS SECTION --- */}
      <div className={`text-center text-xs ${mutedTextColor}`}>
        Data sources: OpenRouter API • Last updated: {lastUpdated?.toLocaleString() || 'Unknown'}
      </div>
    </div>
  );
}
