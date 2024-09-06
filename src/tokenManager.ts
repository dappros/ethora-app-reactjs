import axios from "axios"

export const http = axios.create({
    baseURL: import.meta.env.VITE_API,
})

export class TokenManager {
    token = ""
    refreshToken = ""
    loadTokenPromise: Promise<void> | null = null

    constructor(token: string, refreshToken: string) {
        this.token = token
        this.refreshToken = refreshToken
    }

    loadToken() {
        this.loadTokenPromise = new Promise(async (resolve, reject) => {
            try {
                const { data: { token, refreshToken } } = await http.post("/users/login/refresh", {}, { headers: { Authorization: this.refreshToken } })
                this.token = token
                this.refreshToken = refreshToken
                resolve()
            } catch (e) {
                return reject(new Error("error"))
            }
        });
    }
}
