import { BillingDetails } from "@stripe/stripe-js";
import Stripe from 'stripe';

export interface ModelCurrentUser {
  _id: string;
  appId: string;
  firstName: string;
  lastName: string;
  homeScreen: string;
  isAgreeWithTerms: boolean;
  isAssetsOpen: boolean;
  isProfileOpen: boolean;
  token: string;
  refreshToken: string;
  walletAddress: string;
  xmppPassword: string;
  profileImage: string;
  description: string;
  signupPlan: string;
  defaultWallet: {
    walletAddress: string;
  };
  isSuperAdmin?: {
    read: boolean;
    write: boolean;
  };
}

export interface ModelCurrentApp {
  appToken: string;
  coinName: string;
  displayName: string;
  domainName: string;
}

export interface ModelApp {
  appToken: string;
  bundleId: string;
  coinName: string;
  coinSymbol: string;
  createdAt: string;
  creatorId: string;
  defaultAccessAssetsOpen: boolean;
  defaultAccessProfileOpen: boolean;
  defaultRooms: Array<{ jid: string; pinned: boolean }>;
  displayName: string;
  domainName: string;
  isAllowedNewAppCreate: boolean;
  isBaseApp: boolean;
  parentAppId: string;
  primaryColor: string;
  signonOptions: Array<string>;
  logoImage: string;
  sublogoImage: string;
  appTagline: string;
  firebaseWebConfigString?: string;
  firebaseConfigParsed?: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
    measurementId: string;
  };

  stats: {
    recentlyApiCalls: number;
    recentlyFiles: number;
    recentlyIssuance: number;
    recentlyRegistered: number;
    recentlySessions: number;
    recentlyTransactions: number;
    totalApiCalls: number;
    totalFiles: number;
    totalIssuance: number;
    totalRegistered: number;
    totalSessions: number;
    totalTransactions: number;
  };
  systemChatAccount: {
    jid: string;
  };
  updatedAt: string;
  usersCanFree: boolean;
  _id: string;
  afterLoginPage: string;
  availableMenuItems: {
    chats: boolean;
    profile: boolean;
    settings: boolean;
  };
  googleServicesJson: string;
  googleServiceInfoPlist: string;
  appSecret: string;
}

export interface ModelUserACL {
  appId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  application: {
    appCreate: {
      create: boolean;
    };
    appPush: {
      create: boolean;
      read: boolean;
      update: boolean;
      admin: boolean;
    };
    appSettings: {
      admin: boolean;
      read: boolean;
      update: boolean;
    };
    appStats: {
      admin: boolean;
      read: boolean;
    };
    appTokens: {
      admin: boolean;
      create: boolean;
      read: boolean;
      update: boolean;
    };
    appUsers: {
      admin: boolean;
      create: boolean;
      delete: boolean;
      read: boolean;
      update: boolean;
    };
  };
  network: {
    read: boolean;
  };
}

export interface ModelAppUser {
  _id: string;
  appId: string;
  acl: ModelUserACL;
  authMethod: string;
  createdAt: string;
  defaultWallet: {
    walletAddress: string;
  };
  email: string;
  firstName: string;
  lastName: string;
  homeScreen: string;
  isAgreeWithTerms: boolean;
  isAssetsOpen: boolean;
  isProfileOpen: boolean;
  lastSeen: string;
  profileImage: string;
  tags: Array<string>;
  updatedAt: string;
}

export interface ModalStripePrice {
  amount?: number;
  active: boolean;
  billing_scheme: string;
  created: number;
  currency: string;
  id: string;
  livemode: boolean;
  lookup_key: string;
  nickname: string | null;
  object: string;
  product: {
    active: boolean;
    attributes: string[];
    created: number;
    default_price: string;
    description: string;
    id: string;
    livemode: boolean;
    name: string;
    object: string;
    type: string;
    updated: number
  };
  recurring: {
    interval: string;
    interval_count: number;
    usage_type: string;
  };
  unit_amount: number;
  unit_amount_decimal: string;
};

export interface ModalStripeConfig {
  publishableKey?: string;
  prices?: ModalStripePrice[];
};


export interface ModalStripeSubscriptionData {
  canceled_at: number;
  created: number;
  current_period_end: number;
  current_period_start: number;
  ended_at: number;
  id: string;
  status: string;
  customer: string;
  billing: string;
  billing_cycle_anchor: number;
  cancel_at_period_end: boolean;
  collection_method: string;
  description: string | null;
  discount: string | null;
  default_payment_method: {
    allow_redisplay: string;
    billing_details: BillingDetails;
    card: {
      brand: string;
      checks: {
        address_line1_check: string | null;
        address_postal_code_check: string | null;
        cvc_check: string;
      };
      country: string;
      display_brand: string;
      exp_month: number;
      exp_year: number;
      fingerprint: string;
      funding: string;
      last4: string;
    };
    created: number;
    customer: string;
    id: string;
    livemode: boolean;
    type: string;
  };
  invoice_customer_balance_settings: {
    consume_applied_balance_on_void: boolean;
  };
  plan: ModalStripePrice;
  latest_invoice: string;
};

export interface ModalStripeSubscription {
  data: ModalStripeSubscriptionData[];
  has_more: boolean;
  object: string;
  url: string;
};

export interface ModalStripeInvoices {
  account_name: string;
  amount_due: number;
  amount_paid: number;
};

export type StripeInvoice = Stripe.Invoice;

export interface ModalStripe {
  config: ModalStripeConfig;
  subscription: ModalStripeSubscription;
  secretKey: Record<string, string>;
  invoices: StripeInvoice[];
  loading: boolean;
};

export interface ModelState {
  inited: boolean;
  currentUser: ModelCurrentUser | null;
  currentApp: ModelApp | null;
  apps: Array<ModelApp>;
  stripe: ModalStripe;
};
