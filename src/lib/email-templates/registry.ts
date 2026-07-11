import type { ComponentType } from 'react'
import { template as broadcastTemplate } from './broadcast'
import { template as welcomeTemplate } from './welcome'
import { template as depositConfirmationTemplate } from './deposit-confirmation'
import { template as withdrawalConfirmationTemplate } from './withdrawal-confirmation'
import { template as tradeAlertTemplate } from './trade-alert'
import { template as kycStatusTemplate } from './kyc-status'
import { template as securityAlertTemplate } from './security-alert'

export interface TemplateEntry {
  component: ComponentType<any>
  subject: string | ((data: Record<string, any>) => string)
  displayName?: string
  previewData?: Record<string, any>
  /** Fixed recipient — overrides caller-provided recipientEmail when set. */
  to?: string
}

/**
 * Template registry — maps template names to their React Email components.
 * Import and register new templates here after creating them in this directory.
 *
 * Example:
 *   import { template as welcomeTemplate } from './welcome'
 *   // then add to TEMPLATES: 'welcome': welcomeTemplate
 */
export const TEMPLATES: Record<string, TemplateEntry> = {
  broadcast: broadcastTemplate,
  welcome: welcomeTemplate,
  'deposit-confirmation': depositConfirmationTemplate,
  'withdrawal-confirmation': withdrawalConfirmationTemplate,
  'trade-alert': tradeAlertTemplate,
  'kyc-status': kycStatusTemplate,
  'security-alert': securityAlertTemplate,
}
