export function AppHeader({ theme, onToggleTheme }) {
  return (
    <header className="site-header">
      <a className="brand" href="/" aria-label="CodeVerse home">
        <span className="brand-mark" aria-hidden="true">C<span>.</span></span>
        <span>codeverse</span>
      </a>
      <div className="header-actions">
        <span className="header-label"><span className="status-dot" /> ONLINE COMPILER</span>
        <button
          className="theme-toggle"
          type="button"
          onClick={onToggleTheme}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          aria-pressed={theme === 'light'}
        >
          {theme === 'dark' ? 'Light mode' : 'Dark mode'}
        </button>
      </div>
    </header>
  )
}
