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
    <span className="mt-1 flex items-center gap-1 text-[9px] opacity-70">
      <Lock className="h-2.5 w-2.5" />
      <span>مشفّرة</span>
      {mine && (
        <>
          <span className="opacity-60">·</span>
          {delivered ? (
            <>
              <CheckCheck className="h-2.5 w-2.5 text-emerald-400" />
              <span>متاحة لـ{counterpartyLabel}</span>
            </>
          ) : (
            <>
              <Clock className="h-2.5 w-2.5 text-amber-400" />
              <span>لم يتم تسليمها بعد</span>
            </>
          )}
        </>
      )}
      {!mine && (
        <>
          <span className="opacity-60">·</span>
          <Check className="h-2.5 w-2.5 text-emerald-400" />
          <span>مستلمة</span>
        </>
      )}
    </span>
  );
}