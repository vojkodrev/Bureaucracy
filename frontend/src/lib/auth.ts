import Keycloak, { type KeycloakTokenParsed } from 'keycloak-js'

export type AuthUser = {
    name: string
    email: string
    picture?: string
}

type UserClaims = KeycloakTokenParsed & {
    name?: string
    preferred_username?: string
    email?: string
    picture?: string
}

const keycloak = new Keycloak({
    url: (import.meta.env.VITE_KEYCLOAK_URL || 'http://localhost:8180').replace(/\/$/, ''),
    realm: import.meta.env.VITE_KEYCLOAK_REALM || 'bureaucracy',
    clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID || 'bureaucracy-frontend',
})

// Remove credentials left in session storage by the previous custom OIDC client.
sessionStorage.removeItem('bureaucracy.auth.tokens')
sessionStorage.removeItem('bureaucracy.auth.state')
sessionStorage.removeItem('bureaucracy.auth.verifier')
sessionStorage.removeItem('bureaucracy.auth.returnUrl')

async function login(): Promise<never> {
    await keycloak.login({ redirectUri: window.location.href })
    throw new Error('The sign-in redirect did not start.')
}

async function accessToken(forceRefresh = false): Promise<string> {
    if (!keycloak.authenticated) return login()

    try {
        await keycloak.updateToken(forceRefresh ? -1 : 30)
    } catch {
        return login()
    }

    if (!keycloak.token) return login()
    return keycloak.token
}

export async function initializeAuth() {
    const authenticated = await keycloak.init({
        onLoad: 'login-required',
        flow: 'standard',
        pkceMethod: 'S256',
        scope: 'profile email',
    })
    if (!authenticated) await login()
}

export function getAuthUser(): AuthUser {
    const claims = keycloak.tokenParsed as UserClaims | undefined
    return {
        name: claims?.name || claims?.preferred_username || 'Signed-in user',
        email: claims?.email || '',
        picture: claims?.picture,
    }
}

export function hasRealmRole(role: string) {
    return keycloak.hasRealmRole(role)
}

export function isStorageOnlyUser() {
    return hasRealmRole('bureaucracy-storage') && !hasRealmRole('bureaucracy-admin')
}

export function logout() {
    return keycloak.logout({ redirectUri: window.location.origin })
}

export async function apiFetch(input: RequestInfo | URL, init?: RequestInit) {
    const request = new Request(input, init)
    const apiOrigin = new URL(import.meta.env.VITE_GRAPHQL_URL, window.location.href).origin
    if (new URL(request.url, window.location.href).origin !== apiOrigin) {
        throw new Error('apiFetch only accepts requests to the configured backend origin.')
    }

    const send = async (forceRefresh = false) => {
        const headers = new Headers(request.headers)
        headers.set('Authorization', `Bearer ${await accessToken(forceRefresh)}`)
        return fetch(new Request(request.clone(), { headers }))
    }

    let response = await send()
    if (response.status === 401) response = await send(true)
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
