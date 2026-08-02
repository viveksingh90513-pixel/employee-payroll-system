/**
 * PayRoll Pro – Payslip PDF Generator
 * Generates professional payslip PDFs using PDFKit.
 */

const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const { formatCurrency, getMonthName } = require('./helpers');

/**
 * Generate a payslip PDF for a payroll record.
 * @param {Object} payrollData - Complete payroll record with employee details
 * @returns {Promise<{ filePath: string, fileName: string }>}
 */
const generatePayslip = async (payrollData) => {
  return new Promise((resolve, reject) => {
    try {
      const {
        id, employee_id, month, year, working_days, present_days, leave_days, absent_days,
        basic_pay, hra, da, ta, medical_allowance, special_allowance, total_earnings,
        pf_deduction, esi_deduction, tax_deduction, professional_tax, other_deductions,
        loss_of_pay, total_deductions, gross_pay, net_pay,
        first_name, last_name, emp_code, designation, department_name,
        bank_name, bank_account_no, pan_number, date_of_joining, email,
      } = payrollData;

      const payslipsDir = path.join(process.env.VERCEL ? '/tmp' : path.join(__dirname, '..'), 'payslips');
      try { if (!fs.existsSync(payslipsDir)) fs.mkdirSync(payslipsDir, { recursive: true }); } catch (e) { /* read-only fs */ }

      const fileName = `payslip_${emp_code}_${month}_${year}.pdf`;
      const filePath = path.join(payslipsDir, fileName);
      const doc = new PDFDocument({ size: 'A4', margin: 40 });
      const stream = fs.createWriteStream(filePath);

      doc.pipe(stream);

      const pageWidth = doc.page.width - 80; // Account for margins
      const companyName = process.env.COMPANY_NAME || 'PayRoll Pro Pvt. Ltd.';
      const companyAddress = process.env.COMPANY_ADDRESS || '123, Tech Park, Bangalore, Karnataka - 560001';

      // ─── Header Section ──────────────────────────────────
      // Company name
      doc.fontSize(20).font('Helvetica-Bold')
        .fillColor('#6366f1')
        .text(companyName, 40, 40, { align: 'center' });

      doc.fontSize(9).font('Helvetica')
        .fillColor('#666666')
        .text(companyAddress, 40, 65, { align: 'center' });

      // Payslip title
      doc.moveDown(0.5);
      const titleY = doc.y;
      doc.rect(40, titleY, pageWidth, 28)
        .fill('#6366f1');
      doc.fontSize(13).font('Helvetica-Bold')
        .fillColor('#ffffff')
        .text(`PAYSLIP – ${getMonthName(month).toUpperCase()} ${year}`, 40, titleY + 7, { align: 'center' });

      doc.moveDown(1.5);

      // ─── Employee Details Section ────────────────────────
      const detailsY = doc.y;
      doc.fontSize(10).font('Helvetica-Bold').fillColor('#333333');

      // Left column
      const leftX = 40;
      const rightX = pageWidth / 2 + 60;
      let currentY = detailsY;

      const addDetailRow = (label, value, x, y) => {
        doc.font('Helvetica-Bold').fillColor('#555555').text(label, x, y);
        doc.font('Helvetica').fillColor('#333333').text(value || '-', x + 120, y);
      };

      addDetailRow('Employee Name:', `${first_name} ${last_name}`, leftX, currentY);
      addDetailRow('Department:', department_name || '-', rightX, currentY);
      currentY += 18;

      addDetailRow('Employee Code:', emp_code, leftX, currentY);
      addDetailRow('Designation:', designation || '-', rightX, currentY);
      currentY += 18;

      addDetailRow('Date of Joining:', date_of_joining || '-', leftX, currentY);
      addDetailRow('PAN Number:', pan_number || '-', rightX, currentY);
      currentY += 18;

      addDetailRow('Bank Name:', bank_name || '-', leftX, currentY);
      addDetailRow('Account No:', bank_account_no || '-', rightX, currentY);
      currentY += 18;

      addDetailRow('Pay Period:', `${getMonthName(month)} ${year}`, leftX, currentY);
      addDetailRow('Email:', email || '-', rightX, currentY);
      currentY += 25;

      // ─── Attendance Summary ──────────────────────────────
      doc.rect(40, currentY, pageWidth, 22).fill('#f0f0ff');
      doc.fontSize(10).font('Helvetica-Bold').fillColor('#6366f1')
        .text('ATTENDANCE SUMMARY', 50, currentY + 5);
      currentY += 28;

      const attendanceItems = [
        { label: 'Working Days', value: working_days },
        { label: 'Present Days', value: present_days },
        { label: 'Leave Days', value: leave_days },
        { label: 'Absent Days', value: absent_days },
      ];

      const itemWidth = pageWidth / 4;
      attendanceItems.forEach((item, idx) => {
        const x = 40 + idx * itemWidth;
        doc.font('Helvetica').fontSize(8).fillColor('#888888')
          .text(item.label, x, currentY, { width: itemWidth, align: 'center' });
        doc.font('Helvetica-Bold').fontSize(12).fillColor('#333333')
          .text(String(item.value), x, currentY + 12, { width: itemWidth, align: 'center' });
      });
      currentY += 35;

      // ─── Earnings & Deductions Table ─────────────────────
      const tableY = currentY;
      const colWidth = pageWidth / 2;

      // Table headers
      doc.rect(40, tableY, colWidth, 22).fill('#6366f1');
      doc.rect(40 + colWidth, tableY, colWidth, 22).fill('#ef4444');

      doc.fontSize(10).font('Helvetica-Bold').fillColor('#ffffff')
        .text('EARNINGS', 50, tableY + 5, { width: colWidth - 20 })
        .text('DEDUCTIONS', 50 + colWidth, tableY + 5, { width: colWidth - 20 });

      currentY = tableY + 25;

      // Earnings data
      const earnings = [
        { label: 'Basic Salary', value: basic_pay },
        { label: 'HRA', value: hra },
        { label: 'Dearness Allowance', value: da },
        { label: 'Transport Allowance', value: ta },
        { label: 'Medical Allowance', value: medical_allowance },
        { label: 'Special Allowance', value: special_allowance },
      ];

      // Deductions data
      const deductions = [
        { label: 'Provident Fund (PF)', value: pf_deduction },
        { label: 'ESI', value: esi_deduction },
        { label: 'Income Tax (TDS)', value: tax_deduction },
        { label: 'Professional Tax', value: professional_tax },
        { label: 'Other Deductions', value: other_deductions },
        { label: 'Loss of Pay', value: loss_of_pay },
      ];

      const maxRows = Math.max(earnings.length, deductions.length);

      for (let i = 0; i < maxRows; i++) {
        // Alternate row background
        if (i % 2 === 0) {
          doc.rect(40, currentY - 2, pageWidth, 18).fill('#fafafa');
        }

        doc.fontSize(9).font('Helvetica').fillColor('#333333');

        if (earnings[i]) {
          doc.text(earnings[i].label, 50, currentY, { width: colWidth - 90 });
          doc.text(formatCurrency(earnings[i].value), 40 + colWidth - 90, currentY, { width: 80, align: 'right' });
        }

        if (deductions[i]) {
          doc.text(deductions[i].label, 50 + colWidth, currentY, { width: colWidth - 90 });
          doc.text(formatCurrency(deductions[i].value), pageWidth - 30, currentY, { width: 80, align: 'right' });
        }

        currentY += 18;
      }

      // Totals row
      currentY += 5;
      doc.rect(40, currentY, colWidth, 22).fill('#e0e7ff');
      doc.rect(40 + colWidth, currentY, colWidth, 22).fill('#fee2e2');

      doc.fontSize(10).font('Helvetica-Bold').fillColor('#333333');
      doc.text('Total Earnings', 50, currentY + 5);
      doc.text(formatCurrency(total_earnings), 40 + colWidth - 90, currentY + 5, { width: 80, align: 'right' });
      doc.text('Total Deductions', 50 + colWidth, currentY + 5);
      doc.text(formatCurrency(total_deductions), pageWidth - 30, currentY + 5, { width: 80, align: 'right' });

      currentY += 30;

      // ─── Net Pay Section ─────────────────────────────────
      doc.rect(40, currentY, pageWidth, 35).fill('#6366f1');
      doc.fontSize(14).font('Helvetica-Bold').fillColor('#ffffff')
        .text('NET PAY', 60, currentY + 9, { continued: true })
        .text(formatCurrency(net_pay), { align: 'right' });

      currentY += 50;

      // ─── Net Pay in Words ────────────────────────────────
      doc.fontSize(9).font('Helvetica').fillColor('#666666')
        .text(`Net Pay (in words): ${numberToWords(Math.round(parseFloat(net_pay)))} Rupees Only`, 40, currentY);

      currentY += 30;

      // ─── Footer ──────────────────────────────────────────
      doc.moveTo(40, currentY).lineTo(40 + pageWidth, currentY).stroke('#cccccc');
      currentY += 15;

      doc.fontSize(8).font('Helvetica').fillColor('#999999')
        .text('This is a computer-generated payslip and does not require a signature.', 40, currentY, { align: 'center' })
        .text(`Generated on: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`, 40, currentY + 14, { align: 'center' });

      // Finalize the document
      doc.end();

      stream.on('finish', () => {
        resolve({ filePath, fileName });
      });

      stream.on('error', reject);
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Convert a number to words (Indian numbering system).
 * @param {number} num
 * @returns {string}
 */
const numberToWords = (num) => {
  if (num === 0) return 'Zero';

  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const convert = (n) => {
    if (n < 20) return ones[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
    if (n < 1000) return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' and ' + convert(n % 100) : '');
    if (n < 100000) return convert(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + convert(n % 1000) : '');
    if (n < 10000000) return convert(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 ? ' ' + convert(n % 100000) : '');
    return convert(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 ? ' ' + convert(n % 10000000) : '');
  };

  return convert(num);
};

module.exports = { generatePayslip };
