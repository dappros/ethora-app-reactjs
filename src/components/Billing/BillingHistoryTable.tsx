import classNames from 'classnames';
import { ReactElement, useMemo } from 'react';
import { getCurrencySymbol } from '../../constants/currency';
import { ModalStripeSubscriptionData } from '../../models';

interface BillingHistoryTableProps {
  history?: ModalStripeSubscriptionData[] | null;
  secretKey?: string;
}

export const BillingHistoryTable = (
  props: BillingHistoryTableProps
): ReactElement => {
  const { history } = props;

  const getDate = (dateStart: number) => {
    const date = new Date(dateStart * 1000);
    const options: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    };
    const formattedDate = date.toLocaleDateString('en-US', options);
    return formattedDate;
  };

  const downloadInvoice = async (invoiceId: string) => {
    console.log('invoiceId', invoiceId);
    // const stripe = new Stripe(secretKey);
    // try {
    //   const invoice = await stripe.invoices.retrieve(invoiceId);

    //   if (invoice.invoice_pdf) {
    //     console.log('Invoice PDF URL:', invoice.invoice_pdf);
    //     return invoice.invoice_pdf;
    //   } else {
    //     console.log('PDF URL not available for this invoice.');
    //   }
    // } catch (error) {
    //   console.error('Error retrieving invoice:', error);
    // }
  };

  const memoHistory = useMemo(() => {
    return history && history.filter((his) => his.status !== 'incomplete');
  }, [history]);

  return (
    <table className="w-full overflow-x-auto scrollbar-hide">
      <thead>
        <tr>
          <th className="text-sm text-gray-600 text-left">Date</th>
          <th className="text-sm text-gray-600 text-center">Amount</th>
          <th className="text-sm text-gray-600 text-center">Status</th>
          <th className="text-sm text-gray-600 text-center">Invoice</th>
        </tr>
      </thead>
      <tbody>
        {memoHistory &&
          memoHistory.map((entry, index) => (
            <tr key={index}>
              <td className="text-sm text-gray-900 font-medium py-2 text-left">
                {getDate(entry.current_period_start)}
              </td>
              <td className="text-sm text-gray-900 font-medium text-center">
                {getCurrencySymbol(entry.plan.currency)}
                {entry.plan.amount! / 100}
              </td>
              <td
                className={classNames(
                  'text-sm  text-center',
                  entry.status === 'active'
                    ? ' text-green-500'
                    : 'text-gray-800'
                )}
              >
                {entry.status}
              </td>
              <td className="text-sm text-center">
                <button
                  className="text-brand-500 font-semibold"
                  onClick={() => downloadInvoice(entry.latest_invoice)}
                >
                  {entry.latest_invoice && 'Download'}
                </button>
              </td>
            </tr>
          ))}
      </tbody>
    </table>
  );
};
