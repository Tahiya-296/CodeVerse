import assert from 'node:assert/strict'
import { afterEach, test } from 'node:test'
import executeHandler from '../../api/execute.js'
import submissionHandler from '../../api/submissions/[token].js'
import { createSubmission, getSubmission, Judge0Error } from '../services/judge0Service.js'
import { validateExecuteRequest, isValidSubmissionToken } from '../utils/validation.js'

const originalFetch = globalThis.fetch
const originalEnv = { ...process.env }

afterEach(() => {
  globalThis.fetch = originalFetch
  for (const key of Object.keys(process.env)) {
    if (!(key in originalEnv)) delete process.env[key]
  }
  Object.assign(process.env, originalEnv)
})

function response(status, payload) {
  return { ok: status >= 200 && status < 300, status, json: async () => payload }
}

function mockResponse() {
  return {
    headers: {},
    statusCode: 200,
    setHeader(name, value) { this.headers[name] = value },
    status(code) { this.statusCode = code; return this },
    json(payload) { this.payload = payload; return this },
  }
}

test('request validation accepts the existing frontend contract and defaults stdin', () => {
  assert.deepEqual(validateExecuteRequest({ language: 'cpp', sourceCode: 'int main(){}' }), {
    value: { language: 'cpp', sourceCode: 'int main(){}', input: '' },
  })
})

test('request validation rejects missing source, unknown languages, and oversized input', () => {
  assert.equal(validateExecuteRequest({ language: 'c' }).code, 'SOURCE_REQUIRED')
  assert.equal(validateExecuteRequest({ language: 'python', sourceCode: 'print(1)' }).code, 'INVALID_LANGUAGE')
  assert.equal(validateExecuteRequest({ language: 'c', sourceCode: 'int main(){}', input: 'x'.repeat(65537) }).code, 'INPUT_TOO_LARGE')
})

test('submission token validation rejects malformed tokens', () => {
  assert.equal(isValidSubmissionToken('abc_123-xy'), true)
  assert.equal(isValidSubmissionToken('../other'), false)
  assert.equal(isValidSubmissionToken('x'.repeat(129)), false)
})

test('Judge0 submission uses the configured language ID and stdin', async () => {
  let request
  globalThis.fetch = async (url, options) => {
    request = { url, options }
    return response(201, { token: 'submission_123' })
  }
  const result = await createSubmission({ language: 'cpp', sourceCode: 'int main(){}', input: '42\n' }, {
    JUDGE0_API_URL: 'https://judge.example/api', JUDGE0_API_KEY: 'test-key',
    JUDGE0_API_HOST: 'judge.example', JUDGE0_LANGUAGE_CPP: '54',
  })
  assert.deepEqual(result, { token: 'submission_123' })
  assert.equal(request.url, 'https://judge.example/api/submissions?base64_encoded=false&wait=false')
  assert.equal(request.options.headers['X-RapidAPI-Key'], 'test-key')
  assert.deepEqual(JSON.parse(request.options.body), {
    language_id: 54, source_code: 'int main(){}', stdin: '42\n',
    cpu_time_limit: 2, wall_time_limit: 5, memory_limit: 256000,
  })
})

test('C, C++, and Java use their centralized language ID settings', async () => {
  const cases = [
    ['c', 'JUDGE0_LANGUAGE_C', '11'],
    ['cpp', 'JUDGE0_LANGUAGE_CPP', '22'],
    ['java', 'JUDGE0_LANGUAGE_JAVA', '33'],
  ]
  for (const [language, key, id] of cases) {
    let body
    globalThis.fetch = async (_url, options) => {
      body = JSON.parse(options.body)
      return response(201, { token: 'tok' })
    }
    await createSubmission({ language, sourceCode: 'source', input: '' }, {
      JUDGE0_API_URL: 'https://judge.example/api', [key]: id,
    })
    assert.equal(body.language_id, Number(id))
  }
})

test('Judge0 reports processing and completed results without inventing optional fields', async () => {
  globalThis.fetch = async () => response(200, { status: { id: 2, description: 'Processing' } })
  assert.deepEqual(await getSubmission('tok', { JUDGE0_API_URL: 'https://judge.example/api' }), {
    token: 'tok', status: 'Processing', processing: true, stdout: null, stderr: null,
    compileOutput: null, message: null, executionTime: null, memory: null,
  })

  globalThis.fetch = async () => response(200, {
    status: { id: 3, description: 'Accepted' }, stdout: 'hello', time: '0.01', memory: 1234,
  })
  const result = await getSubmission('tok', { JUDGE0_API_URL: 'https://judge.example/api' })
  assert.equal(result.processing, false)
  assert.equal(result.stdout, 'hello')
  assert.equal(result.executionTime, '0.01')
  assert.equal(result.stderr, null)
})

test('missing Judge0 configuration produces a safe setup error', async () => {
  await assert.rejects(createSubmission({ language: 'c', sourceCode: 'x', input: '' }, {}), (error) => {
    assert.ok(error instanceof Judge0Error)
    assert.equal(error.code, 'JUDGE0_NOT_CONFIGURED')
    assert.equal(error.httpStatus, 503)
    return true
  })
})

test('Judge0 network failures are returned as safe service errors', async () => {
  globalThis.fetch = async () => { throw new TypeError('socket details should not leak') }
  await assert.rejects(getSubmission('tok', { JUDGE0_API_URL: 'https://judge.example/api' }), (error) => {
    assert.equal(error.code, 'JUDGE0_UNAVAILABLE')
    assert.equal(error.message, 'Could not connect to Judge0.')
    assert.equal(error.httpStatus, 502)
    return true
  })
})

test('execution endpoint rejects wrong methods and malformed payloads', async () => {
  const methodResponse = mockResponse()
  await executeHandler({ method: 'GET', headers: {} }, methodResponse)
  assert.equal(methodResponse.statusCode, 405)
  assert.equal(methodResponse.headers.Allow, 'POST')

  const bodyResponse = mockResponse()
  await executeHandler({ method: 'POST', headers: { 'content-type': 'application/json' }, body: {} }, bodyResponse)
  assert.equal(bodyResponse.statusCode, 400)
  assert.equal(bodyResponse.payload.error.code, 'INVALID_LANGUAGE')
})

test('result endpoint validates the token before calling Judge0', async () => {
  let called = false
  globalThis.fetch = async () => { called = true; return response(200, {}) }
  const res = mockResponse()
  await submissionHandler({ method: 'GET', query: { token: '../bad' } }, res)
  assert.equal(res.statusCode, 400)
  assert.equal(res.payload.error.code, 'INVALID_TOKEN')
  assert.equal(called, false)
})

test('result endpoint returns Judge0 processing state', async () => {
  process.env.JUDGE0_API_URL = 'https://judge.example/api'
  globalThis.fetch = async () => response(200, { status: { id: 1, description: 'In Queue' } })
  const res = mockResponse()
  await submissionHandler({ method: 'GET', query: { token: 'valid-token' } }, res)
  assert.equal(res.statusCode, 200)
  assert.equal(res.payload.processing, true)
  assert.equal(res.payload.status, 'In Queue')
})
