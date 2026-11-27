export const MAX_SOURCE_CODE_BYTES = 100 * 1024
export const MAX_STDIN_BYTES = 64 * 1024
export const MAX_BODY_BYTES = MAX_SOURCE_CODE_BYTES + MAX_STDIN_BYTES + 16 * 1024

export function validateExecuteRequest(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { code: 'INVALID_REQUEST', message: 'Request body must be a JSON object.' }
  }

  if (typeof body.language !== 'string' || !['c', 'cpp', 'java'].includes(body.language)) {
    return { code: 'INVALID_LANGUAGE', message: 'Unsupported programming language.' }
  }

  if (typeof body.sourceCode !== 'string' || body.sourceCode.trim().length === 0) {
    return { code: 'SOURCE_REQUIRED', message: 'Source code must be a non-empty string.' }
  }

  if (Buffer.byteLength(body.sourceCode, 'utf8') > MAX_SOURCE_CODE_BYTES) {
    return { code: 'SOURCE_TOO_LARGE', message: 'Source code exceeds the 100 KB limit.' }
  }

  if (body.input !== undefined && typeof body.input !== 'string') {
    return { code: 'INVALID_REQUEST', message: 'Input must be a string.' }
  }

  const input = body.input ?? ''
  if (Buffer.byteLength(input, 'utf8') > MAX_STDIN_BYTES) {
    return { code: 'INPUT_TOO_LARGE', message: 'Standard input exceeds the 64 KB limit.' }
  }

  return { value: { language: body.language, sourceCode: body.sourceCode, input } }
}

export function isValidSubmissionToken(token) {
  return typeof token === 'string' && token.length >= 1 && token.length <= 128 && /^[A-Za-z0-9_-]+$/.test(token)
}
