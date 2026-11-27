const languageEnvironmentKeys = Object.freeze({
  c: 'JUDGE0_LANGUAGE_C',
  cpp: 'JUDGE0_LANGUAGE_CPP',
  java: 'JUDGE0_LANGUAGE_JAVA',
})

export function getJudge0LanguageId(language, env = process.env) {
  const key = languageEnvironmentKeys[language]
  if (!key) return null

  const value = env[key]
  if (!value || !/^\d+$/.test(value)) return null

  const id = Number(value)
  return Number.isSafeInteger(id) && id > 0 ? id : null
}

export const supportedLanguages = Object.freeze(Object.keys(languageEnvironmentKeys))
