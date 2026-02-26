import {API_BASE_URL} from './config.js'

function buildUrl(path) {

    const normalizedBase = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL
    const normalizedPath = path.startsWith('/') ? path : `/${path}`
    console.log(`buildUrl: ${normalizedBase}${normalizedPath}`)
    return `${normalizedBase}${normalizedPath}`
}

export async function httpRequest(path, options = {}) {
    const response = await fetch(buildUrl(path), {
        headers: {
            'Content-Type': 'application/json',
            ...(options.headers ?? {}),
        },
        ...options,
    })

    const contentType = response.headers.get('content-type') ?? ''
    const isJson = contentType.includes('application/json')
    const payload = isJson ? await response.json() : await response.text()

    if (!response.ok) {
        const message =
            typeof payload === 'object' && payload && 'message' in payload
                ? payload.message
                : `HTTP ${response.status}`
        throw new Error(message)
    }

    return payload
}

