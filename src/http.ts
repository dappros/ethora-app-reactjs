import axios from "axios"

export const httpTokens = {
    token: "",
    refreshToken: ""
}

export const http = axios.create({
    baseURL: import.meta.env.VITE_API,
})

export async function singin() {
    return new Promise((resolve, _reject) => {
        setTimeout(() => resolve(true), 2000)
    })
}

export function httpGetConfig(domainName?: string) {
    let path = "/apps/get-config"
    if (domainName) {
        path += `?domainName=${domainName}`
    }

    return http.get(
        path
    )
}

export function httpLogingWithEmail(email: string, password: string, appJwt: string) {
    return http.post('/users/login-with-email', {email, password}, {
        headers: {
            Authorization: appJwt
        }
    })
}

export function httpCreateNewApp(displayName: string) {
    return http.post(`/apps`, {displayName}, {headers: {Authorization: httpTokens.token}})
}

export function httpGetApps() {
    return http.get('/apps', {headers: {Authorization: httpTokens.token}})
}

