import Editor, { loader } from '@monaco-editor/react'
import * as monaco from 'monaco-editor/editor'
import EditorWorker from 'monaco-editor/editor/editor.worker.js?worker'
import 'monaco-editor/editor/contrib/clipboard/browser/clipboard.js'
import 'monaco-editor/editor/contrib/find/browser/findController.js'
import 'monaco-editor/languages/definitions/cpp/register.js'
import 'monaco-editor/languages/definitions/java/register.js'
import { useCallback, useState } from 'react'

self.MonacoEnvironment = { getWorker: () => new EditorWorker() }
loader.config({ monaco })

const languages = {
  c: { label: 'C', filename: 'welcome.c' },
  cpp: { label: 'C++', filename: 'welcome.cpp' },
  java: { label: 'Java', filename: 'Main.java' },
}

const languageIds = Object.keys(languages)

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

const defineTheme = (monaco) => {
  monaco.editor.defineTheme('codeverse', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'keyword', foreground: 'C89CFF' },
      { token: 'string', foreground: 'E8CE8C' },
      { token: 'comment', foreground: '9C9EAE' },
    ],
    colors: {
      'editor.background': '#171a26',
      'editor.foreground': '#dedce8',
      'editor.lineHighlightBackground': '#222538',
      'editor.selectionBackground': '#473a73',
      'editorLineNumber.foreground': '#9c9eae',
    },
  })
}

const editorOptions = {
  ariaLabel: 'Source code',
  automaticLayout: true,
  fontSize: 13,
  minimap: { enabled: false },
  padding: { top: 14, bottom: 14 },
  scrollBeyondLastLine: false,
  tabSize: 4,
  wordWrap: 'on',
}

export function CodeEditor() {
  const [language, setLanguage] = useState('cpp')
  const [drafts, setDrafts] = useState(starterCode)
  const [cursor, setCursor] = useState({ lineNumber: 1, column: 1 })
  const { filename } = languages[language]

  const updateDraft = useCallback((value) => {
    setDrafts((previous) => ({ ...previous, [language]: value ?? '' }))
  }, [language])

  const trackCursor = (editor) => {
    const updateCursor = () => {
      const position = editor.getPosition()
      if (position) setCursor(position)
    }

    editor.onDidChangeCursorPosition(updateCursor)
    editor.onDidChangeModel(updateCursor)
    updateCursor()
  }

  return (
    <section className="editor-card" aria-label="Code editor">
      <div className="editor-topbar">
        <div className="window-dots" aria-hidden="true"><i /><i /><i /></div>
        <span className="editor-file">{filename}</span>
        <label className="editor-language">
          Language
          <select value={language} onChange={(event) => setLanguage(event.target.value)}>
            {languageIds.map((id) => <option key={id} value={id}>{languages[id].label}</option>)}
          </select>
        </label>
      </div>
      <div className="editor-body">
        <Editor
          path={filename}
          language={language}
          value={drafts[language]}
          onChange={updateDraft}
          beforeMount={defineTheme}
          onMount={trackCursor}
          theme="codeverse"
          loading={<span role="status">Loading editor…</span>}
          options={editorOptions}
        />
      </div>
      <div className="editor-footer">
        <span>Editor only</span>
        <span>Ln {cursor.lineNumber}, Col {cursor.column}</span>
      </div>
    </section>
  )
}
