export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-800 bg-slate-950/40 py-6 text-center text-xs text-slate-500">
      <div className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-4">
        <span>&copy; {currentYear} VideoOptima.</span>

        <span className="hidden md:inline text-slate-700">•</span>

        <span>
          Built by{" "}
          <a
            href="https://jeanpaulflores.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-400 hover:text-indigo-400 transition-colors font-medium"
          >
            Jean Paul Flores
          </a>
        </span>

        <span className="hidden md:inline text-slate-700">•</span>

        <a
          href="https://github.com/jpmimo1/video-optimizer"
          target="_blank"
          rel="noopener noreferrer"
          className="text-slate-400 hover:text-indigo-400 transition-colors flex items-center gap-1"
        >
          View Source Code
        </a>
      </div>
    </footer>
  );
}
