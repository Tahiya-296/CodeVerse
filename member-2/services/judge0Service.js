import { getJudge0LanguageId } from '../utils/languageConfig.js'

const REQUEST_TIMEOUT_MS = 8000

export class Judge0Error extends Error {
  constructor(code, message, httpStatus = 502) {
    super(message)
    this.name = 'Judge0Error'
    this.code = code
    this.httpStatus = httpStatus
  }
}

function getConfig(env = process.env) {
  const rawUrl = env.JUDGE0_API_URL
  if (!rawUrl) throw new Judge0Error('JUDGE0_NOT_CONFIGURED', 'Judge0 service is not configured.', 503)

  let baseUrl
  try {
    baseUrl = new URL(rawUrl)
  } catch {
    throw new Judge0Error('JUDGE0_NOT_CONFIGURED', 'Judge0 service URL is invalid.', 503)
  }
  if (baseUrl.protocol !== 'https:' && !(baseUrl.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(baseUrl.hostname))) {
    throw new Judge0Error('JUDGE0_NOT_CONFIGURED', 'Judge0 service URL must use HTTPS.', 503)
  }

  return { baseUrl: baseUrl.toString().replace(/\/+$/, ''), env }
}

function getHeaders(env) {
  const headers = { Accept: 'application/json', 'Content-Type': 'application/json' }
  if (env.JUDGE0_API_KEY) headers['X-RapidAPI-Key'] = env.JUDGE0_API_KEY
  if (env.JUDGE0_API_HOST) headers['X-RapidAPI-Host'] = env.JUDGE0_API_HOST
  return headers
}

async function request(path, options, config = getConfig(), notFoundIsToken = false) {
  let response
  try {
    response = await fetch(`${config.baseUrl}${path}`, {
      ...options,
      headers: { ...getHeaders(config.env), ...options.headers },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    })
  } catch (error) {
    if (error?.name === 'TimeoutError' || error?.name === 'AbortError') {
      throw new Judge0Error('JUDGE0_TIMEOUT', 'Judge0 did not respond before the request timed out.', 504)
    }
    throw new Judge0Error('JUDGE0_UNAVAILABLE', 'Could not connect to Judge0.')
  }

  if (response.status === 404 && notFoundIsToken) throw new Judge0Error('INVALID_TOKEN', 'Submission was not found.', 404)
  if (!response.ok) throw new Judge0Error('JUDGE0_UNAVAILABLE', 'Judge0 could not process the request.')

  try {
    return await response.json()
  } catch {
    throw new Judge0Error('JUDGE0_INVALID_RESPONSE', 'Judge0 returned an invalid response.')
  }
}

export async function createSubmission({ language, sourceCode, input }, env = process.env) {
  const languageId = getJudge0LanguageId(language, env)
  if (!languageId) throw new Judge0Error('JUDGE0_NOT_CONFIGURED', `Judge0 language ID for ${language} is not configured.`, 503)

  const config = getConfig(env)
  const result = await request('/submissions?base64_encoded=false&wait=false', {
    method: 'POST',
    body: JSON.stringify({
      language_id: languageId,
      source_code: sourceCode,
      stdin: input,
      cpu_time_limit: 2,
      wall_time_limit: 5,
      memory_limit: 256000,
    }),
  }, config)

  if (!result || typeof result.token !== 'string' || !/^[A-Za-z0-9_-]{1,128}$/.test(result.token)) {
    throw new Judge0Error('JUDGE0_INVALID_RESPONSE', 'Judge0 returned an invalid submission token.')
  }
  return { token: result.token }
}

export async function getSubmission(token, env = process.env) {
  const config = getConfig(env)
  const result = await request(`/submissions/${encodeURIComponent(token)}?base64_encoded=false`, { method: 'GET' }, config, true)
  if (!result || typeof result !== 'object' || !result.status || typeof result.status.id !== 'number') {
    throw new Judge0Error('JUDGE0_INVALID_RESPONSE', 'Judge0 returned an invalid submission result.')
  }

  const processing = result.status.id === 1 || result.status.id === 2
  return {
    token,
    status: typeof result.status.description === 'string' ? result.status.description : 'Unknown',
    processing,
    stdout: result.stdout ?? null,
    stderr: result.stderr ?? null,
    compileOutput: result.compile_output ?? null,
    message: result.message ?? null,
    executionTime: result.time ?? null,
    memory: result.memory ?? null,
  }
}
