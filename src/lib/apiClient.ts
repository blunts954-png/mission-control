import { getApiKeys } from './apiKeys'

export async function apiFetch(url: string, options?: RequestInit): Promise<Response> {
  const keys = getApiKeys()
  const headers = new Headers(options?.headers)

  if (keys.pagespeed) headers.set('x-api-key-pagespeed', keys.pagespeed)
  if (keys.betterstack) headers.set('x-api-key-betterstack', keys.betterstack)
  if (keys.netlify) headers.set('x-api-key-netlify', keys.netlify)
  if (keys.github) headers.set('x-api-key-github', keys.github)

  return fetch(url, { ...options, headers })
}
