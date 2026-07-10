import type { DecryptResult } from "@/lib/e2ee";

// Renders a chat message body, or a clear localized fallback when the
// ciphertext cannot be opened on this device.
export function EncryptedBody({ result }: { result: DecryptResult }) {
  switch (result.status) {
    case "ok":
      return <span className="whitespace-pre-wrap break-words">{result.text}</span>;
    case "loading":
      return (
        <span className="italic opacity-60">🔒 جارٍ تجهيز مفاتيح التشفير…</span>
      );
    case "not-for-me":
      return (
        <span className="italic opacity-70" title="أُنشئ المفتاح في متصفح آخر">
          🔒 لا يمكن فك هذه الرسالة على هذا الجهاز — استخدم المتصفح الذي بدأت
          فيه المحادثة.
        </span>
      );
    case "corrupt":
      return <span className="italic text-red-300/80">⚠️ رسالة تالفة أو غير قابلة للقراءة</span>;
    case "empty":
      return <span className="italic opacity-50">—</span>;
  }
}