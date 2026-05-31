import PDFDocument from "pdfkit";
import transporter from "./email.client.js";
import { paymentConfirmationTemplate } from "./email.template.js";

/* =========================================================
   GENERATE PDF INVOICE (in memory)
========================================================= */
const generateInvoicePDF = ({ userName, userEmail, planLabel, planPrice, orderId, paidAt }) => {
  return new Promise((resolve, reject) => {
    const doc    = new PDFDocument({ margin: 50, size: "A4" });
    const chunks = [];

    doc.on("data",  (chunk) => chunks.push(chunk));
    doc.on("end",   () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const fecha = new Date(paidAt).toLocaleDateString("es-CO", {
      year: "numeric", month: "long", day: "numeric",
    });

    // ── Header ──
    doc
      .fontSize(22).font("Helvetica-Bold")
      .fillColor("#0a0a0f")
      .text("BrandConnect", 50, 50);

    doc
      .fontSize(10).font("Helvetica")
      .fillColor("#6b7280")
      .text("Plataforma de marketing con microinfluencers", 50, 78);

    // ── Divider ──
    doc.moveTo(50, 105).lineTo(545, 105).strokeColor("#e5e7eb").stroke();

    // ── Título factura ──
    doc
      .fontSize(28).font("Helvetica-Bold")
      .fillColor("#111827")
      .text("FACTURA", 50, 125);

    doc
      .fontSize(11).font("Helvetica")
      .fillColor("#6b7280")
      .text(`Orden #${orderId}`, 50, 162)
      .text(`Fecha: ${fecha}`, 50, 178);

    // ── Info cliente ──
    doc
      .fontSize(11).font("Helvetica-Bold")
      .fillColor("#111827")
      .text("Facturado a:", 350, 125);

    doc
      .fontSize(11).font("Helvetica")
      .fillColor("#374151")
      .text(userName,   350, 142)
      .text(userEmail,  350, 158);

    // ── Tabla ──
    const tableTop = 230;

    doc
      .fillColor("#f9fafb")
      .rect(50, tableTop, 495, 36).fill();

    doc
      .fontSize(10).font("Helvetica-Bold")
      .fillColor("#6b7280")
      .text("DESCRIPCIÓN",  60,  tableTop + 12)
      .text("CANTIDAD",     340, tableTop + 12)
      .text("TOTAL",        460, tableTop + 12);

    doc
      .moveTo(50, tableTop + 36).lineTo(545, tableTop + 36)
      .strokeColor("#e5e7eb").stroke();

    const rowY = tableTop + 52;

    doc
      .fontSize(11).font("Helvetica")
      .fillColor("#111827")
      .text(`Plan ${planLabel} — BrandConnect`, 60,  rowY)
      .text("1",                                  340, rowY)
      .text(planPrice,                             460, rowY);

    doc
      .moveTo(50, rowY + 28).lineTo(545, rowY + 28)
      .strokeColor("#e5e7eb").stroke();

    // ── Total ──
    doc
      .fontSize(12).font("Helvetica-Bold")
      .fillColor("#111827")
      .text("TOTAL",    380, rowY + 44)
      .text(planPrice,  460, rowY + 44);

    // ── Estado ──
    doc
      .fontSize(10).font("Helvetica-Bold")
      .fillColor("#15803d")
      .text("✓ PAGADO", 50, rowY + 44);

    // ── Footer ──
    doc
      .fontSize(9).font("Helvetica")
      .fillColor("#9ca3af")
      .text(
        `© ${new Date().getFullYear()} BrandConnect · Este documento es una factura válida de compra.`,
        50, 750, { align: "center", width: 495 }
      );

    doc.end();
  });
};

/* =========================================================
   SEND PAYMENT CONFIRMATION EMAIL
========================================================= */
export const sendPaymentConfirmationEmail = async ({
  userName,
  userEmail,
  planLabel,
  planPrice,
  orderId,
  paidAt,
}) => {
  try {
    // 1. Generar PDF
    const pdfBuffer = await generateInvoicePDF({
      userName,
      userEmail,
      planLabel,
      planPrice,
      orderId,
      paidAt,
    });

    // 2. Generar HTML del correo
    const html = paymentConfirmationTemplate({
      userName,
      planLabel,
      planPrice,
      orderId,
      paidAt,
    });

    // 3. Enviar
    await transporter.sendMail({
      from:    process.env.SMTP_FROM,
      to:      userEmail,
      subject: `✅ Confirmación de pago — Plan ${planLabel} activado`,
      html,
      attachments: [
        {
          filename:    `factura-brandconnect-${orderId}.pdf`,
          content:     pdfBuffer,
          contentType: "application/pdf",
        },
      ],
    });

    console.log(`📧 Email enviado a ${userEmail}`);
  } catch (err) {
    // No bloqueamos el flujo principal si falla el email
    console.error("🔥 EMAIL ERROR:", err.message);
  }
};