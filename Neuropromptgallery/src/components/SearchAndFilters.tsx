import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { useState } from "react";
import React from "react";

// Typed SVG icon components
const SearchIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <circle cx="11" cy="11" r="8"/>
    <path d="M21 21l-4.35-4.35"/>
  </svg>
);

const FilterIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46"/>
  </svg>
);

const XIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

interface Category {
  id: string;
  name: string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>; // typed here too
  color: string;
}

interface SearchAndFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  categories: Category[];
  resultCount: number;
}

export function SearchAndFilters({
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  categories,
  resultCount
}: SearchAndFiltersProps) {
  const [showAllCategories, setShowAllCategories] = useState(false);
  const displayedCategories = showAllCategories ? categories : categories.slice(0, 6);

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
  };

  const hasActiveFilters = searchTerm || selectedCategory !== "all";

  return (
    <div className="mb-8 space-y-6">
      {/* Search Bar */}
      <div className="relative max-w-2xl mx-auto">
        <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <Input
          type="text"
          placeholder="Search prompts, tags, or use cases..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-12 pr-4 py-3 bg-gray-900/50 border-gray-700 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500/20 rounded-xl text-lg"
        />
        {searchTerm && (
          <Button
            onClick={() => setSearchTerm("")}
            variant="ghost"
            size="sm"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
          >
            <XIcon className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Category Filters */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FilterIcon className="w-5 h-5 text-purple-400" />
            <span className="text-lg font-medium text-white">Categories</span>
            <Badge variant="secondary" className="bg-purple-500/20 text-purple-300">
              {resultCount} results
            </Badge>
          </div>
          
          {hasActiveFilters && (
            <Button
              onClick={clearFilters}
              variant="outline"
              size="sm"
              className="border-red-500/50 text-red-400 hover:bg-red-500/10"
            >
              <XIcon className="w-4 h-4 mr-1" />
              Clear all
            </Button>
          )}
        </div>

        <div className="flex flex-wrap gap-3">
          {displayedCategories.map((category) => {
            const Icon = category.icon;
            const isSelected = selectedCategory === category.id;
            return (
              <Button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                variant={isSelected ? "default" : "outline"}
                className={`
                  flex items-center gap-2 transition-all duration-200
                  ${isSelected 
                    ? `bg-gradient-to-r ${category.color} text-white shadow-lg scale-105` 
                    : 'border-gray-600 text-gray-300 hover:border-purple-500 hover:text-purple-300 hover:bg-purple-500/10'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                <span>{category.name}</span>
                {isSelected && category.id !== 'all' && (
                  <XIcon className="w-3 h-3 ml-1" />
                )}
              </Button>
            );
          })}
          
          {categories.length > 6 && (
            <Button
              onClick={() => setShowAllCategories(!showAllCategories)}
              variant="ghost"
              className="text-purple-400 hover:text-purple-300 hover:bg-purple-500/10"
            >
              {showAllCategories ? 'Show less' : `+${categories.length - 6} more`}
            </Button>
          )}
        </div>
      </div>

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-400">Active filters:</span>
          {searchTerm && (
            <Badge variant="secondary" className="bg-blue-500/20 text-blue-300">
              Search: "{searchTerm}"
            </Badge>
          )}
          {selectedCategory !== "all" && (
            <Badge variant="secondary" className="bg-green-500/20 text-green-300">
              {categories.find(c => c.id === selectedCategory)?.name}
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
