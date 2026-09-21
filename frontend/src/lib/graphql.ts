const graphqlUrl = import.meta.env.VITE_GRAPHQL_URL

export async function postGraphql<T>(
    query: string,
    variables?: Record<string, unknown>,
    signal?: AbortSignal,
): Promise<T> {
    const response = await fetch(graphqlUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, variables }),
        signal,
    })
    if (!response.ok) throw new Error(`Request failed (${response.status})`)
    const result = await response.json() as T & { errors?: { message: string }[] }
    if (result.errors?.length) throw new Error(result.errors.map(({ message }) => message).join(', '))
    return result
}
