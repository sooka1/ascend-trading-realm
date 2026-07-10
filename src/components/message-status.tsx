import { Lock, Check, CheckCheck, Clock } from "lucide-react";

// Small status row shown under the timestamp inside a chat bubble.
// - Every message is E2EE, so the lock icon is always present.
// - "delivered" reflects whether the counterparty's encrypted copy exists.
export function MessageStatus({
  mine,
  delivered,
  counterpartyLabel = "السوبر ادمن",
}: {
  mine: boolean;
  delivered: boolean;
  counterpartyLabel?: string;
}) {
  return (
    <span className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[9px] opacity-75">
      <span className="inline-flex items-center gap-0.5">
        <Lock className="h-2.5 w-2.5" />
        مشفّرة
      </span>
      {mine ? (
        <>
          <span className="opacity-40">•</span>
          <span className="inline-flex items-center gap-0.5">
            <Check className="h-2.5 w-2.5" />
            أُرسلت
          </span>
          <span className="opacity-40">•</span>
          {delivered ? (
            <span className="inline-flex items-center gap-0.5 text-emerald-400">
              <CheckCheck className="h-3 w-3" />
              تم التسليم لـ{counterpartyLabel}
            </span>
          ) : (
            <span className="inline-flex items-center gap-0.5 text-amber-400">
              <Clock className="h-2.5 w-2.5" />
              بانتظار التسليم
            </span>
          )}
        </>
      ) : (
        <>
          <span className="opacity-40">•</span>
          <span className="inline-flex items-center gap-0.5 text-emerald-400">
            <CheckCheck className="h-3 w-3" />
            تم الاستلام
          </span>
        </>
      )}
    </span>
  );
}