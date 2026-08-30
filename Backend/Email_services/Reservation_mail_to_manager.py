import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.utils import formataddr
from dotenv import load_dotenv
import os

load_dotenv()

def send_reservation_email_to_manager(to_email, customer_name, hotel_name, customer_phone, check_in_date, no_of_rooms):
    # Sender email credentials
    sender_email = os.getenv("Sender_email")
    sender_password = os.getenv("App_password")

    subject = f"New Booking Received - {hotel_name}"

    body = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Booking Alert</title>
    </head>

    <body style="
        margin: 0;
        padding: 0;
        background-color: #eef1f5;
        font-family: Arial, Helvetica, sans-serif;
        color: #1f2937;
    ">

        <table width="100%" cellpadding="0" cellspacing="0" border="0"
            style="padding: 35px 15px; background-color: #eef1f5;">

            <tr>
                <td align="center">

                    <!-- Main Card -->
                    <table width="620" cellpadding="0" cellspacing="0" border="0"
                        style="
                            max-width: 620px;
                            width: 100%;
                            background-color: #ffffff;
                            border-radius: 12px;
                            overflow: hidden;
                            border: 1px solid #e1e5eb;
                        ">

                        <!-- Top Notification Bar -->
                        <tr>
                            <td style="
                                background-color: #111827;
                                padding: 20px 28px;
                            ">

                                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                    <tr>

                                        <td>
                                            <p style="
                                                margin: 0;
                                                color: #ffffff;
                                                font-size: 17px;
                                                font-weight: 700;
                                            ">
                                                Hotel Management
                                            </p>

                                            <p style="
                                                margin: 5px 0 0;
                                                color: #9ca3af;
                                                font-size: 12px;
                                            ">
                                                Booking Notification
                                            </p>
                                        </td>

                                        <td align="right">
                                            <span style="
                                                display: inline-block;
                                                padding: 7px 12px;
                                                background-color: #dcfce7;
                                                color: #166534;
                                                border-radius: 20px;
                                                font-size: 11px;
                                                font-weight: bold;
                                            ">
                                                NEW BOOKING
                                            </span>
                                        </td>

                                    </tr>
                                </table>

                            </td>
                        </tr>


                        <!-- Alert Section -->
                        <tr>
                            <td style="padding: 32px 32px 20px;">

                                <p style="
                                    margin: 0 0 8px;
                                    color: #6b7280;
                                    font-size: 13px;
                                    font-weight: 600;
                                    text-transform: uppercase;
                                    letter-spacing: 0.8px;
                                ">
                                    Booking Alert
                                </p>

                                <h1 style="
                                    margin: 0;
                                    color: #111827;
                                    font-size: 25px;
                                    line-height: 1.3;
                                ">
                                    A new reservation has been received.
                                </h1>

                                <p style="
                                    margin: 12px 0 0;
                                    color: #6b7280;
                                    font-size: 14px;
                                    line-height: 1.6;
                                ">
                                    A customer has successfully booked a room at
                                    <strong style="color: #374151;">
                                        {hotel_name}
                                    </strong>.
                                    Please review the booking details below.
                                </p>

                            </td>
                        </tr>


                        <!-- Customer Section -->
                        <tr>
                            <td style="padding: 10px 32px 25px;">

                                <h2 style="
                                    margin: 0 0 15px;
                                    font-size: 16px;
                                    color: #111827;
                                ">
                                    Customer Information
                                </h2>

                                <table width="100%" cellpadding="0" cellspacing="0" border="0">

                                    <!-- Customer Name -->
                                    <tr>
                                        <td style="
                                            width: 50%;
                                            padding: 16px;
                                            background-color: #f8fafc;
                                            border: 1px solid #e5e7eb;
                                            border-radius: 8px 0 0 8px;
                                        ">

                                            <p style="
                                                margin: 0 0 6px;
                                                color: #9ca3af;
                                                font-size: 11px;
                                                text-transform: uppercase;
                                                letter-spacing: 0.6px;
                                            ">
                                                Customer Name
                                            </p>

                                            <p style="
                                                margin: 0;
                                                color: #111827;
                                                font-size: 15px;
                                                font-weight: 600;
                                            ">
                                                {customer_name}
                                            </p>

                                        </td>

                                        <!-- Contact -->
                                        <td style="
                                            width: 50%;
                                            padding: 16px;
                                            background-color: #f8fafc;
                                            border: 1px solid #e5e7eb;
                                            border-left: 0;
                                            border-radius: 0 8px 8px 0;
                                        ">

                                            <p style="
                                                margin: 0 0 6px;
                                                color: #9ca3af;
                                                font-size: 11px;
                                                text-transform: uppercase;
                                                letter-spacing: 0.6px;
                                            ">
                                                Contact Number
                                            </p>

                                            <p style="
                                                margin: 0;
                                                color: #111827;
                                                font-size: 15px;
                                                font-weight: 600;
                                            ">
                                                {customer_phone}
                                            </p>

                                        </td>
                                    </tr>

                                </table>

                            </td>
                        </tr>


                        <!-- Reservation Summary -->
                        <tr>
                            <td style="padding: 0 32px 30px;">

                                <h2 style="
                                    margin: 0 0 15px;
                                    font-size: 16px;
                                    color: #111827;
                                ">
                                    Reservation Summary
                                </h2>

                                <table width="100%" cellpadding="0" cellspacing="0" border="0"
                                    style="
                                        border: 1px solid #e5e7eb;
                                        border-radius: 10px;
                                        overflow: hidden;
                                    ">

                                    <!-- Hotel -->
                                    <tr>
                                        <td style="
                                            padding: 15px 18px;
                                            border-bottom: 1px solid #e5e7eb;
                                        ">
                                            <span style="
                                                color: #6b7280;
                                                font-size: 13px;
                                            ">
                                                Hotel
                                            </span>
                                        </td>

                                        <td align="right" style="
                                            padding: 15px 18px;
                                            border-bottom: 1px solid #e5e7eb;
                                        ">
                                            <strong style="
                                                color: #111827;
                                                font-size: 14px;
                                            ">
                                                {hotel_name}
                                            </strong>
                                        </td>
                                    </tr>

                                    <!-- Number of Rooms -->
                                    <tr>
                                        <td style="
                                            padding: 15px 18px;
                                            border-bottom: 1px solid #e5e7eb;
                                        ">
                                            <span style="
                                                color: #6b7280;
                                                font-size: 13px;
                                            ">
                                                Rooms Booked
                                            </span>
                                        </td>

                                        <td align="right" style="
                                            padding: 15px 18px;
                                            border-bottom: 1px solid #e5e7eb;
                                        ">
                                            <strong style="
                                                color: #111827;
                                                font-size: 15px;
                                            ">
                                                {no_of_rooms}
                                            </strong>
                                        </td>
                                    </tr>

                                    <!-- Check-in -->
                                    <tr>
                                        <td style="
                                            padding: 15px 18px;
                                        ">
                                            <span style="
                                                color: #6b7280;
                                                font-size: 13px;
                                            ">
                                                Check-in Date
                                            </span>
                                        </td>

                                        <td align="right" style="
                                            padding: 15px 18px;
                                        ">
                                            <strong style="
                                                color: #111827;
                                                font-size: 14px;
                                            ">
                                                {check_in_date}
                                            </strong>
                                        </td>
                                    </tr>

                                </table>

                            </td>
                        </tr>


                        <!-- Action Notice -->
                        <tr>
                            <td style="padding: 0 32px 32px;">

                                <table width="100%" cellpadding="0" cellspacing="0" border="0"
                                    style="
                                        background-color: #f3f4f6;
                                        border-radius: 8px;
                                    ">

                                    <tr>
                                        <td style="
                                            padding: 16px 18px;
                                        ">

                                            <p style="
                                                margin: 0 0 5px;
                                                color: #374151;
                                                font-size: 13px;
                                                font-weight: 700;
                                            ">
                                                Action Required
                                            </p>

                                            <p style="
                                                margin: 0;
                                                color: #6b7280;
                                                font-size: 13px;
                                                line-height: 1.6;
                                            ">
                                                Please verify room availability and
                                                update your hotel booking records
                                                accordingly.
                                            </p>

                                        </td>
                                    </tr>

                                </table>

                            </td>
                        </tr>


                        <!-- Footer -->
                        <tr>
                            <td style="
                                padding: 20px 30px;
                                background-color: #111827;
                                text-align: center;
                            ">

                                <p style="
                                    margin: 0;
                                    color: #d1d5db;
                                    font-size: 12px;
                                ">
                                    This is an automated notification from ApnaYatra.
                                </p>

                                <p style="
                                    margin: 7px 0 0;
                                    color: #6b7280;
                                    font-size: 11px;
                                ">
                                    Please do not reply to this email.
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
        server = smtplib.SMTP("sm", 7)
        server.starttls()
        server.login(sender_email, sender_password)

        server.sendmail(
            sender_email,
            to_email,
            msg.as_string()
        )

        server.quit()

        print("Hotel admin booking alert sent successfully!")

    except Exception as e:
        print(f"Error sending hotel admin alert: {e}")


# result = send_reservation_email_to_manager("subhashisroy28@gmail.com", "Basudeb Roy", "Superstar", "2598656369", "24-08-2026", 2)
# print(result)
