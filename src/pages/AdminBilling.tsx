import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DownloadIcon from '@mui/icons-material/Download';
import SearchIcon from '@mui/icons-material/Search';
import { Box, IconButton, Stack } from '@mui/material';
import { Elements } from '@stripe/react-stripe-js';
import { useMemo, useState } from 'react';

import { stripePromise } from '../../stripeConfig';

import { BillingModalChangeInfo } from '../components/Billing/Modal/BillingModalChangeInfo';
import { BillingModalChangePlan } from '../components/Billing/Modal/BillingModalChangePlan';
import { BillingModalCheckoutForm } from '../components/Billing/Modal/BillingModalCheckoutForm';
import { useAppStore } from '../store/useAppStore';

const getPlanUi = (signupPlan?: string) => {
  const normalized = String(signupPlan || '').toLowerCase();

  if (normalized.includes('enterprise')) {
    return { id: 'enterprise', title: 'Enterprise Plan', price: 'Custom' };
  }

  if (normalized.includes('business') || normalized.includes('pro')) {
    return { id: 'business', title: 'Business Plan', price: '$199 / month' };
  }

  return { id: 'free', title: 'Free Plan', price: '$0 / month' };
};

export default function AdminBilling() {
  const currentUser = useAppStore((s) => s.currentUser);
  const currentPlan = getPlanUi(currentUser?.signupPlan);
  const [historySearch, setHistorySearch] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const billingInfo = {
    card: '**** **** **** 1234',
    cardHolder: 'Jonathan Schmitt',
    cardExpiry: '05/2027',
    personName: 'John Doe',
    address: '8228 Enos Extensions, North Porterhaven, Mississippi, Central African Republic',
  };

  const history = [
    { id: 'inv-2025-01-08', date: 'Jan 08, 2025', amount: '$199', status: 'paid' },
    { id: 'inv-2025-01-05', date: 'Jan 05, 2025', amount: '$199', status: 'pending' },
    { id: 'inv-2024-12-08', date: 'Dec 08, 2024', amount: '$199', status: 'paid' },
    { id: 'inv-2024-11-08', date: 'Nov 08, 2024', amount: '$199', status: 'paid' },
    { id: 'inv-2024-10-08', date: 'Nov 08, 2024', amount: '$199', status: 'failed' },
  ];

  const parseDate = (date: string) => new Date(date).getTime();

  const filteredAndSortedHistory = useMemo(() => {
    const q = historySearch.trim().toLowerCase();
    const filtered = history.filter((entry) => {
      if (!q) return true;
      return (
        entry.date.toLowerCase().includes(q) ||
        entry.amount.toLowerCase().includes(q) ||
        entry.status.toLowerCase().includes(q)
      );
    });

    return filtered.sort((a, b) => {
      const d = parseDate(a.date) - parseDate(b.date);
      return sortOrder === 'asc' ? d : -d;
    });
  }, [historySearch, sortOrder]);

  const downloadCsv = (rows: typeof history, filename: string) => {
    const header = 'Invoice ID,Date,Amount,Status\n';
    const content = rows
      .map((r) => `${r.id},${r.date},${r.amount},${r.status}`)
      .join('\n');
    const blob = new Blob([header + content], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const onDownloadAll = () => {
    downloadCsv(filteredAndSortedHistory, 'billing-history.csv');
  };

  const onDownloadOne = (id: string) => {
    const row = history.find((item) => item.id === id);
    if (!row) return;
    downloadCsv([row], `${id}.csv`);
  };

  const paymentType = currentPlan.id === 'free' ? 'Visa / MasterCard' : 'Visa';
  const planFeatures =
    currentPlan.id === 'free'
      ? [
          'Users and SSO',
          'Storage (100 Gb)',
          'Wallets (profile + assets)',
          'Shared Cloud hosting',
          'Messaging (fair use)',
          'Community support',
        ]
      : currentPlan.id === 'business'
        ? [
            'Everything in Free',
            'Integrations',
            'High load allowance',
            'Business Cloud SLA',
            'Storage (1 TB)',
            'Technical support',
          ]
        : [
            'Everything in Business',
            'Dedicated / On-prem hosting',
            'Compliance advanced',
            'Custom configuration',
            'Storage (Unlimited)',
            '24/7 technical support',
          ];

  const [openChangePlan, setOpenChangePlan] = useState<boolean>(false);
  const [openChangeInfo, setOpenChangeInfo] = useState<boolean>(false);
  const [openCheckoutForm, setOpenCheckoutForm] = useState<boolean>(false);

  return (
    <Elements stripe={stripePromise}>
      <Stack spacing={2} className="container mx-auto p-3 md:p-5 w-full overflow-hidden">
        <Box className="rounded-xl border border-[#E6EDF5] bg-white p-4 md:p-5">
          <p className="text-[30px] font-varela leading-none mb-3">Billing</p>
          <div className="h-px bg-[#EEF2F7] mb-3" />

          <Box className="grid grid-cols-1 xl:grid-cols-3 gap-3">
            <div className="rounded-lg border border-[#ECF1F7] p-3 xl:col-span-1">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-[22px] font-semibold leading-none">
                    {currentPlan.id === 'enterprise'
                      ? 'Custom'
                      : currentPlan.price.replace(' / month', '')}
                  </p>
                  {currentPlan.id !== 'enterprise' && (
                    <p className="text-[12px] text-[#7a8797]">per month</p>
                  )}
                </div>
                <button
                  className="h-8 px-4 rounded-lg border border-brand-500 text-brand-500 text-[13px] font-medium"
                  onClick={() => setOpenChangePlan(true)}
                >
                  Change Plan
                </button>
              </div>

              <div className="flex items-center gap-2 mb-1">
                <p className="text-[24px] font-varela leading-none">
                  {currentPlan.id === 'free' ? 'Free Plan' : currentPlan.title}
                </p>
                <span className="rounded-full bg-[#E9F9EF] text-[#20B15A] text-[11px] px-2 py-[2px] font-semibold">
                  Active
                </span>
              </div>
              <p className="text-[12px] text-[#9AA5B1] mb-3">Enough for your MVP</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                {planFeatures.map((feature) => (
                  <div key={feature} className="flex items-center gap-1.5">
                    <CheckCircleIcon sx={{ fontSize: 14 }} className="text-brand-500" />
                    <span className="text-[13px] text-[#2c3642]">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-[#ECF1F7] p-3 xl:col-span-1">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-[20px] font-semibold leading-none">Payment Method</p>
                  <p className="text-[12px] text-[#9AA5B1] mt-1">
                    Change how you pay for your plan.
                  </p>
                </div>
                <button
                  className="h-8 px-4 rounded-lg border border-brand-500 text-brand-500 text-[13px] font-medium"
                  onClick={() => setOpenCheckoutForm(true)}
                >
                  Edit
                </button>
              </div>

              <div className="rounded-md border border-[#EEF2F7] px-3 py-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {/* <p className="text-[28px] leading-none font-black tracking-tight">VISA</p> */}
                    {paymentType.includes('MasterCard') && (
                      <span className="relative w-8 h-5 inline-block">
                        <span className="absolute left-0 top-0 w-5 h-5 rounded-full bg-[#EA001B]" />
                        <span className="absolute left-3 top-0 w-5 h-5 rounded-full bg-[#F79E1B] opacity-90" />
                      </span>
                    )}
                    <p className="text-[13px] text-[#2c3642]">{billingInfo.card}</p>
                  </div>
                  <p className="text-[12px] text-[#7a8797]">Expiry {billingInfo.cardExpiry}</p>
                </div>
                <p className="text-[13px] text-[#2c3642] mt-2">{billingInfo.cardHolder}</p>
              </div>
            </div>

            <div className="rounded-lg border border-[#ECF1F7] p-3 xl:col-span-1">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-[20px] font-semibold leading-none">Billing Info</p>
                  <p className="text-[12px] text-[#9AA5B1] mt-1">Change your billing information.</p>
                </div>
                <button
                  onClick={() => setOpenChangeInfo(true)}
                  className="h-8 px-4 rounded-lg border border-brand-500 text-brand-500 text-[13px] font-medium"
                >
                  Edit
                </button>
              </div>

              <div className="space-y-2">
                <div className="rounded-md border border-[#EEF2F7] px-3 py-2">
                  <p className="text-[12px] text-[#9AA5B1]">Person / Company name:</p>
                  <p className="text-[14px] text-[#2c3642]">{billingInfo.personName}</p>
                </div>
                <div className="rounded-md border border-[#EEF2F7] px-3 py-2">
                  <p className="text-[12px] text-[#9AA5B1]">Billing Address:</p>
                  <p className="text-[14px] text-[#2c3642] leading-5">{billingInfo.address}</p>
                </div>
              </div>
            </div>
          </Box>

          <div className="rounded-lg border border-[#ECF1F7] mt-3 p-3">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <h2 className="text-[24px] font-varela leading-none">Billing History</h2>
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  <button
                    type="button"
                    onClick={() => setIsSearchOpen((prev) => !prev)}
                    className="h-8 w-8 grid place-items-center rounded-lg border border-[#DCE5F0] text-[#6B7A90]"
                    aria-label="Toggle search"
                  >
                    <SearchIcon fontSize="small" />
                  </button>
                  <input
                    value={historySearch}
                    onChange={(e) => setHistorySearch(e.target.value)}
                    placeholder="Search"
                    className={`h-8 ml-2 rounded-lg border border-[#DCE5F0] px-3 text-[13px] outline-none transition-all duration-300 ${
                      isSearchOpen
                        ? 'w-[170px] opacity-100'
                        : 'w-0 opacity-0 px-0 border-transparent pointer-events-none'
                    }`}
                  />
                </div>

                <button
                  className="h-8 px-3 rounded-lg text-[13px] text-[#6B7A90] hover:text-brand-500"
                  onClick={() => setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'))}
                >
                  Sort by <span className="text-brand-500 font-semibold">Date ({sortOrder === 'desc' ? 'A-Z' : 'Z-A'})</span>
                </button>

                <button
                  className="h-8 px-3 rounded-lg border border-brand-500 text-brand-500 text-[13px] font-medium flex items-center gap-1.5"
                  onClick={onDownloadAll}
                >
                  <DownloadIcon sx={{ fontSize: 15 }} />
                  Download All
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px]">
                <thead>
                  <tr className="text-left text-[11px] uppercase tracking-wider text-[#B3BECC]">
                    <th className="py-2">Date</th>
                    <th className="py-2 text-center">Amount</th>
                    <th className="py-2 text-center">Status</th>
                    <th className="py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAndSortedHistory.map((entry) => (
                    <tr key={entry.id} className="border-t border-[#F2F5FA]">
                      <td className="py-3 text-[15px] text-[#2C3642]">{entry.date}</td>
                      <td className="py-3 text-[15px] text-center text-[#2C3642]">{entry.amount}</td>
                      <td className="py-3 text-center">
                        <span
                          className={
                            entry.status === 'paid'
                              ? 'text-[#22C55E] text-[15px]'
                              : entry.status === 'pending'
                                ? 'text-[#D97706] text-[15px]'
                                : 'text-[#EF4444] text-[15px]'
                          }
                        >
                          {entry.status}
                        </span>
                      </td>
                      <td className="py-2 text-right">
                        <IconButton
                          size="small"
                          aria-label={`Download ${entry.id}`}
                          onClick={() => onDownloadOne(entry.id)}
                        >
                          <DownloadIcon fontSize="small" className="text-brand-500" />
                        </IconButton>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Box>
      </Stack>

      <BillingModalChangePlan
        isOpen={openChangePlan}
        handleClose={() => setOpenChangePlan(false)}
        currentPlanId={currentPlan.id}
      />
      <BillingModalChangeInfo
        isOpen={openChangeInfo}
        handleClose={() => setOpenChangeInfo(false)}
      />
      <BillingModalCheckoutForm
        isOpen={openCheckoutForm}
        handleClose={() => setOpenCheckoutForm(false)}
      />
    </Elements>
  );
}
