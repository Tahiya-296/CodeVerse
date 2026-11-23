import { AppHeader } from './components/AppHeader'
import { CodeEditor } from './components/CodeEditor'

function App() {
  return (
    <div className="site-shell">
      <AppHeader />

      <main className="hero">
        <div className="hero-copy">
          <p className="eyebrow"><span className="status-dot" /> YOUR NEXT IDEA STARTS HERE</p>
          <h1>Code, in your <span>universe.</span></h1>
          <p className="intro">
            A focused space to write and explore code in C, C++, and Java.
          </p>
        </div>

        <CodeEditor />
      </main>

      <footer className="site-footer">
        <span>CODEVERSE</span>
        <span>Made for curious minds <b aria-hidden="true">✳</b></span>
      </footer>
    </div>
  )
}

export default App
