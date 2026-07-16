import { ReactElement } from 'react';
import { useTranslation } from '../../i18n/useTranslation';

interface BillingHistoryTableProps {
  history: Record<string, string>[];
}

export const BillingHistoryTable = (
  props: BillingHistoryTableProps
): ReactElement => {
  const { history } = props;
  const { t } = useTranslation();

  return (
    <table className="w-full overflow-x-auto scrollbar-hide">
      <thead>
        <tr>
          <th className="text-sm text-gray-600 text-left">
            {t('billingHistoryTable.date')}
          </th>
          <th className="text-sm text-gray-600 text-center">
            {t('billingHistoryTable.amount')}
          </th>
          <th className="text-sm text-gray-600 text-center">
            {t('billingHistoryTable.status')}
          </th>
          <th className="text-sm text-gray-600 text-center">
            {t('billingHistoryTable.invoice')}
          </th>
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
