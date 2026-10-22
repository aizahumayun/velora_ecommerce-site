import nodemailer from 'nodemailer';
import { config } from '../config.js';

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };
    return entities[character];
  });
}

export interface EmailOrderSummary {
  id: string;
  orderNumber?: string;
  createdAt: string | Date;
  customerName?: string;
  customerEmail?: string;
  items: Array<{
    name: string;
    color: string;
    size: string;
    quantity: number;
    price: number;
  }>;
  subtotal: number;
  shippingCost: number;
  tax?: number;
  estimatedTax?: number;
  total: number;
  shippingAddress?: {
    firstName?: string;
    lastName?: string;
    address?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  estimatedDelivery?: string;
}

export interface EmailResult {
  sent: boolean;
  message: string;
}

export const emailService = {
  /**
   * Check whether SMTP credentials have been provided in the environment
   */
  isConfigured(): boolean {
    return Boolean(config.email.host && config.email.user && config.email.pass);
  },

  /**
   * Dispatches an order confirmation email to the customer if SMTP is configured.
   * If credentials are unavailable, logs a notice and returns an unconfigured status.
   */
  async sendOrderConfirmationEmail(order: EmailOrderSummary): Promise<EmailResult> {
    if (!this.isConfigured()) {
      const notice = `[Email Service] SMTP credentials not configured (SMTP_HOST/SMTP_USER/SMTP_PASS). Order confirmation email dispatch for order ${order.orderNumber || order.id} remains unconfigured.`;
      console.log(notice);
      return {
        sent: false,
        message: 'Order confirmation email remains unconfigured: SMTP environment variables are not set.',
      };
    }

    try {
      const transporter = nodemailer.createTransport({
        host: config.email.host,
        port: config.email.port,
        secure: config.email.secure,
        auth: {
          user: config.email.user,
          pass: config.email.pass,
        },
      });

      const recipient = order.customerEmail;
      if (!recipient) {
        return {
          sent: false,
          message: 'Recipient customer email was missing.',
        };
      }

      const orderRef = order.orderNumber || order.id;
      const itemsHtml = order.items
        .map(
          (item) => `
          <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #C9C1B1; font-size: 13px; color: #1B2632;">
              <strong>${escapeHtml(item.name)}</strong><br>
              <span style="font-size: 11px; color: #55606E;">Color: ${escapeHtml(item.color)} | Size: ${escapeHtml(item.size)}</span>
            </td>
            <td style="padding: 12px 0; border-bottom: 1px solid #C9C1B1; text-align: center; font-size: 13px; color: #1B2632;">
              ${item.quantity}
            </td>
            <td style="padding: 12px 0; border-bottom: 1px solid #C9C1B1; text-align: right; font-size: 13px; color: #1B2632; font-family: monospace;">
              $${(item.price * item.quantity).toFixed(2)}
            </td>
          </tr>`
        )
        .join('');

      const html = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #EEE9DF; padding: 40px 20px; color: #1B2632;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border: 1px solid #C9C1B1; padding: 36px 32px;">
            <div style="text-align: center; border-bottom: 1px solid #C9C1B1; padding-bottom: 24px; margin-bottom: 28px;">
              <h1 style="font-size: 26px; letter-spacing: 4px; text-transform: uppercase; margin: 0 0 8px; color: #1B2632;">VELORA</h1>
              <p style="font-size: 13px; color: #55606E; margin: 0;">Contemporary Wardrobe Essentials</p>
            </div>
            
            <p style="font-size: 14px; margin-bottom: 16px;">Dear ${escapeHtml(order.customerName || 'Valued Client')},</p>
            <p style="font-size: 13px; line-height: 1.6; color: #2C3B4D;">
              Thank you for choosing VELORA. We have received your order and our atelier has begun processing it.
            </p>

            <div style="background-color: #EEE9DF; border: 1px solid #C9C1B1; padding: 14px 18px; margin: 24px 0; font-size: 12px;">
              <strong>Order Reference:</strong> <span style="font-family: monospace;">${escapeHtml(orderRef)}</span><br>
              <strong>Estimated Delivery:</strong> ${escapeHtml(order.estimatedDelivery || '3–5 business days')}
            </div>

            <table style="width: 100%; border-collapse: collapse; margin: 24px 0;">
              <thead>
                <tr style="border-bottom: 2px solid #1B2632; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #1B2632;">
                  <th style="padding-bottom: 8px;">Garment</th>
                  <th style="padding-bottom: 8px; text-align: center;">Qty</th>
                  <th style="padding-bottom: 8px; text-align: right;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>

            <div style="border-top: 1px solid #C9C1B1; padding-top: 16px; margin-top: 24px; font-size: 13px; text-align: right;">
              <p style="margin: 4px 0; color: #55606E;">Subtotal: <strong>$${order.subtotal.toFixed(2)}</strong></p>
              <p style="margin: 4px 0; color: #55606E;">Shipping: <strong>$${order.shippingCost.toFixed(2)}</strong></p>
              <p style="margin: 4px 0; color: #55606E;">Estimated Tax: <strong>$${((order.tax ?? order.estimatedTax) || 0).toFixed(2)}</strong></p>
              <h3 style="font-size: 18px; margin: 12px 0 0; color: #1B2632;">Grand Total: $${order.total.toFixed(2)}</h3>
            </div>

            <div style="border-top: 1px solid #C9C1B1; margin-top: 32px; padding-top: 20px; font-size: 11px; color: #55606E; text-align: center;">
              If you have any questions, our client advisors are available at concierge@velora-studio.com.
            </div>
          </div>
        </div>
      `;

      await transporter.sendMail({
        from: config.email.from,
        to: recipient,
        subject: `Order Confirmation: ${orderRef} - VELORA`,
        html,
      });

      console.log(`[Email Service] Order confirmation email successfully dispatched to ${recipient} for order ${orderRef}`);
      return {
        sent: true,
        message: `Order confirmation email dispatched to ${recipient}`,
      };
    } catch (error: any) {
      console.error('[Email Service] Failed to send order confirmation email:', error?.message || error);
      return {
        sent: false,
        message: `Email sending failed: ${error?.message || 'SMTP transport error'}`,
      };
    }
  },
};

export default emailService;
