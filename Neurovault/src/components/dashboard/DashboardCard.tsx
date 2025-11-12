// components/dashboard/DashboardCard.tsx
import { ReactNode } from "react";
import { useTheme } from "../../hooks/useTheme";

interface DashboardCardProps {
  title?: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'minimal' | 'gradient';
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  loading?: boolean;
}

export const DashboardCard = ({
  title,
  icon,
  children,
  className = "",
  variant = 'default',
  size = 'md',
  interactive = false,
  loading = false,
}: DashboardCardProps) => {
  const { theme } = useTheme();

  const sizeClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  const getVariantClasses = () => {
    const baseClasses = "rounded-2xl border transition-all duration-300";
    
    switch (variant) {
      case 'elevated':
        return `${baseClasses} shadow-xl backdrop-blur-sm ${
          theme === "dark"
            ? "bg-gradient-to-br from-gray-800/40 to-gray-900/60 border-gray-600/40 hover:from-gray-800/60 hover:to-gray-900/80"
            : "bg-gradient-to-br from-white/40 to-gray-50/60 border-gray-200/40 hover:from-white/60 hover:to-gray-50/80"
        }`;
      
      case 'gradient':
        return `${baseClasses} shadow-lg backdrop-blur-sm border-transparent ${
          theme === "dark"
            ? "bg-gradient-to-br from-purple-900/30 via-gray-800/50 to-pink-900/30 hover:from-purple-900/40 hover:via-gray-800/60 hover:to-pink-900/40"
            : "bg-gradient-to-br from-purple-50/80 via-white/60 to-pink-50/80 hover:from-purple-100/90 hover:via-white/70 hover:to-pink-100/90"
        }`;
      
      case 'minimal':
        return `${baseClasses} ${
          theme === "dark"
            ? "bg-gray-800/20 border-gray-700/20 hover:bg-gray-800/30"
            : "bg-white/20 border-gray-200/20 hover:bg-white/30"
        }`;
      
      default:
        return `${baseClasses} shadow-lg backdrop-blur-sm ${
          theme === "dark"
            ? "bg-gray-800/30 border-gray-600/30 hover:bg-gray-800/40 hover:border-gray-600/40"
            : "bg-white/30 border-gray-200/30 hover:bg-white/40 hover:border-gray-200/40"
        }`;
    }
  };

  const interactiveClasses = interactive 
    ? "cursor-pointer transform hover:scale-[1.02] active:scale-[0.98]" 
    : "";

  const loadingOverlay = loading && (
    <div className="absolute inset-0 bg-black/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        <span className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
          Loading...
        </span>
      </div>
    </div>
  );

  return (
    <div
      className={`
        ${sizeClasses[size]}
        ${getVariantClasses()}
        ${interactiveClasses}
        ${className}
        relative overflow-hidden
      `}
    >
      {/* Header Section */}
      {(title || icon) && (
        <div className="flex items-center gap-3 mb-6">
          {icon && (
            <div className={`flex items-center justify-center rounded-lg transition-all duration-300 ${
              size === 'sm' ? 'p-1.5' : size === 'lg' ? 'p-3' : 'p-2'
            } ${
              variant === 'gradient' 
                ? theme === "dark" 
                  ? "bg-white/10 backdrop-blur-sm" 
                  : "bg-black/5 backdrop-blur-sm"
                : theme === "dark" 
                  ? "bg-purple-500/20 hover:bg-purple-500/30" 
                  : "bg-purple-500/10 hover:bg-purple-500/20"
            }`}>
              {icon}
            </div>
          )}
          {title && (
            <div className="flex-1">
              <h3 className={`font-semibold text-transparent bg-clip-text transition-all duration-300 ${
                size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-2xl' : 'text-xl'
              }`} style={{
                backgroundImage: variant === 'gradient'
                  ? theme === "dark"
                    ? "linear-gradient(135deg, #a855f7, #ec4899, #06b6d4)"
                    : "linear-gradient(135deg, #9333ea, #db2777, #0284c7)"
                  : theme === "dark"
                    ? "linear-gradient(to right, #22d3ee, #a855f7)"
                    : "linear-gradient(to right, #9333ea, #db2777)"
              }}>
                {title}
              </h3>
            </div>
          )}
        </div>
      )}

      {/* Content Section */}
      <div className={`transition-colors duration-300 ${
        theme === "dark" ? "text-gray-100" : "text-gray-900"
      } ${loading ? 'opacity-50' : ''}`}>
        {children}
      </div>

      {/* Decorative Elements */}
      {variant === 'gradient' && (
        <>
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-purple-500/10 to-transparent rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-pink-500/10 to-transparent rounded-full blur-xl"></div>
        </>
      )}

      {/* Loading Overlay */}
      {loadingOverlay}

      {/* Hover Effect Border */}
      {interactive && (
        <div className={`absolute inset-0 rounded-2xl opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none ${
          theme === "dark" 
            ? "bg-gradient-to-br from-purple-500/10 via-transparent to-pink-500/10" 
            : "bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5"
        }`}></div>
      )}
    </div>
  );
};