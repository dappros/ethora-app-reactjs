export interface ModelCurrentUser {
    appId: string
    firstName: string
    lastName: string
    homeScreen: string
    isAgreeWithTerms: boolean
    isAssetsOpen: boolean
    isProfileOpen: boolean
    token: string
    refreshToken: string
    walletAddress: string
    xmppPassword: string
}

export interface ModelCurrentApp {
    appToken: string
    coinName: string
    displayName: string
    domainName: string
}

export interface ModelApp {
    appToken: string
    bundleId: string
    coinName: string
    coinSymbol: string
    createdAt: string
    creatorId: string
    defaultAccessAssetsOpen: boolean
    defaultAccessProfileOpen: boolean
    defaultRooms: Array<string>
    displayName: string
    domainName: string
    isAllowedNewAppCreate: boolean
    isBaseApp: boolean
    parentAppId: string
    primaryColor: string
    secondaryColor: string
    signonOptions: Array<string>
    logoImage?: string
    stats: {
        recentlyApiCalls: number,
        recentlyFiles: number,
        recentlyIssuance: number,
        recentlyRegistered: number,
        recentlySessions: number,
        recentlyTransactions: number,
        totalApiCalls: number,
        totalFiles: number,
        totalIssuance: number,
        totalRegistered: number,
        totalSessions: number,
        totalTransactions: number
    },
    systemChatAccount: {
        jid: string
    },
    updatedAt: string
    usersCanFree: boolean
    _id: string
}

export interface ModelState {
    inited: boolean
    currentUser: ModelCurrentUser | null
    currentApp: ModelCurrentApp | null
    apps: Array<ModelApp>
}
