import { getSubmission, Judge0Error } from '../../member-2/services/judge0Service.js'
import { isValidSubmissionToken } from '../../member-2/utils/validation.js'

function sendError(res, httpStatus, code, message) {
  return res.status(httpStatus).json({ success: false, status: 'Error', error: { code, message } })
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return sendError(res, 405, 'METHOD_NOT_ALLOWED', 'Use GET to retrieve a submission.')
  }

  const token = req.query?.token
  if (!isValidSubmissionToken(token)) return sendError(res, 400, 'INVALID_TOKEN', 'Submission token is invalid.')

  try {
    const result = await getSubmission(token)
    return res.status(200).json({ success: true, ...result })
  } catch (error) {
    if (error instanceof Judge0Error) return sendError(res, error.httpStatus, error.code, error.message)
    return sendError(res, 502, 'JUDGE0_UNAVAILABLE', 'Could not retrieve the Judge0 result.')
  }
}
