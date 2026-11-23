import { AppHeader } from './components/AppHeader'

const languages = ['C', 'C++', 'Java']

function App() {
  return (
    <div className="site-shell">
      <AppHeader />

      <main className="hero">
        <div className="hero-copy">
          <p className="eyebrow"><span className="status-dot" /> YOUR NEXT IDEA STARTS HERE</p>
          <h1>Code, in your <span>universe.</span></h1>
          <p className="intro">
            A focused space to write, explore, and bring your ideas to life.
            Your coding workspace is taking shape.
          </p>
          <div className="language-list" aria-label="Planned language support">
            {languages.map((language) => <span className="language-chip" key={language}>{language}</span>)}
          </div>
          <p className="coming-soon">Your workspace is coming soon</p>
        </div>

        <div className="preview-card" aria-label="CodeVerse workspace preview">
          <div className="preview-topbar">
            <div className="window-dots" aria-hidden="true"><i /><i /><i /></div>
            <span className="preview-file">welcome.cpp</span>
            <span className="preview-language">C++</span>
          </div>
          <div className="preview-editor" aria-hidden="true">
            <div><span className="line-number">1</span><code><span className="code-purple">#include</span> <span className="code-green">&lt;iostream&gt;</span></code></div>
            <div><span className="line-number">2</span><code /></div>
            <div><span className="line-number">3</span><code><span className="code-blue">int</span> main() {'{'}</code></div>
            <div><span className="line-number">4</span><code className="indent"><span className="code-blue">std::cout</span> &lt;&lt; <span className="code-yellow">"Hello, CodeVerse!"</span>;</code></div>
            <div><span className="line-number">5</span><code className="indent"><span className="code-purple">return</span> 0;</code></div>
            <div><span className="line-number">6</span><code>{'}'}</code></div>
          </div>
          <div className="preview-footer"><span><i className="status-dot" /> Ready for your next idea</span><span>Ln 1, Col 1</span></div>
        </div>
      </main>

      <footer className="site-footer">
        <span>CODEVERSE</span>
        <span>Made for curious minds <b aria-hidden="true">✳</b></span>
      </footer>
    </div>
  )
}

export default App
