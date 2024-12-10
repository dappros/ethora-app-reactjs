import classNames from 'classnames';
import { ReactElement } from 'react';
import { Link } from 'react-router-dom';
import { getCurrencySymbol } from '../../constants/currency';
import { StripeInvoice } from '../../models';

interface BillingHistoryTableProps {
  history?: StripeInvoice[] | null;
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

  // const memoHistory = useMemo(() => {
  //   return history && history.filter((his) => his.status !== 'incomplete');
  // }, [history]);

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
        {history &&
          history.map((entry, index) => (
            <tr key={index}>
              <td className="text-sm text-gray-900 font-medium py-2 text-left">
                {getDate(entry.created)}
              </td>
              <td className="text-sm text-gray-900 font-medium text-center">
                {getCurrencySymbol(entry.currency)}
                {entry.amount_due! / 100}
              </td>
              <td
                className={classNames(
                  'text-sm  text-center',
                  entry.status === 'paid' ? ' text-green-500' : 'text-gray-800'
                )}
              >
                {entry.status}
              </td>
              <td className="text-sm text-center">
                {entry.invoice_pdf && (
                  <Link
                    to={entry.invoice_pdf}
                    className="text-brand-500 font-semibold"
                  >
                    Download
                  </Link>
                )}
                {/* <button
                  className="text-brand-500 font-semibold"
                  onClick={() => downloadInvoice(entry.latest_invoice)}
                >
                  {entry.latest_invoice && 'Download'}
                </button> */}
              </td>
            </tr>
          ))}
      </tbody>
    </table>
  );
};
