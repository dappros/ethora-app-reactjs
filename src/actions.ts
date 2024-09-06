import { httpGetConfig, httpLogingWithEmail, singin, httpTokens, httpCreateNewApp, httpGetApps } from "./http";
import { ModelCurrentApp, ModelCurrentUser } from "./models";
import { useAppStore } from "./store/useAppStore";
import { sleep } from "./utils/sleep";

const getState = useAppStore.getState

const testUser: ModelCurrentUser = {
    firstName: 'Test',
    lastName: 'Lest',
    appId: '12312',
    homeScreen: '',
    isAgreeWithTerms: false,
    isAssetsOpen: false,
    isProfileOpen: false,
    refreshToken: 'token',
    token: 'token',
    walletAddress: '',
    xmppPassword: ''
}

export async function actionSignin() {
    const state = getState()
    await singin()
    state.doSetUser(testUser)
}

export async function  actionGetConfig(domainName?: string) {
    const state = getState()
    const {data: {result}} = await httpGetConfig(domainName)

    let app: ModelCurrentApp = {
        appToken: result.appToken,
        coinName: result.coinName,
        displayName: result.displayName,
        domainName: result.domainName
    }

    await sleep(2000)
    state.doSetCurrentApp(app)
}

export async function actionLoginWithEmail(email: string, password: string) {
    const state = getState()

    if (!state.currentApp?.appToken) {
        throw new Error("!state.currentApp?.appToken")
    }

    const {data} = await httpLogingWithEmail(email, password, state.currentApp?.appToken)
    httpTokens.token = data.token
    httpTokens.refreshToken = data.refreshToken
    
    const user: ModelCurrentUser = {
        appId: data.user.appId,
        firstName: data.user.firstName,
        homeScreen: data.user.homeScreen,
        isAgreeWithTerms: false,
        isAssetsOpen: false,
        isProfileOpen: false,
        lastName: data.user.lastName,
        refreshToken: data.refreshToken,
        token: data.token,
        xmppPassword: data.user.xmppPassword,
        walletAddress: data.user.defaultWallet.walletAddress
    }
    state.doSetUser(user)
    await actionBootsrap()
}

export async function actionBootsrap() {
    const state = getState()
    const {data: {apps}} = await httpGetApps()
    state.doSetApps(apps)
}

export async function actionCreateApp(displayName: string) {
    const state = getState()
    const {data} = await httpCreateNewApp(displayName)
    state.doAddApp(data.app)
}
