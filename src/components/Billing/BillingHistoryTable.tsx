import { ReactElement } from 'react';

interface BillingHistoryTableProps {
  history: Record<string, string>[];
}

export const BillingHistoryTable = (
  props: BillingHistoryTableProps
): ReactElement => {
  const { history } = props;

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
        {history.map((entry, index) => (
          <tr key={index}>
            <td className="text-sm text-gray-900 font-medium py-2 text-left">
              {entry.date}
            </td>
            <td className="text-sm text-gray-900 font-medium text-center">
              {entry.amount}
            </td>
            <td className="text-sm text-green-500 text-center">
              {entry.status}
            </td>
            <td className="text-sm text-center">
              <button
                className="text-brand-500 font-semibold"
              >
                {entry.invoice}
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
