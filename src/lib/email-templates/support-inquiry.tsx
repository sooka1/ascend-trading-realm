import * as React from 'react'
import { Heading, Text } from '@react-email/components'
import { BrandedShell, styles } from './_shell'
import type { TemplateEntry } from './registry'

interface SupportInquiryProps {
  kind: 'complaint' | 'suggestion' | 'contact'
  name: string
  email: string
  subject?: string
  message: string
  userId?: string
  source?: string
}

const KIND_LABEL: Record<SupportInquiryProps['kind'], string> = {
  complaint: 'Complaint',
  suggestion: 'Suggestion',
  contact: 'Contact',
}

export const SupportInquiryEmail = ({
  kind,
  name,
  email,
  subject,
  message,
  userId,
  source,
}: SupportInquiryProps) => (
  <BrandedShell preview={`${KIND_LABEL[kind]} from ${name}`}>
    <Heading style={styles.h1}>
      New {KIND_LABEL[kind]} — HKEX
    </Heading>
    <Text style={styles.text}>
      <strong>From:</strong> {name} &lt;{email}&gt;
    </Text>
    {subject ? (
      <Text style={styles.text}>
        <strong>Subject:</strong> {subject}
      </Text>
    ) : null}
    {message.split('\n').map((line, i) => (
      <Text key={i} style={styles.text}>
        {line}
      </Text>
    ))}
    <Text style={styles.footer}>
      Source: {source ?? 'unknown'} {userId ? `· user ${userId}` : ''}
    </Text>
  </BrandedShell>
)

export const template = {
  component: SupportInquiryEmail,
  subject: (d: Record<string, any>) => {
    const label = KIND_LABEL[(d?.kind as SupportInquiryProps['kind']) ?? 'contact']
    const s = d?.subject ? ` — ${d.subject}` : ''
    return `[HKEX ${label}]${s}`
  },
  displayName: 'Support Inquiry',
  previewData: {
    kind: 'complaint',
    name: 'Jane Investor',
    email: 'jane@example.com',
    subject: 'Withdrawal issue',
    message: 'I have a question about my last withdrawal.',
    source: 'portal/support',
  },
} satisfies TemplateEntry

export default SupportInquiryEmail