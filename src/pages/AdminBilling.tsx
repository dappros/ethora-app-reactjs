import { useState } from 'react';
import { BookACallModal } from '../components/modal/BookACallModal';

export default function AdminBilling() {
  const [showBookACall, setShowBookACall] = useState(false);

  return (
    <div className="grid grid-rows-[auto,_1fr] gap-4 h-full">
      <div className="md:px-8 hidden md:flex flex-col justify-between items-stretch md:items-center md:flex-row md:min-h-[40px] gap-4">
        <div className="font-varela mb-4 text-[24px] md:mb-0 md:text-[34px] leading-none">
          Billing
        </div>
      </div>

      <div className="rounded-2xl bg-white p-4 md:p-8 overflow-y-auto">
        <div className="max-w-3xl">
          <h2 className="font-varela text-[20px] md:text-[24px] mb-4">
            You're on a Free plan
          </h2>
          <p className="font-sans text-base text-gray-700 mb-8 leading-relaxed">
            You're welcome to use our generous Free plan for as long as it fits
            your project.
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
        </div>
      </div>

      {showBookACall && (
        <BookACallModal onClose={() => setShowBookACall(false)} />
      )}
    </div>
  );
}
