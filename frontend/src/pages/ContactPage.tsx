import React, { useState } from 'react';
import { useAppDispatch } from '../store';
import { showToast } from '../store/slices/uiSlice';

export const ContactPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    orderNumber: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      dispatch(
        showToast({
          message: 'Message dispatched to VELORA Atelier',
          submessage: 'Our concierge team will respond within 24 business hours.',
        })
      );
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#EEE9DF] text-[#1B2632] pb-24">
      {/* Header */}
      <div className="border-b border-[#C9C1B1] bg-[#EEE9DF]">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-12 py-12 text-center">
          <span className="text-[11px] font-mono tracking-widest text-[#2C3B4D] uppercase">
            Client Concierge
          </span>
          <h1 className="font-editorial text-3xl sm:text-4xl text-[#1B2632] mt-2 mb-3">
            Contact &amp; Client Support
          </h1>
          <p className="text-xs sm:text-sm text-[#2C3B4D] font-sans leading-relaxed">
            Our atelier concierge is at your service for sizing advice, garment care guidance, order inquiries, or bespoke consultation.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-12 pt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Contact Information Column */}
          <div className="lg:col-span-5 space-y-8">
            <div className="bg-[#EEE9DF] border border-[#C9C1B1] p-6 sm:p-8 space-y-6">
              <h2 className="font-editorial text-xl text-[#1B2632] pb-3 border-b border-[#C9C1B1]/60">
                Atelier Assistance
              </h2>

              <div className="space-y-4 text-xs font-sans text-[#2C3B4D]">
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-wider text-[#2C3B4D] mb-1">
                    Client Care Email
                  </p>
                  <a
                    href="mailto:concierge@velora-studio.com"
                    className="text-[#1B2632] font-semibold hover:underline text-sm"
                  >
                    concierge@velora-studio.com
                  </a>
                  <p className="text-[11px] text-[#2C3B4D]/80 mt-0.5">Response within 24 hours</p>
                </div>

                <div>
                  <p className="font-mono text-[11px] uppercase tracking-wider text-[#2C3B4D] mb-1">
                    Telephone Concierge
                  </p>
                  <a
                    href="tel:+18008356721"
                    className="text-[#1B2632] font-semibold hover:underline text-sm"
                  >
                    +1 (800) 835-6721
                  </a>
                  <p className="text-[11px] text-[#2C3B4D]/80 mt-0.5">Monday – Friday: 9am – 6pm EST</p>
                </div>

                <div>
                  <p className="font-mono text-[11px] uppercase tracking-wider text-[#2C3B4D] mb-1">
                    Atelier Locations
                  </p>
                  <p className="text-[#1B2632] font-medium text-sm">Milan &bull; New York</p>
                  <p className="text-[11px] text-[#2C3B4D]/80 mt-0.5">Via Monte Napoleone &bull; Mercer Street</p>
                </div>
              </div>

              <div className="pt-4 border-t border-[#C9C1B1]/60">
                <div className="p-4 bg-[#C9C1B1]/20 border border-[#C9C1B1] text-xs font-sans text-[#2C3B4D] space-y-1">
                  <p className="font-semibold text-[#1B2632]">Complimentary Virtual Sizing</p>
                  <p className="text-[11px] text-[#2C3B4D]">
                    Unsure which size suits your silhouette? Provide your measurements in the message for tailored fit recommendations.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Form Column */}
          <div className="lg:col-span-7">
            <div className="bg-[#EEE9DF] border border-[#C9C1B1] p-6 sm:p-10 shadow-xs">
              <h2 className="font-editorial text-2xl text-[#1B2632] mb-2">Send a Message</h2>
              <p className="text-xs text-[#2C3B4D] font-sans mb-8">
                Please complete the form below. We will review and respond promptly.
              </p>

              {submitted ? (
                <div className="py-12 text-center space-y-4">
                  <div className="w-14 h-14 rounded-full bg-[#1B2632] text-[#EEE9DF] flex items-center justify-center mx-auto">
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="font-editorial text-2xl text-[#1B2632]">Thank You, {formData.name}</h3>
                  <p className="text-xs text-[#2C3B4D] font-sans max-w-sm mx-auto leading-relaxed">
                    Your inquiry has been received by our client service team. A confirmation has been recorded.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({ name: '', email: '', orderNumber: '', subject: '', message: '' });
                    }}
                    className="px-6 py-2.5 bg-[#1B2632] text-[#EEE9DF] hover:bg-[#2C3B4D] text-xs font-mono uppercase tracking-wider transition-colors mt-2"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-[#1B2632] mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Eleanor Vance"
                        className="w-full px-3.5 py-2.5 text-xs bg-[#EEE9DF] border border-[#C9C1B1] focus:outline-none focus:border-[#1B2632] font-sans text-[#1B2632]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[#1B2632] mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="e.g. eleanor@example.com"
                        className="w-full px-3.5 py-2.5 text-xs bg-[#EEE9DF] border border-[#C9C1B1] focus:outline-none focus:border-[#1B2632] font-sans text-[#1B2632]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-[#1B2632] mb-1">
                        Order Number (Optional)
                      </label>
                      <input
                        type="text"
                        value={formData.orderNumber}
                        onChange={(e) => setFormData({ ...formData, orderNumber: e.target.value })}
                        placeholder="e.g. VEL-89421"
                        className="w-full px-3.5 py-2.5 text-xs bg-[#EEE9DF] border border-[#C9C1B1] focus:outline-none focus:border-[#1B2632] font-sans font-mono text-[#1B2632]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[#1B2632] mb-1">
                        Subject *
                      </label>
                      <select
                        required
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="w-full px-3.5 py-2.5 text-xs bg-[#EEE9DF] border border-[#C9C1B1] focus:outline-none focus:border-[#1B2632] font-sans text-[#1B2632]"
                      >
                        <option value="">Select subject topic...</option>
                        <option value="Sizing & Fit Advice">Sizing &amp; Fit Advice</option>
                        <option value="Order Status & Delivery">Order Status &amp; Delivery</option>
                        <option value="Returns & Exchanges">Returns &amp; Exchanges</option>
                        <option value="Fabric & Garment Care">Fabric &amp; Garment Care</option>
                        <option value="General Inquiries">General Inquiries</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#1B2632] mb-1">
                      Message *
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="How may our concierge assist you today?"
                      className="w-full p-3.5 text-xs bg-[#EEE9DF] border border-[#C9C1B1] focus:outline-none focus:border-[#1B2632] font-sans leading-relaxed text-[#1B2632]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto px-10 py-3.5 bg-[#1B2632] text-[#EEE9DF] hover:bg-[#2C3B4D] disabled:opacity-50 text-xs tracking-widest uppercase font-medium transition-colors"
                  >
                    {isSubmitting ? 'Transmitting...' : 'Send Message'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
