interface Plan {
  id: string;
  title: string;
  price: string;
  required: string;
  description?: string;
  icon?: boolean;
  features: string[];
}

export const plans: Plan[] = [
  {
    id: 'free',
    title: 'Free',
    required: '* Enough for you MVP',
    price: '0$',
    features: [
      'Custom level 2 domain (web3)',
      'Web3, Chat and Push Notifications',
      'Full API and IPFS (fair use policy)',
    ],
  },
  {
    id: 'business',
    title: 'Business',
    required: '* Powering SMEs',
    price: '199$ / month',
    description: 'Everything in Free',
    icon: true,
    features: [
      'Everything in Free',
      'Custom primary domain (web3)',
      'Advanced L1, L2, IPFS options',
      'High API and RPC performance',
      'Business Cloud SLA',
    ],
  },
  {
    id: 'enterprise',
    title: 'Enterprise',
    required: '* Custom and larger needs',
    price: 'Custom',
    description: 'Everything in Business',
    icon: true,
    features: [
      'Everything in Business',
      'Dedicated / On-prem hosting',
      'Enterprise custom configuration',
      '24/7 phone support',
      'Enterprise-grade SLA',
    ],
  },
];