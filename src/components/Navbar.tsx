import React from 'react';

interface NavbarProps {
  onSignInClick: () => void;
  userEmail?: string | null;
  onSignOut?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onSignInClick,
  userEmail,
  onSignOut,
}) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-6 md:px-10 py-5 pointer-events-none">
      {/* Top Left Sparkle icon */}
      <div className="pointer-events-auto flex items-center gap-2">
        <span className="text-xl text-neutral-800 select-none">✦</span>
      </div>

      {/* Top Right Sign In */}
      <div className="pointer-events-auto flex items-center gap-3">
        {userEmail ? (
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-neutral-100 text-neutral-800 border border-neutral-200 truncate max-w-[140px]">
              {userEmail.split('@')[0]}
            </span>
            <button
              onClick={onSignOut}
              className="text-xs font-semibold px-3 py-1.5 rounded-full bg-neutral-900 text-white hover:bg-neutral-800 transition-colors"
            >
              Exit
            </button>
          </div>
        ) : (
          <button
            id="nav-signin-button"
            onClick={onSignInClick}
            className="px-4 py-1.5 text-xs sm:text-sm font-semibold rounded-full bg-white text-neutral-800 border border-neutral-200/90 shadow-sm hover:shadow hover:bg-neutral-50 active:scale-95 transition-all"
          >
            Sign In
          </button>
        )}
      </div>
    </header>
  );
};
