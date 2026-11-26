export function StdinPanel({ value, onChange }) {
  return (
    <section className="workspace-panel stdin-panel" aria-labelledby="stdin-title">
      <label className="workspace-panel-title" id="stdin-title" htmlFor="standard-input">
        Standard Input <span className="panel-hint">stdin</span>
      </label>
      <textarea
        id="standard-input"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={4}
        spellCheck={false}
        placeholder="Type input your program should read…"
        aria-describedby="stdin-help"
      />
      <p className="panel-help" id="stdin-help">Input is passed to your program when execution is connected.</p>
    </section>
  )
}
