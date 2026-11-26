export function OutputConsole({ output }) {
  return (
    <section className="workspace-panel output-panel" aria-labelledby="output-title">
      <div className="result-heading">
        <h2 className="workspace-panel-title" id="output-title">Output</h2>
        <span className="panel-hint">stdout</span>
      </div>
      {output ? <pre>{output}</pre> : <p className="empty-result">Program output will appear here.</p>}
    </section>
  )
}
