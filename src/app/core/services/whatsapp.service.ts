import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class WhatsAppService {

  /** Sanitises a phone number to digits only (strips spaces, +, -, brackets).
   *  Prepends India country code 91 if no country code is present. */
  private sanitisePhone(phone: string): string {
    let digits = phone.replace(/\D/g, '');
    // If 10 digits assume India (+91)
    if (digits.length === 10) digits = '91' + digits;
    return digits;
  }

  /** Opens WhatsApp with a pre-filled message in a new tab. */
  private open(phone: string, message: string): void {
    const num = this.sanitisePhone(phone);
    const encoded = encodeURIComponent(message.trim());
    window.open(`https://wa.me/${num}?text=${encoded}`, '_blank');
  }

  /** Job Sheet status update notification */
  sendJobStatus(phone: string, customerName: string, jobId: number | string, device: string, status: string, companyName: string): void {
    const msg =
      `Hello ${customerName},\n\nYour repair job *#JOB-${jobId}* for *${device}* is now *${status}*.\n\nFor queries, feel free to contact us.\n\nRegards,\n${companyName}`;
    this.open(phone, msg);
  }

  /** Job ready-for-collection notification */
  sendCollectionReady(phone: string, customerName: string, jobId: number | string, device: string, finalCost: number | string, companyName: string): void {
    const msg =
      `Hello ${customerName},\n\nGreat news! Your *${device}* (Job #JOB-${jobId}) is ready for collection. 🎉\n\nFinal Amount: *₹${finalCost}*\n\nSee you soon!\n\nRegards,\n${companyName}`;
    this.open(phone, msg);
  }

  /** Quotation share */
  sendQuotation(phone: string, customerName: string, quoteId: number | string, amount: number | string, companyName: string): void {
    const msg =
      `Hello ${customerName},\n\nPlease find your quotation *#QT-${quoteId}* from *${companyName}*.\n\nTotal Amount: *₹${amount}*\n\nFeel free to contact us for any queries.\n\nRegards,\n${companyName}`;
    this.open(phone, msg);
  }

  /** Sales Invoice share */
  sendInvoice(phone: string, customerName: string, invoiceNumber: string, amount: number | string, companyName: string): void {
    const msg =
      `Hello ${customerName},\n\nThank you for your purchase! 🙏\n\nYour Tax Invoice *${invoiceNumber}* has been generated.\nTotal Amount: *₹${amount}*\n\nRegards,\n${companyName}`;
    this.open(phone, msg);
  }

  /** Receipt confirmation */
  sendReceipt(phone: string, customerName: string, receiptNumber: string, amount: number | string, companyName: string): void {
    const msg =
      `Hello ${customerName},\n\nWe have received your payment of *₹${amount}*. 🎉\nReceipt No: *${receiptNumber}*\n\nThank you for choosing us!\n\nRegards,\n${companyName}`;
    this.open(phone, msg);
  }

  /** Supplier payment notification */
  sendPaymentVoucher(phone: string, supplierName: string, paymentNumber: string, amount: number | string, companyName: string): void {
    const msg =
      `Hello ${supplierName},\n\nWe have processed a payment of *₹${amount}* to you.\nPayment Voucher: *${paymentNumber}*\n\nThank you for your partnership.\n\nRegards,\n${companyName}`;
    this.open(phone, msg);
  }
}
