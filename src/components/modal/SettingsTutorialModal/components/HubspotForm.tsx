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

interface FormInputs {
  firstname: string;
  lastname: string;
  email: string;
  company: string;
  message: string;
}

const SUBMIT_API = 'https://api.hsforms.com/submissions/v3/integration/submit';

export const HubspotForm = () => {
  const currentUser = useAppStore((s) => s.currentUser);

  const enabled =
    String(import.meta.env.VITE_HUBSPOT_ENABLED || '').toLowerCase() === 'true';
  const portalId = String(import.meta.env.VITE_HUBSPOT_PORTAL_ID || '').trim();
  const formId = String(
    import.meta.env.VITE_HUBSPOT_FORM_ID_TUTORIAL || ''
  ).trim();

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

  const onSubmit: SubmitHandler<FormInputs> = async (data) => {
    if (!enabled || !portalId || !formId) {
      setSubmitState({
        status: 'error',
        message: 'Booking is not configured on this install.',
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
          message:
            'Online booking is temporarily unavailable. Please email hello@ethora.com or message us on the forum and we will schedule a call.',
        });
        return;
      }
      setSubmitState({
        status: 'error',
        message:
          serverMsg ||
          'Sorry, we could not submit your request. Please email hello@ethora.com instead.',
      });
    } catch (e: unknown) {
      const err = e as { message?: string };
      setSubmitState({
        status: 'error',
        message:
          err?.message ||
          'Network error - please email hello@ethora.com instead.',
      });
    }
  };

  if (submitState.status === 'success') {
    return (
      <div className="font-sans text-sm text-gray-700">
        <p className="mb-2 font-semibold text-brand-500">
          Thanks - we'll be in touch!
        </p>
        <p>
          Our team will reach out shortly to schedule a call. In the meantime
          feel free to keep exploring.
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
            placeholder="First name"
            className={fieldClass(!!errors.firstname)}
            {...register('firstname', { required: true })}
          />
        </div>
        <div>
          <input
            type="text"
            placeholder="Last name"
            className={fieldClass(!!errors.lastname)}
            {...register('lastname', { required: true })}
          />
        </div>
      </div>
      <div>
        <input
          type="email"
          placeholder="Email"
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
          placeholder="Company"
          className={fieldClass(false)}
          {...register('company')}
        />
      </div>
      <div>
        <textarea
          placeholder="What would you like to discuss? (optional)"
          rows={3}
          className={fieldClass(false)}
          {...register('message')}
        />
      </div>

      {submitState.status === 'error' && (
        <p className="text-sm text-red-600">{submitState.message}</p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-xl bg-brand-500 text-white hover:bg-brand-darker font-sans text-sm py-3 disabled:opacity-50"
      >
        {isSubmitting ? 'Sending...' : 'Request a call'}
      </button>
    </form>
  );
};
