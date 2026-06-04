import { useState } from 'react';
import { BookACallModal } from '../components/modal/BookACallModal';

export default function AdminBilling() {
  const [showBookACall, setShowBookACall] = useState(false);

  return (
    <div className="p-4 md:p-8 max-w-3xl">
      <h2 className="font-varela text-[24px] md:text-[28px] mb-4">
        You're on a Free plan
      </h2>
      <p className="font-sans text-base text-gray-700 mb-8 leading-relaxed">
        You're welcome to use our generous Free plan for as long as it fits your
        project.
      </p>

      <div className="rounded-2xl bg-gray-50 p-6 md:p-8">
        <h3 className="font-varela text-[18px] md:text-[20px] mb-3">
          Need a dedicated server, enterprise-grade SLA, or server-side
          customizations?
        </h3>
        <p className="font-sans text-sm text-gray-600 mb-5">
          Let's talk through your requirements and find the right fit.
        </p>
        <button
          type="button"
          onClick={() => setShowBookACall(true)}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-brand-500 text-white hover:bg-brand-darker font-sans text-sm"
        >
          Book a Call
        </button>
      </div>

      {showBookACall && (
        <BookACallModal onClose={() => setShowBookACall(false)} />
      )}
    </div>
  );
}
