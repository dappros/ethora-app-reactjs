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
    defaultRooms: Array<{jid: string, pinned: boolean}>
    displayName: string
    domainName: string
    isAllowedNewAppCreate: boolean
    isBaseApp: boolean
    parentAppId: string
    primaryColor: string
    signonOptions: Array<string>
    logoImage: string
    sublogoImage: string
    appTagline: string
    firebaseWebConfigString?: string

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
    _id: string,
    afterLoginPage: string,
    availableMenuItems: {
        chats: boolean,
        profile: boolean,
        settings: boolean
    },
    googleServicesJson: string,
    googleServiceInfoPlist: string
}

export interface ModelUserACL {
    appId: string
    userId: string
    createdAt: string
    updatedAt: string
    application: {
        appCreate: {
            create: boolean
        },
        appPush: {
            create: boolean
            read: boolean
            update: boolean
            admin: boolean
        },
        appSettings: {
            admin: boolean
            read: boolean
            update: boolean
        },
        appStats: {
            admin: boolean
            read: boolean
        },
        appTokens: {
            admin: boolean
            create: boolean
            read: boolean
            update: boolean
        },
        appUsers: {
            admin: boolean
            create: boolean
            delete: boolean
            read: boolean
            update: boolean
        }
    },
    network: {
        read: boolean
    }
}

export interface ModelAppUser {
    _id: string
    appId: string
    acl: ModelUserACL
    authMethod: string
    createdAt: string
    defaultWallet: {
        walletAddress: string
    }
    email: string
    firstName: string
    lastName: string
    homeScreen: string
    isAgreeWithTerms: boolean
    isAssetsOpen: boolean
    isProfileOpen: boolean
    lastSeen: string
    profileImage: string
    tags: Array<string>
    updatedAt: string
}

export interface ModelState {
    inited: boolean
    currentUser: ModelCurrentUser | null
    currentApp: ModelApp | null
    apps: Array<ModelApp>
}
