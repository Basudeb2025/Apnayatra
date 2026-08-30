import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.utils import formataddr
from dotenv import load_dotenv
import os

load_dotenv()

def send_booking_email_to_user(to_email, customer_name, hotel_name, booking_id, check_in_date, no_of_days):
    # Sender email credentials
    sender_email = os.getenv("Sender_email")
    sender_password = os.getenv("App_password")  # Use App Password, not your Gmail password

    # Create the email
    subject = f"Booking Confirmation - {hotel_name}"

    body = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Booking Confirmation</title>
    </head>

    <body style="
        margin: 0;
        padding: 0;
        background-color: #f4f6f8;
        font-family: Arial, Helvetica, sans-serif;
        color: #333333;
    ">

        <table width="100%" cellpadding="0" cellspacing="0" border="0"
            style="background-color: #f4f6f8; padding: 30px 10px;">

            <tr>
                <td align="center">

                    <!-- Main Container -->
                    <table width="600" cellpadding="0" cellspacing="0" border="0"
                        style="
                            max-width: 600px;
                            width: 100%;
                            background-color: #ffffff;
                            border-radius: 10px;
                            overflow: hidden;
                            box-shadow: 0 2px 8px rgba(0,0,0,0.08);
                        ">

                        <!-- Header -->
                        <tr>
                            <td style="
                                background-color: #1f6feb;
                                padding: 28px 30px;
                                text-align: center;
                            ">
                                <h1 style="
                                    margin: 0;
                                    color: #ffffff;
                                    font-size: 26px;
                                    font-weight: 600;
                                ">
                                    ApnaYatra
                                </h1>

                                <p style="
                                    margin: 8px 0 0;
                                    color: #eaf2ff;
                                    font-size: 14px;
                                ">
                                    Travel. Stay. Explore.
                                </p>
                            </td>
                        </tr>

                        <!-- Confirmation -->
                        <tr>
                            <td style="padding: 35px 35px 20px; text-align: center;">

                                <div style="
                                    display: inline-block;
                                    background-color: #e8f7ee;
                                    color: #16803c;
                                    padding: 8px 18px;
                                    border-radius: 20px;
                                    font-size: 14px;
                                    font-weight: 600;
                                ">
                                    ✓ BOOKING CONFIRMED
                                </div>

                                <h2 style="
                                    margin: 20px 0 8px;
                                    color: #222222;
                                    font-size: 24px;
                                ">
                                    Your reservation is confirmed!
                                </h2>

                                <p style="
                                    margin: 0;
                                    color: #666666;
                                    font-size: 15px;
                                    line-height: 1.6;
                                ">
                                    Dear {customer_name},<br>
                                    Thank you for choosing us. Your hotel reservation
                                    has been successfully confirmed.
                                </p>

                            </td>
                        </tr>

                        <!-- Booking ID -->
                        <tr>
                            <td style="padding: 10px 35px 25px;">

                                <table width="100%" cellpadding="0" cellspacing="0" border="0"
                                    style="
                                        background-color: #f7f9fc;
                                        border: 1px solid #e1e5ea;
                                        border-radius: 8px;
                                    ">

                                    <tr>
                                        <td style="
                                            padding: 18px;
                                            text-align: center;
                                        ">

                                            <p style="
                                                margin: 0 0 6px;
                                                color: #777777;
                                                font-size: 12px;
                                                text-transform: uppercase;
                                                letter-spacing: 1px;
                                            ">
                                                Booking ID
                                            </p>

                                            <p style="
                                                margin: 0;
                                                color: #1f6feb;
                                                font-size: 20px;
                                                font-weight: bold;
                                            ">
                                                {booking_id}
                                            </p>

                                        </td>
                                    </tr>

                                </table>

                            </td>
                        </tr>

                        <!-- Booking Details -->
                        <tr>
                            <td style="padding: 0 35px 30px;">

                                <h3 style="
                                    margin: 0 0 18px;
                                    color: #222222;
                                    font-size: 18px;
                                ">
                                    Booking Details
                                </h3>

                                <table width="100%" cellpadding="0" cellspacing="0" border="0">

                                    <tr>
                                        <td style="
                                            padding: 12px 0;
                                            border-bottom: 1px solid #eeeeee;
                                            color: #777777;
                                            font-size: 14px;
                                        ">
                                            Hotel
                                        </td>

                                        <td style="
                                            padding: 12px 0;
                                            border-bottom: 1px solid #eeeeee;
                                            text-align: right;
                                            color: #222222;
                                            font-size: 14px;
                                            font-weight: 600;
                                        ">
                                            {hotel_name}
                                        </td>
                                    </tr>

                                    <tr>
                                        <td style="
                                            padding: 12px 0;
                                            border-bottom: 1px solid #eeeeee;
                                            color: #777777;
                                            font-size: 14px;
                                        ">
                                            Check-in Date
                                        </td>

                                        <td style="
                                            padding: 12px 0;
                                            border-bottom: 1px solid #eeeeee;
                                            text-align: right;
                                            color: #222222;
                                            font-size: 14px;
                                            font-weight: 600;
                                        ">
                                            {check_in_date}
                                        </td>
                                    </tr>

                                    <tr>
                                        <td style="
                                            padding: 12px 0;
                                            border-bottom: 1px solid #eeeeee;
                                            color: #777777;
                                            font-size: 14px;
                                        ">
                                            Duration
                                        </td>

                                        <td style="
                                            padding: 12px 0;
                                            border-bottom: 1px solid #eeeeee;
                                            text-align: right;
                                            color: #222222;
                                            font-size: 14px;
                                            font-weight: 600;
                                        ">
                                            {no_of_days} days
                                        </td>
                                    </tr>

                                </table>

                            </td>
                        </tr>

                        <!-- Important Notice -->
                        <tr>
                            <td style="padding: 0 35px 30px;">

                                <table width="100%" cellpadding="0" cellspacing="0" border="0"
                                    style="
                                        background-color: #fff8e6;
                                        border-left: 4px solid #f5b942;
                                        border-radius: 4px;
                                    ">

                                    <tr>
                                        <td style="
                                            padding: 14px 16px;
                                            color: #6b5700;
                                            font-size: 13px;
                                            line-height: 1.6;
                                        ">
                                            <strong>Important:</strong>
                                            Please keep your Booking ID handy when
                                            contacting the hotel or our support team.
                                        </td>
                                    </tr>

                                </table>

                            </td>
                        </tr>

                        <!-- Footer Message -->
                        <tr>
                            <td style="
                                padding: 5px 35px 35px;
                                text-align: center;
                            ">

                                <p style="
                                    margin: 0 0 8px;
                                    color: #333333;
                                    font-size: 15px;
                                ">
                                    We hope you have a wonderful stay!
                                </p>

                                <p style="
                                    margin: 0;
                                    color: #777777;
                                    font-size: 13px;
                                    line-height: 1.6;
                                ">
                                    Thank you for booking with ApnaYatra.
                                    <br>
                                    We look forward to helping you travel better.
                                </p>

                            </td>
                        </tr>

                        <!-- Footer -->
                        <tr>
                            <td style="
                                background-color: #f7f9fc;
                                padding: 18px 30px;
                                text-align: center;
                                border-top: 1px solid #eeeeee;
                            ">

                                <p style="
                                    margin: 0;
                                    color: #999999;
                                    font-size: 12px;
                                    line-height: 1.6;
                                ">
                                    This is an automated booking confirmation email.
                                    Please do not reply directly to this message.
                                </p>

                                <p style="
                                    margin: 6px 0 0;
                                    color: #aaaaaa;
                                    font-size: 11px;
                                ">
                                    © 2026 ApnaYatra. All rights reserved.
                                </p>

                            </td>
                        </tr>

                    </table>

                </td>
            </tr>

        </table>

    </body>
    </html>
    """

    msg = MIMEMultipart("alternative")
    msg["From"] = formataddr(("ApnaYatra", sender_email))
    msg["To"] = to_email
    msg["Subject"] = subject

    msg.attach(MIMEText(body, "html"))

    try:
        server = smtplib.SMTP("s", 7)
        server.starttls()
        server.login(sender_email, sender_password)
        server.sendmail(sender_email, to_email, msg.as_string())
        server.quit()

        print("Booking confirmation email sent successfully!")

    except Exception as e:
        print(f"Error sending email: {e}")


# result = send_booking_email_to_user("subhashisroy28@gmail.com", "Basudeb Roy", "Superstar", "12368", "24-08-2026", 2)
# print(result)
