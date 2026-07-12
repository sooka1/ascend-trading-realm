// Predefined KYC rejection categories. The `label` is user-facing (localized
// Arabic); it is safe to expose. `internalNote` is admin-only free text and
// MUST NOT be shown to the end user.
export const KYC_REJECTION_REASONS = [
  { code: "document_unclear",   label: "صور الهوية غير واضحة" },
  { code: "id_expired",         label: "الوثيقة منتهية الصلاحية" },
  { code: "address_failed",     label: "فشل التحقق من العنوان" },
  { code: "selfie_mismatch",    label: "الصورة الشخصية لا تطابق الهوية" },
  { code: "additional_docs",    label: "مستندات إضافية مطلوبة" },
  { code: "other",              label: "سبب آخر" },
] as const;

export type KycRejectionCode = typeof KYC_REJECTION_REASONS[number]["code"];

export function kycRejectionLabel(code: string): string {
  return KYC_REJECTION_REASONS.find((r) => r.code === code)?.label ?? code;
}
