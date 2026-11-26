export function ErrorDisplay({ compilationError, runtimeError }) {
  return (
    <section className="workspace-panel error-panel" aria-labelledby="error-title">
      <h2 className="workspace-panel-title" id="error-title">Errors</h2>
      <div className="error-result" aria-live="polite">
        <h3>Compilation</h3>
        {compilationError
          ? <pre>{compilationError}</pre>
          : <p className="empty-result">No compilation errors.</p>}
      </div>
      <div className="error-result" aria-live="polite">
        <h3>Runtime</h3>
        {runtimeError
          ? <pre>{runtimeError}</pre>
          : <p className="empty-result">No runtime errors.</p>}
      </div>
    </section>
  )
}
