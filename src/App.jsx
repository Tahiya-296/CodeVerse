import { useEffect, useState } from 'react'
import { AppHeader } from './components/AppHeader'
import { CompilerWorkspace } from './components/CompilerWorkspace'

function App() {
  const [theme, setTheme] = useState(() => {
    return window.localStorage.getItem('codeverse-theme') === 'light' ? 'light' : 'dark'
  })

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.documentElement.style.colorScheme = theme
    window.localStorage.setItem('codeverse-theme', theme)
  }, [theme])

  return (
    <div className="site-shell" data-theme={theme}>
      <AppHeader theme={theme} onToggleTheme={() => setTheme((current) => current === 'dark' ? 'light' : 'dark')} />

      <main className="hero">
        <div className="hero-copy">
          <p className="eyebrow"><span className="status-dot" /> YOUR NEXT IDEA STARTS HERE</p>
          <h1>Code, in your <span>universe.</span></h1>
          <p className="intro">
            A focused space to write and explore code in C, C++, and Java.
          </p>
        </div>

        <CompilerWorkspace theme={theme} />
      </main>

      <footer className="site-footer">
        <span>CODEVERSE</span>
        <span>Made for curious minds <b aria-hidden="true">✳</b></span>
      </footer>
    </div>
  )
}

export default App
