import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'


// GET /api/invoices/[id]/export - Export invoice as PDF
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const invoiceId = parseInt(params.id)
    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') || 'pdf' // pdf, html, json

    // Fetch invoice with all related data
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            company: true
          }
        },
        branch: {
          select: {
            id: true,
            name: true,
            address: true,
            phone: true,
            email: true,
            city: true,
            state: true,
            zipCode: true
          }
        },
        items: true,
        payments: {
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!invoice) {
      return NextResponse.json(
        { success: false, error: 'Invoice not found' },
        { status: 404 }
      )
    }

    switch (format) {
      case 'html':
        return generateHTMLInvoice(invoice)
      case 'json':
        return NextResponse.json({
          success: true,
          data: invoice
        })
      case 'pdf':
      default:
        return generatePDFInvoice(invoice)
    }
  } catch (error) {
    console.error('Error exporting invoice:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to export invoice' },
      { status: 500 }
    )
  }
}

function generateHTMLInvoice(invoice: any) {
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Invoice ${invoice.invoiceNumber}</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 20px;
                color: #333;
            }
            .header {
                display: flex;
                justify-content: space-between;
                margin-bottom: 30px;
                border-bottom: 2px solid #e5e7eb;
                padding-bottom: 20px;
            }
            .company-info h1 {
                margin: 0;
                color: #1f2937;
                font-size: 28px;
            }
            .company-info p {
                margin: 5px 0;
                color: #6b7280;
            }
            .invoice-info {
                text-align: right;
            }
            .invoice-info h2 {
                margin: 0;
                color: #1f2937;
                font-size: 24px;
            }
            .invoice-info p {
                margin: 5px 0;
                color: #6b7280;
            }
            .billing-info {
                display: flex;
                justify-content: space-between;
                margin-bottom: 30px;
            }
            .billing-section h3 {
                margin: 0 0 10px 0;
                color: #1f2937;
                font-size: 16px;
            }
            .billing-section p {
                margin: 3px 0;
                color: #6b7280;
            }
            .items-table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 30px;
            }
            .items-table th,
            .items-table td {
                border: 1px solid #e5e7eb;
                padding: 12px;
                text-align: left;
            }
            .items-table th {
                background-color: #f9fafb;
                font-weight: 600;
                color: #1f2937;
            }
            .items-table .text-right {
                text-align: right;
            }
            .totals {
                width: 100%;
                max-width: 300px;
                margin-left: auto;
            }
            .totals-row {
                display: flex;
                justify-content: space-between;
                padding: 8px 0;
                border-bottom: 1px solid #e5e7eb;
            }
            .totals-row.total {
                font-weight: 600;
                font-size: 18px;
                color: #1f2937;
                border-top: 2px solid #e5e7eb;
                border-bottom: none;
                margin-top: 10px;
                padding-top: 15px;
            }
            .status {
                display: inline-block;
                padding: 4px 12px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: 600;
                text-transform: uppercase;
            }
            .status.paid { background-color: #dcfce7; color: #166534; }
            .status.pending { background-color: #fef3c7; color: #92400e; }
            .status.overdue { background-color: #fee2e2; color: #991b1b; }
            .status.draft { background-color: #f3f4f6; color: #374151; }
            .footer {
                margin-top: 40px;
                padding-top: 20px;
                border-top: 1px solid #e5e7eb;
                text-align: center;
                color: #6b7280;
                font-size: 14px;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <div class="company-info">
                <h1>${invoice.branch.name}</h1>
                <p>${invoice.branch.address}</p>
                <p>${invoice.branch.city}, ${invoice.branch.state} ${invoice.branch.zipCode}</p>
                <p>Phone: ${invoice.branch.phone || 'N/A'}</p>
                <p>Email: ${invoice.branch.email || 'N/A'}</p>
            </div>
            <div class="invoice-info">
                <h2>INVOICE</h2>
                <p><strong>Invoice #:</strong> ${invoice.invoiceNumber}</p>
                <p><strong>Issue Date:</strong> ${new Date(invoice.issueDate).toLocaleDateString()}</p>
                <p><strong>Due Date:</strong> ${new Date(invoice.dueDate).toLocaleDateString()}</p>
                <p><strong>Status:</strong> <span class="status ${invoice.status.toLowerCase()}">${invoice.status}</span></p>
            </div>
        </div>

        <div class="billing-info">
            <div class="billing-section">
                <h3>Bill To:</h3>
                <p><strong>${invoice.customer.name}</strong></p>
                ${invoice.customer.company ? `<p>${invoice.customer.company}</p>` : ''}
                <p>${invoice.customer.email}</p>
                ${invoice.customer.phone ? `<p>${invoice.customer.phone}</p>` : ''}
            </div>
        </div>

        <table class="items-table">
            <thead>
                <tr>
                    <th>Description</th>
                    <th class="text-right">Quantity</th>
                    <th class="text-right">Unit Price</th>
                    <th class="text-right">Amount</th>
                </tr>
            </thead>
            <tbody>
                ${invoice.items.map((item: any) => `
                    <tr>
                        <td>${item.description}</td>
                        <td class="text-right">${item.quantity}</td>
                        <td class="text-right">Rs ${item.unitPrice.toFixed(2)}</td>
                        <td class="text-right">Rs ${item.amount.toFixed(2)}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>

        <div class="totals">
            <div class="totals-row">
                <span>Subtotal:</span>
                <span>Rs ${invoice.subtotal.toFixed(2)}</span>
            </div>
            ${invoice.taxRate > 0 ? `
                <div class="totals-row">
                    <span>Tax (${invoice.taxRate}%):</span>
                    <span>Rs ${invoice.taxAmount.toFixed(2)}</span>
                </div>
            ` : ''}
            <div class="totals-row total">
                <span>Total:</span>
                <span>Rs ${invoice.total.toFixed(2)}</span>
            </div>
        </div>

        ${invoice.payments.length > 0 ? `
            <div style="margin-top: 30px;">
                <h3>Payment History</h3>
                <table class="items-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Method</th>
                            <th>Amount</th>
                            <th>Reference</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${invoice.payments.map((payment: any) => `
                            <tr>
                                <td>${new Date(payment.paidAt).toLocaleDateString()}</td>
                                <td>${payment.method}</td>
                                <td class="text-right">Rs ${payment.amount.toFixed(2)}</td>
                                <td>${payment.reference || 'N/A'}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        ` : ''}

        ${invoice.notes ? `
            <div style="margin-top: 30px;">
                <h3>Notes</h3>
                <p>${invoice.notes}</p>
            </div>
        ` : ''}

        <div class="footer">
            <p>Thank you for your business!</p>
            <p>Generated on ${new Date().toLocaleDateString()}</p>
        </div>
    </body>
    </html>
  `

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html',
      'Content-Disposition': `attachment; filename="invoice-${invoice.invoiceNumber}.html"`
    }
  })
}

async function generatePDFInvoice(invoice: any) {
  // For PDF generation, we'll use a simple approach
  // In a production environment, you might want to use libraries like Puppeteer or jsPDF
  
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Invoice ${invoice.invoiceNumber}</title>
        <style>
            @media print {
                body { margin: 0; }
                .no-print { display: none; }
            }
            body {
                font-family: Arial, sans-serif;
                margin: 20px;
                color: #333;
            }
            .header {
                display: flex;
                justify-content: space-between;
                margin-bottom: 30px;
                border-bottom: 2px solid #e5e7eb;
                padding-bottom: 20px;
            }
            .company-info h1 {
                margin: 0;
                color: #1f2937;
                font-size: 28px;
            }
            .company-info p {
                margin: 5px 0;
                color: #6b7280;
            }
            .invoice-info {
                text-align: right;
            }
            .invoice-info h2 {
                margin: 0;
                color: #1f2937;
                font-size: 24px;
            }
            .invoice-info p {
                margin: 5px 0;
                color: #6b7280;
            }
            .billing-info {
                margin-bottom: 30px;
            }
            .billing-section h3 {
                margin: 0 0 10px 0;
                color: #1f2937;
                font-size: 16px;
            }
            .billing-section p {
                margin: 3px 0;
                color: #6b7280;
            }
            .items-table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 30px;
            }
            .items-table th,
            .items-table td {
                border: 1px solid #e5e7eb;
                padding: 12px;
                text-align: left;
            }
            .items-table th {
                background-color: #f9fafb;
                font-weight: 600;
                color: #1f2937;
            }
            .items-table .text-right {
                text-align: right;
            }
            .totals {
                width: 100%;
                max-width: 300px;
                margin-left: auto;
            }
            .totals-row {
                display: flex;
                justify-content: space-between;
                padding: 8px 0;
                border-bottom: 1px solid #e5e7eb;
            }
            .totals-row.total {
                font-weight: 600;
                font-size: 18px;
                color: #1f2937;
                border-top: 2px solid #e5e7eb;
                border-bottom: none;
                margin-top: 10px;
                padding-top: 15px;
            }
            .status {
                display: inline-block;
                padding: 4px 12px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: 600;
                text-transform: uppercase;
            }
            .status.paid { background-color: #dcfce7; color: #166534; }
            .status.pending { background-color: #fef3c7; color: #92400e; }
            .status.overdue { background-color: #fee2e2; color: #991b1b; }
            .status.draft { background-color: #f3f4f6; color: #374151; }
            .footer {
                margin-top: 40px;
                padding-top: 20px;
                border-top: 1px solid #e5e7eb;
                text-align: center;
                color: #6b7280;
                font-size: 14px;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <div class="company-info">
                <h1>${invoice.branch.name}</h1>
                <p>${invoice.branch.address}</p>
                <p>${invoice.branch.city}, ${invoice.branch.state} ${invoice.branch.zipCode}</p>
                <p>Phone: ${invoice.branch.phone || 'N/A'}</p>
                <p>Email: ${invoice.branch.email || 'N/A'}</p>
            </div>
            <div class="invoice-info">
                <h2>INVOICE</h2>
                <p><strong>Invoice #:</strong> ${invoice.invoiceNumber}</p>
                <p><strong>Issue Date:</strong> ${new Date(invoice.issueDate).toLocaleDateString()}</p>
                <p><strong>Due Date:</strong> ${new Date(invoice.dueDate).toLocaleDateString()}</p>
                <p><strong>Status:</strong> <span class="status ${invoice.status.toLowerCase()}">${invoice.status}</span></p>
            </div>
        </div>

        <div class="billing-info">
            <div class="billing-section">
                <h3>Bill To:</h3>
                <p><strong>${invoice.customer.name}</strong></p>
                ${invoice.customer.company ? `<p>${invoice.customer.company}</p>` : ''}
                <p>${invoice.customer.email}</p>
                ${invoice.customer.phone ? `<p>${invoice.customer.phone}</p>` : ''}
            </div>
        </div>

        <table class="items-table">
            <thead>
                <tr>
                    <th>Description</th>
                    <th class="text-right">Quantity</th>
                    <th class="text-right">Unit Price</th>
                    <th class="text-right">Amount</th>
                </tr>
            </thead>
            <tbody>
                ${invoice.items.map((item: any) => `
                    <tr>
                        <td>${item.description}</td>
                        <td class="text-right">${item.quantity}</td>
                        <td class="text-right">Rs ${item.unitPrice.toFixed(2)}</td>
                        <td class="text-right">Rs ${item.amount.toFixed(2)}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>

        <div class="totals">
            <div class="totals-row">
                <span>Subtotal:</span>
                <span>Rs ${invoice.subtotal.toFixed(2)}</span>
            </div>
            ${invoice.taxRate > 0 ? `
                <div class="totals-row">
                    <span>Tax (${invoice.taxRate}%):</span>
                    <span>Rs ${invoice.taxAmount.toFixed(2)}</span>
                </div>
            ` : ''}
            <div class="totals-row total">
                <span>Total:</span>
                <span>Rs ${invoice.total.toFixed(2)}</span>
            </div>
        </div>

        ${invoice.payments.length > 0 ? `
            <div style="margin-top: 30px;">
                <h3>Payment History</h3>
                <table class="items-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Method</th>
                            <th>Amount</th>
                            <th>Reference</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${invoice.payments.map((payment: any) => `
                            <tr>
                                <td>${new Date(payment.paidAt).toLocaleDateString()}</td>
                                <td>${payment.method}</td>
                                <td class="text-right">Rs ${payment.amount.toFixed(2)}</td>
                                <td>${payment.reference || 'N/A'}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        ` : ''}

        ${invoice.notes ? `
            <div style="margin-top: 30px;">
                <h3>Notes</h3>
                <p>${invoice.notes}</p>
            </div>
        ` : ''}

        <div class="footer">
            <p>Thank you for your business!</p>
            <p>Generated on ${new Date().toLocaleDateString()}</p>
        </div>

        <div class="no-print" style="margin-top: 20px; text-align: center;">
            <button onclick="window.print()" style="padding: 10px 20px; background-color: #3b82f6; color: white; border: none; border-radius: 5px; cursor: pointer;">
                Print / Save as PDF
            </button>
        </div>
    </body>
    </html>
  `

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html',
      'Content-Disposition': `inline; filename="invoice-${invoice.invoiceNumber}.html"`
    }
  })
}
