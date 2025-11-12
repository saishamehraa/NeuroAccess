'use client';
import Image from 'next/image';
import Link from 'next/link';
import GithubStar from '@/components/app/GithubStar';
import ThemeToggle from '@/components/ThemeToggle';
import CustomModels from '@/components/modals/CustomModels';
import Settings from '@/components/app/Settings';
import AuthButton from '@/components/auth/AuthButton';
import { Layers, Home, Menu as MenuIcon, ArrowLeft } from 'lucide-react';
import { APP_URLS } from '@/utils/urls';

type Props = {
  onOpenMenu: () => void;
  title?: string;
  githubOwner: string;
  githubRepo: string;
  className?: string;
  onOpenModelsModal?: () => void;
  showCompareButton?: boolean;
  hideHomeButton?: boolean;
};

export default function HeaderBar({
  onOpenMenu,
  title = 'NeuroAIComparison',
  githubOwner,
  githubRepo,
  className,
  onOpenModelsModal,
  showCompareButton = true,
  hideHomeButton = false,
}: Props) {
  return (
    <div className={['flex items-center mb-3 gap-2 w-full', className || ''].join(' ')}>
      {/* Left: menu + optional Compare button */}
      <div className="flex items-center gap-2 min-w-0">
        <button
          onClick={onOpenMenu}
          className="lg:hidden inline-flex items-center justify-center h-9 w-9 rounded-xl
            bg-gradient-to-r from-white/12 to-white/8 border border-white/15 text-white hover:from-white/18 hover:to-white/12 hover:border-white/25 backdrop-blur-sm shadow-lg transition-all duration-200 hover:scale-105 active:scale-95"
          aria-label="Open menu"
          title="Menu"
        >
          <MenuIcon size={18} />
        </button>

        <a
          href = {`${APP_URLS.neurovault}dashboard/`}
          className="inline-flex items-center justify-center h-9 w-9 rounded-xl
            bg-gradient-to-r from-white/12 to-white/8 border border-white/15 text-white hover:from-white/18 hover:to-white/12 hover:border-white/25 backdrop-blur-sm shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 shrink-0"
          aria-label="Back to Dashboard"
          title="Back to Dashboard"
        >
          <ArrowLeft size={18} />
        </a>

        {showCompareButton && (
          <Link
            href="/compare"
            prefetch={true}
            className="inline-block ml-1 font-medium overflow-hidden relative px-2.5 py-1.5 rounded-md text-xs border accent-action-fill accent-focus"
          >
            <span className="absolute -top-[150%] left-0 inline-flex w-48 h-[3px] rounded-md opacity-40 group-hover:top-[150%] duration-500" style={{background:'var(--accent-interactive-primary)', boxShadow:'0 0 10px 10px rgba(0,0,0,0.3)'}}></span>
            Compare Models
          </Link>
        )}
      </div>

      {/* Center: title stays centered in available space (hidden on mobile) */}
      <div className="flex-1 text-center hidden sm:block">
        <h1 className="text-xl md:text-2xl font-extrabold tracking-tight bg-gradient-to-r from-black via-black/90 to-black/70 dark:from-white dark:via-white/90 dark:to-white/70 bg-clip-text text-transparent drop-shadow-[0_1px_0_rgba(0,0,0,0.12)] dark:drop-shadow-[0_1px_0_rgba(255,255,255,0.12)] select-none pointer-events-none">
          {title}
        </h1>
      </div>

      {/* Right cluster */}
      <div className="flex items-center gap-2 z-10 ml-auto">
        {!hideHomeButton && (
          <Link
            href="/"
            className="inline-flex items-center justify-center h-9 w-9 rounded-xl
              bg-gradient-to-r from-white/12 to-white/8 border border-white/15 text-white hover:from-white/18 hover:to-white/12 hover:border-white/25 backdrop-blur-sm shadow-lg transition-all duration-200 hover:scale-105 active:scale-95"
            aria-label="Go to home"
            title="Home"
          >
            <Home size={18} />
          </Link>
        )}
        <button
          onClick={() => onOpenModelsModal && onOpenModelsModal()}
          className="inline-flex items-center gap-1.5 text-xs h-9 w-9 justify-center rounded-md border border-black/15 dark:border-white/15 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 shadow accent-focus"
          title="Change models"
          aria-label="Change models"
        >
          <Layers size={14} />
        </button>

        <CustomModels compact />
        <ThemeToggle compact />
        <Settings compact />
       {/* <AuthButton /> */}
        <GithubStar owner={githubOwner} repo={githubRepo} />
      </div>
    </div>
  );
}
