import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import qrcode from 'qrcode';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface ReservationPayload {
  id: number;
  status: string;
  total_amount: number;
  check_in: string;
  check_out: string;
  guest_id: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    contact_number: string | null;
  };
}

// Initialize the Nodemailer transporter using Gmail SMTP with App Password
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function POST(request: Request) {
  try {
    const body = await request.json() as { reservationId: string | number };
    const { reservationId } = body;

    if (!reservationId) {
      return NextResponse.json(
        { error: 'Missing reservationId.' },
        { status: 400 }
      );
    }

    if (!API_BASE_URL) {
      return NextResponse.json(
        { error: 'Missing API configuration.' },
        { status: 500 }
      );
    }

    // 1. Fetch reservation + guest data from Directus (backed by MySQL guests_hos table)
    const staticToken = process.env.DIRECTUS_STATIC_TOKEN;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(staticToken ? { Authorization: `Bearer ${staticToken}` } : {}),
    };

    const reservationRes = await fetch(
      `${API_BASE_URL}/items/reservations_hos/${reservationId}?fields=id,status,total_amount,check_in,check_out,guest_id.id,guest_id.first_name,guest_id.last_name,guest_id.email,guest_id.contact_number`,
      { headers }
    );

    if (!reservationRes.ok) {
      const errorText = await reservationRes.text();
      console.error('❌ Directus reservation fetch failed:', errorText);
      return NextResponse.json(
        { error: `Failed to fetch reservation #${reservationId} from database.` },
        { status: 404 }
      );
    }

    const reservationJson = await reservationRes.json() as { data: ReservationPayload };
    const reservation = reservationJson.data;

    if (!reservation || !reservation.guest_id) {
      return NextResponse.json(
        { error: `Reservation #${reservationId} has no linked guest record.` },
        { status: 404 }
      );
    }

    // 2. Resolve guest details from the database response
    const guest = reservation.guest_id;
    const guestName = `${guest.first_name || ''} ${guest.last_name || ''}`.trim() || 'Valued Guest';
    const email = guest.email;
    const totalAmount = Number(reservation.total_amount) || 0;
    const checkIn = reservation.check_in || '';
    const checkOut = reservation.check_out || '';

    if (!email) {
      return NextResponse.json(
        { error: `Guest #${guest.id} has no email address on file.` },
        { status: 400 }
      );
    }

    // 3. Define the routing URL path embedded within the QR code matrix
    const verificationUrl = `http://localhost:3000/hotel-landing-page/booking/success?reservationId=${reservationId}`;

    // 4. Generate the QR code as a Base64 Data URL string
    const qrCodeDataUrl = await qrcode.toDataURL(verificationUrl, {
      errorCorrectionLevel: 'H',
      margin: 1,
      width: 250,
      color: {
        dark: '#111827',
        light: '#FFFFFF'
      }
    });

    // Extract the raw base64 string body by stripping out the standard metadata header prefix
    const base64ImageBytes = qrCodeDataUrl.split(';base64,').pop();
    if (!base64ImageBytes) {
      throw new Error('Failed to process generated QR code matrix serialization layout.');
    }

    // 5. Compose the email payload options structure
    const mailOptions = {
      from: `"Vertex Hotel" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: `Booking Confirmed! Your Stay is Secured (Ref: #${reservationId})`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, sans-serif; background-color: #f9fafb; margin: 0; padding: 30px 15px; color: #1f2937; }
            .container { max-width: 550px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 30px; }
            .header { text-align: center; border-bottom: 1px solid #f3f4f6; padding-bottom: 20px; }
            .status-badge { display: inline-block; background-color: #ecfdf5; color: #065f46; font-size: 13px; font-weight: 600; padding: 4px 12px; border-radius: 9999px; text-transform: uppercase; }
            .details-box { background-color: #f9fafb; border-radius: 6px; padding: 15px; margin: 20px 0; }
            .details-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px; border-bottom: 1px dashed #e5e7eb; }
            .details-row:last-child { border-bottom: none; font-weight: bold; }
            .qr-wrapper { text-align: center; margin: 25px 0; padding: 15px; border: 1px solid #f3f4f6; border-radius: 6px; background-color: #ffffff; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="status-badge">Reservation Confirmed</div>
              <h2 style="margin: 10px 0 0 0;">Your Stay is Secured</h2>
              <p>Hi ${guestName}, your payment was processed successfully.</p>
            </div>
            
            <div class="details-box">
              <div class="details-row"><span>Reference Code:</span> <span>#${reservationId}</span></div>
              <div class="details-row"><span>Check-In:</span> <span>${checkIn}</span></div>
              <div class="details-row"><span>Check-Out:</span> <span>${checkOut}</span></div>
              <div class="details-row"><span>Amount Paid:</span> <span>PHP ${totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></div>
            </div>

            <div class="qr-wrapper">
              <img src="cid:reservation-qrcode" alt="Verification QR Pass" width="180" height="180" style="display: block; margin: 0 auto;" />
              <p style="font-size: 12px; color: #6b7280; margin: 8px 0 0 0;">Present this digital check-in pass voucher upon arrival</p>
            </div>
          </div>
        </body>
        </html>
      `,
      // 6. Embed the generated binary image attachment directly into the message body
      attachments: [
        {
          filename: `reservation-${reservationId}-qrcode.png`,
          content: base64ImageBytes,
          encoding: 'base64' as const,
          cid: 'reservation-qrcode' // Must completely match the <img src="cid:reservation-qrcode" /> attribute tag above
        }
      ]
    };

    // 7. Fire the email request payload
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Booking email sent to ${email} (Message ID: ${info.messageId})`);
    return NextResponse.json({ success: true, messageId: info.messageId });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal error encountered inside email subsystem.';
    console.error('❌ Email send failed:', message);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}