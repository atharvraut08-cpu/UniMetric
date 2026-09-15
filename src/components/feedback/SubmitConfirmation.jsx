import { CheckCircle, X } from 'lucide-react';

/**
 * Animated success confirmation banner shown after form submission.
 * @param {Function} onDismiss - called to close the banner
 */
export default function SubmitConfirmation({ onDismiss }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 animate-slide-in-right">
      <div className="flex items-start gap-4 px-5 py-4 rounded-xl border border-emerald-500/30 bg-slate-900/95 backdrop-blur shadow-2xl max-w-sm">
        <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
          <CheckCircle className="w-5 h-5 text-emerald-400" />
        </div>
        <div className="flex-1">
          <p className="text-white font-semibold text-sm">Feedback Submitted!</p>
          <p className="text-slate-400 text-xs mt-0.5">
            Thank you for your review. Your feedback helps future students make better decisions.
          </p>
        </div>
        <button
          onClick={onDismiss}
          className="text-slate-500 hover:text-white transition-colors flex-shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
