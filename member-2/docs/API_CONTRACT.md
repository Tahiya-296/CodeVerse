# CodeVerse API contract

This contract adapts to the current frontend in `src/components/CompilerWorkspace.jsx`. The existing language selector emits `c`, `cpp`, or `java`; the editor draft maps to `sourceCode`; standard input state maps to `input`. The existing Run handler calls this API and polls the returned token.

## Create a submission

`POST /api/execute`

Content type: `application/json`

Request:

```json
{
  "language": "cpp",
  "sourceCode": "#include <iostream>\\nint main(){std::cout << \\"Hello\\";} ",
  "input": ""
}
```

`language` must be one of `c`, `cpp`, or `java`. `sourceCode` must be a non-empty string. `input` is optional and defaults to the empty string. Source code is limited to 100 KiB and stdin to 64 KiB.

Success creates a Judge0 submission and returns HTTP 202 with its token. It does not mean the program has finished or executed successfully:

```json
{
  "success": true,
  "token": "<judge0-submission-token>",
  "status": "Processing"
}
```

The endpoint must not return provider credentials or internal stack traces.

## Retrieve a result

`GET /api/submissions/:token`

While Judge0 is processing, return HTTP 200 with:

```json
{
  "success": true,
  "token": "<judge0-submission-token>",
  "status": "Processing",
  "processing": true,
  "stdout": null,
  "stderr": null,
  "compileOutput": null,
  "message": null,
  "executionTime": null,
  "memory": null
}
```

When complete, return HTTP 200 with the same result fields and `processing: false`. `status` is Judge0's actual status description, such as `Accepted`, `Compilation Error`, `Runtime Error (NZEC)`, or `Time Limit Exceeded`. The server must preserve actual values when present and use `null` for absent optional fields.

```json
{
  "success": true,
  "token": "<judge0-submission-token>",
  "status": "Accepted",
  "processing": false,
  "stdout": "Hello",
  "stderr": null,
  "compileOutput": null,
  "message": null,
  "executionTime": "0.01",
  "memory": 1234
}
```

`stdout`, `stderr`, and `compileOutput` are separate so the UI can display normal output, runtime errors, and compiler diagnostics in the existing panels. A completed HTTP request does not imply that program execution succeeded; inspect `status`.

## Backend errors

Errors use this shape:

```json
{
  "success": false,
  "status": "Error",
  "error": {
    "code": "INVALID_LANGUAGE",
    "message": "Unsupported programming language."
  }
}
```

Expected codes include `INVALID_REQUEST`, `INVALID_LANGUAGE`, `SOURCE_REQUIRED`, `SOURCE_TOO_LARGE`, `INPUT_TOO_LARGE`, `INVALID_TOKEN`, `JUDGE0_NOT_CONFIGURED`, and `JUDGE0_UNAVAILABLE`. Validation errors use appropriate 4xx status codes, an unknown token is 404 when the provider confirms it, missing server configuration is 503, and provider/network failures are 502 or 504. The execution request must use `Content-Type: application/json`.

## Frontend integration

The workspace POSTs `{ language, sourceCode: drafts[language], input }`, polls the returned token using the result endpoint, and updates its existing output/error state. Polling stops when `processing` is false or after 60 seconds; result retrieval never submits the program again.
