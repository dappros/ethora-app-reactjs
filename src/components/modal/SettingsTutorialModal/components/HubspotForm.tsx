// Book-a-Call form. We POST directly to HubSpot's Forms Submission API
// instead of embedding HubSpot's hbspt.forms.create() widget because:
//
// 1. The Book-a-Demo form on prod is a "Forms 2.0" form which the legacy
//    v2 embed could only render inside a cross-origin iframe. That meant
//    onFormReady couldn't reach inputs from the parent doc, so JS-side
//    prefill silently no-op'd (the user reported repeatedly that the
//    First Name / Last Name / Email fields stayed blank even though we
//    have all three on the logged-in user).
// 2. The iframe embed adds ~600KB of HubSpot's bundle + a network round
//    trip every time the modal opens; the user flagged the load delay.
//
// This component renders a native React form (prefilled from currentUser),
// submits to api.hsforms.com/submissions/v3/integration/submit, and shows
// an inline thank-you. From HubSpot's side, submissions land in the same
// form's "Submissions" view as if they came from the embed.

import { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useAppStore } from '../../../../store/useAppStore';
import { useTranslation } from '../../../../i18n/useTranslation';

interface FormInputs {
  firstname: string;
  lastname: string;
  email: string;
  company: string;
  message: string;
}

const SUBMIT_API = 'https://api.hsforms.com/submissions/v3/integration/submit';

export const HubspotForm = () => {
  const { t } = useTranslation();
  const currentUser = useAppStore((s) => s.currentUser);

  const enabled =
    String(import.meta.env.VITE_HUBSPOT_ENABLED || '').toLowerCase() === 'true';
  const portalId = String(import.meta.env.VITE_HUBSPOT_PORTAL_ID || '').trim();
  const formId = String(
    import.meta.env.VITE_HUBSPOT_FORM_ID_TUTORIAL || ''
  ).trim();
  const isConfigured = enabled && !!portalId && !!formId;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormInputs>({
    defaultValues: {
      firstname: currentUser?.firstName || '',
      lastname: currentUser?.lastName || '',
      email: currentUser?.email || '',
      company: '',
      message: '',
    },
  });

  const [submitState, setSubmitState] = useState<{
    status: 'idle' | 'success' | 'error';
    message?: string;
  }>({ status: 'idle' });

  // We always render the form (even when HubSpot isn't configured on this
  // install) so the UI is identical across environments - QA can exercise
  // the same shape users see on prod. If the env vars are missing, submit
  // surfaces the "not configured + email us" notice as the error state
  // instead of pretending to POST.
  const onSubmit: SubmitHandler<FormInputs> = async (data) => {
    if (!isConfigured) {
      setSubmitState({
        status: 'error',
        message: t('hubspotForm.notConfiguredError'),
      });
      return;
    }
    const payload = {
      fields: [
        { objectTypeId: '0-1', name: 'firstname', value: data.firstname },
        { objectTypeId: '0-1', name: 'lastname', value: data.lastname },
        { objectTypeId: '0-1', name: 'email', value: data.email },
        { objectTypeId: '0-1', name: 'company', value: data.company },
        { objectTypeId: '0-1', name: 'message', value: data.message },
      ].filter((f) => f.value && f.value.length > 0),
      context: {
        pageUri: typeof window !== 'undefined' ? window.location.href : '',
        pageName: typeof document !== 'undefined' ? document.title : '',
      },
    };

    try {
      const res = await fetch(`${SUBMIT_API}/${portalId}/${formId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setSubmitState({ status: 'success' });
        return;
      }
      // HubSpot returns a structured error with errorType. The one we
      // care about specially is FORM_HAS_RECAPTCHA_ENABLED: the form on
      // the portal has spam-prevention turned on, which blocks API
      // submissions. Surface a clear next-step rather than a raw 400.
      let errorType = '';
      let serverMsg = '';
      try {
        const json = await res.json();
        errorType = String(
          json?.errors?.[0]?.errorType || json?.errorType || ''
        );
        serverMsg = String(json?.message || '');
      } catch {
        /* not JSON */
      }
      if (errorType === 'FORM_HAS_RECAPTCHA_ENABLED') {
        setSubmitState({
          status: 'error',
          message: t('hubspotForm.recaptchaError'),
        });
        return;
      }
      setSubmitState({
        status: 'error',
        message: serverMsg || t('hubspotForm.genericError'),
      });
    } catch (e: unknown) {
      const err = e as { message?: string };
      setSubmitState({
        status: 'error',
        message: err?.message || t('hubspotForm.networkError'),
      });
    }
  };

  if (submitState.status === 'success') {
    return (
      <div className="font-sans text-sm text-gray-700">
        <p className="mb-2 font-semibold text-brand-500">
          {t('hubspotForm.successTitle')}
        </p>
        <p>
          {t('hubspotForm.successBody')}
        </p>
      </div>
    );
  }

  const fieldClass = (hasError: boolean) =>
    `rounded-xl bg-gray-100 py-2 px-4 w-full outline-none border-2 ${
      hasError ? 'border-red-500' : 'border-transparent focus:border-brand-500'
    }`;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <input
            type="text"
            placeholder={t('hubspotForm.firstNamePlaceholder')}
            className={fieldClass(!!errors.firstname)}
            {...register('firstname', { required: true })}
          />
        </div>
        <div>
          <input
            type="text"
            placeholder={t('hubspotForm.lastNamePlaceholder')}
            className={fieldClass(!!errors.lastname)}
            {...register('lastname', { required: true })}
          />
        </div>
      </div>
      <div>
        <input
          type="email"
          placeholder={t('hubspotForm.emailPlaceholder')}
          className={fieldClass(!!errors.email)}
          {...register('email', {
            required: true,
            pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
          })}
        />
      </div>
      <div>
        <input
          type="text"
          placeholder={t('hubspotForm.companyPlaceholder')}
          className={fieldClass(false)}
          {...register('company')}
        />
      </div>
      <div>
        <textarea
          placeholder={t('hubspotForm.messagePlaceholder')}
          rows={3}
          className={fieldClass(false)}
          {...register('message')}
        />
      </div>

      {submitState.status === 'error' && (
        <div className="text-sm text-red-600">
          <p>{submitState.message}</p>
          <a
            href="mailto:hello@ethora.com?subject=Book%20a%20call%20with%20the%20Ethora%20team"
            className="inline-block mt-2 underline text-brand-500"
          >
            {t('hubspotForm.emailLinkText')}
          </a>
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-xl bg-brand-500 text-white hover:bg-brand-darker font-sans text-sm py-3 disabled:opacity-50"
      >
        {isSubmitting ? t('hubspotForm.sendingButton') : t('hubspotForm.submitButton')}
      </button>
    </form>
  );
};
