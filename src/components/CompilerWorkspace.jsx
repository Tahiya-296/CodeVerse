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
  const [hasAttemptedRun, setHasAttemptedRun] = useState(false)

  const updateDraft = useCallback((value) => {
    setDrafts((previous) => ({ ...previous, [language]: value ?? '' }))
  }, [language])

  function handleRun() {
    setHasAttemptedRun(true)
  }

  return (
    <section className="workspace" aria-label="Compiler workspace">
      <div className="workspace-toolbar">
        <button className="run-button" type="button" onClick={handleRun} aria-describedby="execution-status">
          Run
        </button>
        <p id="execution-status" role="status">
          Execution service not connected.
          {hasAttemptedRun && ' No code was run.'}
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
            <p>No output yet.</p>
          </section>

          <section className="workspace-panel" aria-labelledby="error-title">
            <h2 className="workspace-panel-title" id="error-title">Error</h2>
            <p>No error results yet.</p>
          </section>
        </div>
      </div>
    </section>
  )
}
