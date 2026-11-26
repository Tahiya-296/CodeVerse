const statusLabels = {
  idle: 'Execution service not connected.',
  running: 'Running code…',
  success: 'Execution completed.',
  'compile-error': 'Compilation failed.',
  'runtime-error': 'Program stopped with a runtime error.',
  unavailable: 'Execution service not connected. No code was run.',
  error: 'Execution could not be completed.',
}

export function ExecutionStatus({ status }) {
  const label = statusLabels[status] ?? statusLabels.error

  return (
    <p id="execution-status" className={`execution-status execution-status--${status}`} role="status" aria-live="polite">
      {status === 'running' && <span className="loading-spinner" aria-hidden="true" />}
      {label}
    </p>
  )
}
