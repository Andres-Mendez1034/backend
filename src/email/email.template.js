/* =========================================================
   EMAIL TEMPLATES — BrandConnect
========================================================= */

/* =========================================================
   PAYMENT CONFIRMATION TEMPLATE
   Soporta dos modos:
     · Colaboración negociada (planLabel NO empieza con "Plan")
     · Plan de suscripción      (planLabel empieza  con "Plan")
========================================================= */
export const paymentConfirmationTemplate = ({
  userName,
  planLabel,   // ej: "Colaboración negociada · 2 semanas" | "Plan Pro"
  planPrice,   // ej: "COP 1.500.000" | "USD 49"
  orderId,
  paidAt,
}) => {
  const fecha = new Date(paidAt).toLocaleDateString("es-CO", {
    year:  "numeric",
    month: "long",
    day:   "numeric",
  });

  // Detectar si es oferta negociada o plan de suscripción
  const isOffer    = !planLabel.toLowerCase().startsWith("plan");
  const badgeTitle = isOffer ? "Colaboración adquirida" : "Plan activado";
  const subject    = isOffer ? planLabel : `Plan ${planLabel}`;
  const bodyText   = isOffer
    ? "Tu pago fue procesado exitosamente. La colaboración ha sido confirmada y el creador ha sido notificado para iniciar el trabajo."
    : "Tu pago fue procesado exitosamente. A continuación encontrarás el resumen de tu compra y la factura adjunta.";

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Confirmación de pago</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0"
          style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

          <!-- HEADER -->
          <tr>
            <td style="background:#0a0a0f;padding:32px 40px;text-align:center;">
              <p style="margin:0;font-size:22px;font-weight:800;color:#63ffb4;letter-spacing:-0.5px;">BrandConnect</p>
              <p style="margin:6px 0 0;font-size:13px;color:rgba(255,255,255,0.4);letter-spacing:0.08em;text-transform:uppercase;">
                Confirmación de pago
              </p>
            </td>
          </tr>

          <!-- BODY -->
          <tr>
            <td style="padding:40px;">

              <!-- Saludo -->
              <p style="margin:0 0 8px;font-size:15px;color:#6b7280;">
                Hola, <strong style="color:#111827;">${userName}</strong>
              </p>
              <p style="margin:0 0 32px;font-size:15px;color:#6b7280;line-height:1.6;">
                ${bodyText}
              </p>

              <!-- BADGE: tipo de servicio + precio -->
              <table width="100%" cellpadding="0" cellspacing="0"
                style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;margin-bottom:32px;">
                <tr>
                  <td style="padding:24px 28px;">
                    <p style="margin:0 0 4px;font-size:12px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.1em;">
                      ${badgeTitle}
                    </p>
                    <p style="margin:0;font-size:20px;font-weight:800;color:#111827;line-height:1.3;">
                      ${subject}
                    </p>
                  </td>
                  <td style="padding:24px 28px;text-align:right;vertical-align:middle;white-space:nowrap;">
                    <p style="margin:0 0 4px;font-size:12px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.1em;">
                      Total pagado
                    </p>
                    <p style="margin:0;font-size:24px;font-weight:800;color:#111827;">
                      ${planPrice}
                    </p>
                  </td>
                </tr>
              </table>

              <!-- DETALLES DE LA ORDEN -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;">
                    <span style="font-size:14px;color:#6b7280;">Número de orden</span>
                  </td>
                  <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;text-align:right;">
                    <span style="font-size:14px;color:#111827;font-weight:500;">#${orderId}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;">
                    <span style="font-size:14px;color:#6b7280;">Fecha de pago</span>
                  </td>
                  <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;text-align:right;">
                    <span style="font-size:14px;color:#111827;font-weight:500;">${fecha}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:10px 0;">
                    <span style="font-size:14px;color:#6b7280;">Estado</span>
                  </td>
                  <td style="padding:10px 0;text-align:right;">
                    <span style="display:inline-block;background:#dcfce7;color:#15803d;font-size:12px;font-weight:600;padding:3px 12px;border-radius:20px;">
                      ✓ Pagado
                    </span>
                  </td>
                </tr>
              </table>

              <!-- NOTA FINAL -->
              <p style="margin:0 0 6px;font-size:13px;color:#9ca3af;text-align:center;">
                La factura en PDF está adjunta a este correo.
              </p>
              <p style="margin:0;font-size:13px;color:#9ca3af;text-align:center;">
                ¿Tienes dudas? Escríbenos a
                <a href="mailto:soporte@brandconnect.co"
                  style="color:#6366f1;text-decoration:none;">soporte@brandconnect.co</a>
              </p>

            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background:#f9fafb;padding:20px 40px;text-align:center;border-top:1px solid #e5e7eb;">
              <p style="margin:0;font-size:12px;color:#9ca3af;">
                © ${new Date().getFullYear()} BrandConnect · Todos los derechos reservados
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>
  `.trim();
};

/* =========================================================
   VERIFICATION EMAIL TEMPLATE
========================================================= */
export const verificationEmailTemplate = ({ name, verifyUrl }) => `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Verifica tu cuenta</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0"
          style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

          <!-- HEADER -->
          <tr>
            <td style="background:#0a0a0f;padding:32px 40px;text-align:center;">
              <p style="margin:0;font-size:22px;font-weight:800;color:#63ffb4;letter-spacing:-0.5px;">BrandConnect</p>
              <p style="margin:6px 0 0;font-size:13px;color:rgba(255,255,255,0.4);letter-spacing:0.08em;text-transform:uppercase;">
                Verifica tu correo
              </p>
            </td>
          </tr>

          <!-- BODY -->
          <tr>
            <td style="padding:40px;">
              <p style="margin:0 0 8px;font-size:15px;color:#6b7280;">
                Hola, <strong style="color:#111827;">${name}</strong>
              </p>
              <p style="margin:0 0 32px;font-size:15px;color:#6b7280;line-height:1.6;">
                Gracias por registrarte en BrandConnect. Haz clic en el botón para verificar
                tu correo y continuar con la configuración de tu cuenta.
              </p>

              <!-- CTA -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
                <tr>
                  <td align="center">
                    <a href="${verifyUrl}"
                      style="display:inline-block;background:#63ffb4;color:#0a0a0f;font-size:15px;
                             font-weight:700;padding:14px 36px;border-radius:8px;text-decoration:none;
                             letter-spacing:-0.2px;">
                      Verificar mi cuenta
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 6px;font-size:13px;color:#9ca3af;text-align:center;">
                Este enlace expira en <strong>2 horas</strong>.
              </p>
              <p style="margin:0;font-size:13px;color:#9ca3af;text-align:center;">
                Si no creaste esta cuenta, ignora este correo.
              </p>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background:#f9fafb;padding:20px 40px;text-align:center;border-top:1px solid #e5e7eb;">
              <p style="margin:0;font-size:12px;color:#9ca3af;">
                © ${new Date().getFullYear()} BrandConnect · Todos los derechos reservados
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>
`.trim();