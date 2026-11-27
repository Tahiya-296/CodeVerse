import { useCallback, useState } from 'react'
import { CodeEditor } from './CodeEditor'

const starterCode = {
  c: `#include <stdio.h>

int main(void) {
    printf("Hello, CodeVerse!\\n");
    return 0;
}
`,
  cpp: `#include <iostream>

int main() {
    std::cout << "Hello, CodeVerse!" << '\\n';
    return 0;
}
`,
  java: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, CodeVerse!");
    }
}
`,
}

export function CompilerWorkspace() {
  const [language, setLanguage] = useState('cpp')
  const [drafts, setDrafts] = useState(starterCode)
  const [input, setInput] = useState('')
  const [execution, setExecution] = useState({
    status: 'idle',
    output: '',
    error: '',
  })

  const updateDraft = useCallback((value) => {
    setDrafts((previous) => ({ ...previous, [language]: value ?? '' }))
  }, [language])

  function handleRun() {
    runCode()
  }

  async function runCode() {
    if (execution.status === 'processing') return

    setExecution({ status: 'processing', output: '', error: '' })
    try {
      const submissionResponse = await fetch('/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language, sourceCode: drafts[language], input }),
      })
      const submission = await submissionResponse.json()
      if (!submissionResponse.ok || !submission.success) {
        throw new Error(submission.error?.message || 'Could not submit code for execution.')
      }

      const deadline = Date.now() + 60000
      while (Date.now() < deadline) {
        await new Promise((resolve) => setTimeout(resolve, 800))
        const resultResponse = await fetch(`/api/submissions/${encodeURIComponent(submission.token)}`)
        const result = await resultResponse.json()
        if (!resultResponse.ok || !result.success) {
          throw new Error(result.error?.message || 'Could not retrieve the execution result.')
        }

        if (!result.processing) {
          setExecution({
            status: result.status,
            output: result.stdout || '',
            error: [result.compileOutput, result.stderr, result.message].filter(Boolean).join('\n'),
          })
          return
        }
      }

      setExecution({ status: 'timeout', output: '', error: 'Execution is taking longer than expected. Please try again.' })
    } catch (error) {
      setExecution({ status: 'error', output: '', error: error.message || 'Execution request failed.' })
    }
  }

  return (
    <section className="workspace" aria-label="Compiler workspace">
      <div className="workspace-toolbar">
        <button className="run-button" type="button" onClick={handleRun} disabled={execution.status === 'processing'} aria-describedby="execution-status">
          {execution.status === 'processing' ? 'Running…' : 'Run'}
        </button>
        <p id="execution-status" role="status">
          {execution.status === 'processing' ? 'Compiling and running code…' : execution.status === 'idle' ? 'Ready to run.' : execution.status}
        </p>
      </div>

      <div className="workspace-grid">
        <CodeEditor
          language={language}
          sourceCode={drafts[language]}
          onLanguageChange={setLanguage}
          onSourceCodeChange={updateDraft}
        />

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
