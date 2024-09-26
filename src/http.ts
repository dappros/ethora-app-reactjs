import axios from "axios"
import { ModelUserACL } from "./models"

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
    return http.post('/users/login-with-email', { email, password }, {
        headers: {
            Authorization: appJwt
        }
    })
}

export function httpCreateNewApp(displayName: string) {
    return http.post(`/apps`, { displayName }, { headers: { Authorization: httpTokens.token } })
}

export function httpGetApps() {
    return http.get('/apps', { headers: { Authorization: httpTokens.token } })
}

export function httpUpdateApp(appId: string, options: any) {
    return http.put(
        `/apps/${appId}`,
        {
            ...options
        },
        { headers: { Authorization: httpTokens.token } }
    )
}

export function httpPostFile(file: File) {
    let fd = new FormData()
    fd.append('files', file)
    return http.post('/files', fd, { headers: { Authorization: httpTokens.token } })
}

export function httpGetUsers(
    appId: string,
    limit: number = 10,
    offset: number = 0,
    orderBy: 'email' | 'createdAt' | 'firstName' | 'lastName' = 'lastName',
    order: 'asc' | 'desc' = 'asc'
) {
    return http.get(
        `/users/${appId}?limit=${limit}&offset=${offset}&orderBy=${orderBy}&order=${order}`,
        { headers: { Authorization: httpTokens.token } }
    )
}

export function httpDeleteManyUsers(appId: string, usersIdList: Array<string>) {
    return http.post(
        `/users/delete-many-with-app-id/${appId}`,
        { usersIdList },
        { headers: { Authorization: httpTokens.token } }
    )
}

export function httpResetPasswords(appId: string, usersIdList: Array<string>) {
    return http.post(
        `/users/reset-passwords-with-app-id/${appId}`,
        {
            usersIdList
        },
        { headers: { Authorization: httpTokens.token } }
    )
}

export function httpCraeteUser(appId: string, { email, firstName, lastName }: { email: string, firstName: string, lastName: string }) {
    return http.post(
        `/users/create-with-app-id/${appId}`,
        {
            email,
            firstName,
            lastName
        },
        {
            headers: { Authorization: httpTokens.token }
        }
    )
}

export function httpTagsSet(appId: string, { usersIdList, tagsList }: { usersIdList: Array<string>, tagsList: Array<string> }) {
    return http.post(
        `/users/tags-set/${appId}`,
        {
            usersIdList,
            tagsList
        },
        {
            headers: { Authorization: httpTokens.token }
        }
    )
}

export function httpUpdateAcl(appId: string, userId: string, acl: ModelUserACL) {
    let _acl = JSON.parse(JSON.stringify(acl))

    delete _acl.createdAt
    delete _acl.appId
    delete _acl.userId
    delete _acl._id
    delete _acl.__v
    delete _acl.updatedAt
    delete _acl.application.appCreate.disabled
    delete _acl.application.appPush.disabled
    delete _acl.application.appSettings.disabled
    delete _acl.application.appStats.disabled
    delete _acl.application.appTokens.disabled
    delete _acl.network.netStats.disabled

    return http.put(
        `/users/acl/${appId}/${userId}`,
        {
            ..._acl
        },
        {
            headers: { Authorization: httpTokens.token }
        }
    )
}
