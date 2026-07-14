import * as React from 'react'
import { createAuthEmailHandler } from '@lovable.dev/email-js'
import { createFileRoute } from '@tanstack/react-router'
import { SignupEmail } from '@/lib/email-templates/signup'
import { InviteEmail } from '@/lib/email-templates/invite'
import { MagicLinkEmail } from '@/lib/email-templates/magic-link'
import { RecoveryEmail } from '@/lib/email-templates/recovery'
import { EmailChangeEmail } from '@/lib/email-templates/email-change'
import { ReauthenticationEmail } from '@/lib/email-templates/reauthentication'

// Configuration
const SITE_NAME = "HKEX"
const SENDER_DOMAIN = "notify.hkexinvest.com"
const ROOT_DOMAIN = "hkexinvest.com"
const FROM_DOMAIN = "hkexinvest.com"
const SITE_URL = `https://${ROOT_DOMAIN}`

function isPasswordResetFlow(data: { url?: string | null; callback_url?: string | null }) {
  const haystack = [data.url, data.callback_url]
    .filter(Boolean)
    .map((value) => {
      try {
        return decodeURIComponent(String(value)).toLowerCase()
      } catch {
        return String(value).toLowerCase()
      }
    })
    .join(' ')

  return haystack.includes('/reset-password')
}

function getLoginOtp(data: { token?: string | null; new_token?: string | null }) {
  return data.token ?? data.new_token ?? ''
}

// The SDK handler owns verification, dispatch, and retry semantics; this file
// owns only the email decisions: subjects, templates, and per-type props.
const handler = createAuthEmailHandler({
  apiKey: process.env.LOVABLE_API_KEY!,
  from: `${SITE_NAME} <noreply@${FROM_DOMAIN}>`,
  senderDomain: SENDER_DOMAIN,
  sendUrl: process.env.LOVABLE_SEND_URL,
  emails: {
    signup: {
      subject: 'Confirm your email',
      render: (data) =>
        React.createElement(SignupEmail, {
          siteName: SITE_NAME,
          siteUrl: SITE_URL,
          recipient: data.email,
          confirmationUrl: data.url,
        }),
    },
    invite: {
      subject: "You've been invited",
      render: (data) =>
        React.createElement(InviteEmail, {
          siteName: SITE_NAME,
          siteUrl: SITE_URL,
          confirmationUrl: data.url,
        }),
    },
    magiclink: (data) => {
      const token = getLoginOtp(data)
      return {
        subject: token ? `Your HKEX login code ${token}` : 'Your HKEX login code',
        element: React.createElement(MagicLinkEmail, {
          siteName: SITE_NAME,
          token,
        }),
      }
    },
    recovery: (data) => {
      const token = getLoginOtp(data)
      if (!isPasswordResetFlow(data)) {
        return {
          subject: token ? `Your HKEX login code ${token}` : 'Your HKEX login code',
          element: React.createElement(MagicLinkEmail, {
            siteName: SITE_NAME,
            token,
          }),
        }
      }

      return {
        subject: 'Reset your password',
        element: React.createElement(RecoveryEmail, {
          siteName: SITE_NAME,
          confirmationUrl: data.url,
        }),
      }
    },
    email_change: {
      subject: 'Confirm your new email',
      render: (data) =>
        React.createElement(EmailChangeEmail, {
          siteName: SITE_NAME,
          oldEmail: data.old_email ?? '',
          email: data.email,
          newEmail: data.new_email ?? '',
          confirmationUrl: data.url,
        }),
    },
    reauthentication: {
      subject: 'Your verification code',
      render: (data) =>
        React.createElement(ReauthenticationEmail, { token: data.token ?? '' }),
    },
  },
})

export const Route = createFileRoute("/lovable/email/auth/webhook")({
  server: {
    handlers: {
      POST: ({ request }) => handler(request),
    },
  },
})
