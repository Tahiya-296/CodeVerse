import { createSubmission, Judge0Error } from '../member-2/services/judge0Service.js'
import { MAX_BODY_BYTES, validateExecuteRequest } from '../member-2/utils/validation.js'

function sendError(res, httpStatus, code, message) {
  return res.status(httpStatus).json({ success: false, status: 'Error', error: { code, message } })
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return sendError(res, 405, 'METHOD_NOT_ALLOWED', 'Use POST for code execution.')
  }

  if (!req.headers['content-type']?.toLowerCase().includes('application/json')) {
    return sendError(res, 415, 'INVALID_CONTENT_TYPE', 'Content-Type must be application/json.')
  }

  const contentLength = Number(req.headers['content-length'] || 0)
  if (contentLength > MAX_BODY_BYTES) return sendError(res, 413, 'REQUEST_TOO_LARGE', 'Request body exceeds the allowed size.')

  const validation = validateExecuteRequest(req.body)
  if (validation.code) {
    const status = validation.code === 'SOURCE_TOO_LARGE' || validation.code === 'INPUT_TOO_LARGE' ? 413 : 400
    return sendError(res, status, validation.code, validation.message)
  }

  try {
    const { token } = await createSubmission(validation.value)
    return res.status(202).json({ success: true, token, status: 'Processing' })
  } catch (error) {
    if (error instanceof Judge0Error) return sendError(res, error.httpStatus, error.code, error.message)
    return sendError(res, 502, 'JUDGE0_UNAVAILABLE', 'Could not submit code to Judge0.')
  }
}
