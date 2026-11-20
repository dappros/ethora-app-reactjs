// App Settings > Email reports: a pointer to Account > Email reports, where
// each person turns on their own digests and conversation emails. Nothing is
// set here: these emails are per person, not per App. A colleague gets them
// for this App once invited as an admin, hence the link to Users > Admins,
// where the collaborators panel and its invite button are.
import { Link, useParams } from 'react-router-dom';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import { useTranslation } from '../../i18n/useTranslation';

export function EmailReportsEntry() {
  const { t } = useTranslation();
  const { appId } = useParams();
  return (
    <section className="max-w-2xl p-1 md:p-4" data-testid="app-email-reports">
      <h2 className="text-lg font-semibold">{t('appEmailReports.title')}</h2>
      <p className="mt-2 text-sm text-gray-600">{t('appEmailReports.text')}</p>
      <Link
        to={`/app/account?tab=${encodeURIComponent('Email reports')}`}
        className="mt-4 inline-flex h-10 items-center gap-2 rounded-xl bg-brand-500 px-4 text-sm font-semibold text-white hover:bg-brand-darker"
        data-testid="app-email-reports-open"
      >
        <MailOutlineIcon sx={{ fontSize: 20 }} aria-hidden="true" />
        {t('appEmailReports.open')}
      </Link>
      {appId && (
        <p className="mt-4 text-sm text-gray-600" data-testid="app-email-reports-colleagues">
          {t('appEmailReports.colleagues')}{' '}
          <Link
            to={`/app/admin/apps/${appId}/users?access=admin`}
            className="text-brand-500 underline"
            data-testid="app-email-reports-invite"
          >
            {t('appEmailReports.invite')}
          </Link>
        </p>
      )}
    </section>
  );
}
