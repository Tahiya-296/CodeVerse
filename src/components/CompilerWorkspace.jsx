import { useState } from 'react'
import { CodeEditor } from './CodeEditor'

export function CompilerWorkspace() {
  const [input, setInput] = useState('')
  const [execution, setExecution] = useState({
    status: 'idle',
    output: '',
    error: '',
  })

  function handleRun() {
    setExecution({ status: 'unavailable', output: '', error: '' })
  }

  return (
    <section className="workspace" aria-label="Compiler workspace">
      <div className="workspace-toolbar">
        <button className="run-button" type="button" onClick={handleRun} aria-describedby="execution-status">
          Run
        </button>
        <p id="execution-status" role="status">
          Execution service not connected.
          {execution.status === 'unavailable' && ' No code was run.'}
        </p>
      </div>

      <div className="workspace-grid">
        <CodeEditor />

        <div className="workspace-panels">
          <div className="workspace-panel">
            <label className="workspace-panel-title" htmlFor="standard-input">Standard Input</label>
            <textarea
              id="standard-input"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              rows={3}
              spellCheck={false}
            />
          </div>

          <section className="workspace-panel" aria-labelledby="output-title">
            <h2 className="workspace-panel-title" id="output-title">Output</h2>
            {execution.output ? <pre>{execution.output}</pre> : <p>No output yet.</p>}
          </section>

          <section className="workspace-panel" aria-labelledby="error-title">
            <h2 className="workspace-panel-title" id="error-title">Error</h2>
            {execution.error ? <pre>{execution.error}</pre> : <p>No error results yet.</p>}
          </section>
        </div>
      </div>
    </section>
  )
}
