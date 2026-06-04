import { HomeLogo } from "./HomeLogo";

export default function Header() {
  return (
    <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <HomeLogo />
        <div className="flex items-center gap-4 text-sm text-slate-400">
          <span className="hidden sm:inline">Max file size: 100MB</span>
          {/* <button className="bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-2">
            <UserCircle className="w-4 h-4" /> Sign In
          </button> */}
        </div>
      </div>
    </header>
  );
}
