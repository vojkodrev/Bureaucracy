type Tokens = {
    access_token: string
    refresh_token?: string
    id_token?: string
    expires_in: number
}

export type AuthUser = {
    name: string
    email: string
    picture?: string
}

type RealmAccess = {
    roles?: string[]
}

const keycloakUrl = (import.meta.env.VITE_KEYCLOAK_URL || 'http://localhost:8180').replace(/\/$/, '')
const realm = import.meta.env.VITE_KEYCLOAK_REALM || 'bureaucracy'
const clientId = import.meta.env.VITE_KEYCLOAK_CLIENT_ID || 'bureaucracy-frontend'
const tokenKey = 'bureaucracy.auth.tokens'
const stateKey = 'bureaucracy.auth.state'
const verifierKey = 'bureaucracy.auth.verifier'
const returnUrlKey = 'bureaucracy.auth.returnUrl'
let tokens: Tokens | null = readTokens()
let refreshPromise: Promise<string> | null = null

function endpoint(path: string) {
    return `${keycloakUrl}/realms/${encodeURIComponent(realm)}/protocol/openid-connect/${path}`
}

function callbackUrl() {
    return `${window.location.origin}${window.location.pathname}`
}

function readTokens(): Tokens | null {
    try {
        return JSON.parse(sessionStorage.getItem(tokenKey) ?? 'null') as Tokens | null
    } catch {
        return null
    }
}

function saveTokens(value: Tokens) {
    tokens = value
    sessionStorage.setItem(tokenKey, JSON.stringify(value))
}

function tokenExpiresSoon(token: string, seconds = 30) {
    try {
        const encoded = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
        const payload = JSON.parse(atob(encoded.padEnd(Math.ceil(encoded.length / 4) * 4, '='))) as { exp?: number }
        return !payload.exp || payload.exp <= Date.now() / 1000 + seconds
    } catch {
        return true
    }
}

function tokenPayload<T>(token: string): T | null {
    try {
        const encoded = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
        return JSON.parse(atob(encoded.padEnd(Math.ceil(encoded.length / 4) * 4, '='))) as T
    } catch {
        return null
    }
}

function randomValue() {
    const bytes = crypto.getRandomValues(new Uint8Array(32))
    return base64Url(bytes)
}

function base64Url(bytes: Uint8Array) {
    let binary = ''
    bytes.forEach((byte) => { binary += String.fromCharCode(byte) })
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

async function challenge(verifier: string) {
    return base64Url(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier))))
}

async function redirectToLogin(): Promise<never> {
    const state = randomValue()
    const verifier = randomValue()
    sessionStorage.setItem(stateKey, state)
    sessionStorage.setItem(verifierKey, verifier)
    sessionStorage.setItem(returnUrlKey, window.location.href)
    const url = new URL(endpoint('auth'))
    url.search = new URLSearchParams({
        client_id: clientId,
        redirect_uri: callbackUrl(),
        response_type: 'code',
        scope: 'openid profile email',
        state,
        code_challenge: await challenge(verifier),
        code_challenge_method: 'S256',
    }).toString()
    window.location.replace(url)
    return new Promise(() => undefined)
}

async function exchange(parameters: URLSearchParams) {
    const state = parameters.get('state')
    const verifier = sessionStorage.getItem(verifierKey)
    if (!state || state !== sessionStorage.getItem(stateKey) || !verifier) {
        throw new Error('The login response could not be verified.')
    }
    const response = await fetch(endpoint('token'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            grant_type: 'authorization_code',
            client_id: clientId,
            redirect_uri: callbackUrl(),
            code: parameters.get('code') ?? '',
            code_verifier: verifier,
        }),
    })
    if (!response.ok) throw new Error(`Login failed (${response.status}).`)
    saveTokens(await response.json() as Tokens)
    sessionStorage.removeItem(stateKey)
    sessionStorage.removeItem(verifierKey)
    const destination = sessionStorage.getItem(returnUrlKey) ?? callbackUrl()
    sessionStorage.removeItem(returnUrlKey)
    window.history.replaceState(null, '', destination)
}

async function accessToken(): Promise<string> {
    if (tokens?.access_token && !tokenExpiresSoon(tokens.access_token)) return tokens.access_token
    if (!tokens?.refresh_token) return redirectToLogin()
    refreshPromise ??= refreshToken().finally(() => { refreshPromise = null })
    return refreshPromise
}

async function refreshToken() {
    const response = await fetch(endpoint('token'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            grant_type: 'refresh_token',
            client_id: clientId,
            refresh_token: tokens?.refresh_token ?? '',
        }),
    })
    if (!response.ok) {
        sessionStorage.removeItem(tokenKey)
        tokens = null
        return redirectToLogin()
    }
    const next = await response.json() as Tokens
    if (!next.refresh_token && tokens?.refresh_token) next.refresh_token = tokens.refresh_token
    if (!next.id_token && tokens?.id_token) next.id_token = tokens.id_token
    saveTokens(next)
    return next.access_token
}

export async function initializeAuth() {
    const parameters = new URLSearchParams(window.location.search)
    if (parameters.has('error')) throw new Error(parameters.get('error_description') ?? 'Login was cancelled.')
    if (parameters.has('code')) await exchange(parameters)
    await accessToken()
}

export function getAuthUser(): AuthUser {
    const claims = tokens?.access_token
        ? tokenPayload<{
            name?: string
            preferred_username?: string
            email?: string
            picture?: string
        }>(tokens.access_token)
        : null
    return {
        name: claims?.name || claims?.preferred_username || 'Signed-in user',
        email: claims?.email || '',
        picture: claims?.picture,
    }
}

export function hasRealmRole(role: string) {
    const claims = tokens?.access_token
        ? tokenPayload<{ realm_access?: RealmAccess }>(tokens.access_token)
        : null
    return claims?.realm_access?.roles?.includes(role) ?? false
}

export function isStorageOnlyUser() {
    return hasRealmRole('bureaucracy-storage') && !hasRealmRole('bureaucracy-admin')
}

export function logout() {
    const idToken = tokens?.id_token
    tokens = null
    sessionStorage.removeItem(tokenKey)
    const url = new URL(endpoint('logout'))
    url.searchParams.set('client_id', clientId)
    url.searchParams.set('post_logout_redirect_uri', window.location.origin)
    if (idToken) url.searchParams.set('id_token_hint', idToken)
    window.location.assign(url)
}

export async function apiFetch(input: RequestInfo | URL, init?: RequestInit) {
    const request = new Request(input, init)
    const apiOrigin = new URL(import.meta.env.VITE_GRAPHQL_URL, window.location.href).origin
    if (new URL(request.url, window.location.href).origin !== apiOrigin) {
        throw new Error('apiFetch only accepts requests to the configured backend origin.')
    }
    const send = async () => {
        const headers = new Headers(request.headers)
        headers.set('Authorization', `Bearer ${await accessToken()}`)
        return fetch(new Request(request.clone(), { headers }))
    }
    let response = await send()
    if (response.status === 401 && tokens?.refresh_token) {
        tokens.access_token = ''
        response = await send()
    }
    return response
}

export async function openAuthenticatedUrl(url: string) {
    const tab = window.open('', '_blank')
    if (!tab) throw new Error('Allow pop-ups to open this document.')
    tab.opener = null
    try {
        const response = await apiFetch(url)
        if (!response.ok) throw new Error(`Document request failed (${response.status}).`)
        const objectUrl = URL.createObjectURL(await response.blob())
        tab.location.replace(objectUrl)
        window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000)
    } catch (error) {
        tab.close()
        throw error
    }
}
