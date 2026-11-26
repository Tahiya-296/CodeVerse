import { useState } from 'react'
import { CodeEditor } from './CodeEditor'
import { ErrorDisplay } from './ErrorDisplay'
import { ExecutionStatus } from './ExecutionStatus'
import { OutputConsole } from './OutputConsole'
import { StdinPanel } from './StdinPanel'

export function CompilerWorkspace({ theme = 'dark' }) {
  const [input, setInput] = useState('')
  const [execution, setExecution] = useState({
    status: 'idle',
    output: '',
    compilationError: '',
    runtimeError: '',
  })

  function handleRun() {
    setExecution({ status: 'unavailable', output: '', compilationError: '', runtimeError: '' })
  }

  return (
    <section className="workspace" aria-label="Compiler workspace">
      <div className="workspace-toolbar">
        <button className="run-button" type="button" onClick={handleRun} aria-describedby="execution-status">
          Run
        </button>
        <ExecutionStatus status={execution.status} />
      </div>

      <div className="workspace-grid">
        <CodeEditor theme={theme} />

        <div className="workspace-panels">
          <StdinPanel value={input} onChange={setInput} />
          <OutputConsole output={execution.output} />
          <ErrorDisplay
            compilationError={execution.compilationError}
            runtimeError={execution.runtimeError}
          />
        </div>
      </div>
    </section>
  )
}
