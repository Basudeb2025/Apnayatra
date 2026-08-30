import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.utils import formataddr
from dotenv import load_dotenv
import os

load_dotenv()

def send_signup_email_to_manager(hotel_name,next_id,email,phone_number):
    # Sender email credentials
    sender_email = os.getenv("Sender_email")
    sender_password = os.getenv("App_password")


    subject = f"Hotel Manager Registration Confirmed - {hotel_name}"

    body = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Hotel Manager Registration</title>
    </head>

    <body style="
        margin: 0;
        padding: 0;
        background-color: #f4f6f8;
        font-family: Arial, Helvetica, sans-serif;
        color: #1f2937;
    ">

    <table width="100%" cellpadding="0" cellspacing="0" border="0"
        style="padding: 40px 15px; background-color: #f4f6f8;">

        <tr>
            <td align="center">

                <!-- Main Card -->
                <table width="600" cellpadding="0" cellspacing="0" border="0"
                    style="
                        max-width: 600px;
                        width: 100%;
                        background-color: #ffffff;
                        border-radius: 12px;
                        overflow: hidden;
                        border: 1px solid #e5e7eb;
                    ">

                    <!-- Header -->
                    <tr>
                        <td style="
                            padding: 25px 30px;
                            border-bottom: 1px solid #e5e7eb;
                        ">

                            <p style="
                                margin: 0;
                                font-size: 22px;
                                font-weight: 700;
                                color: #111827;
                            ">
                                ApnaYatra
                            </p>

                            <p style="
                                margin: 5px 0 0;
                                font-size: 12px;
                                color: #9ca3af;
                            ">
                                ApnaYatra-Hotel_manager
                            </p>

                        </td>
                    </tr>


                    <!-- Confirmation -->
                    <tr>
                        <td style="
                            padding: 35px 32px 25px;
                            text-align: center;
                        ">

                            <div style="
                                display: inline-block;
                                width: 48px;
                                height: 48px;
                                line-height: 48px;
                                border-radius: 50%;
                                background-color: #ecfdf5;
                                color: #15803d;
                                font-size: 23px;
                                font-weight: bold;
                            ">
                                ✓
                            </div>

                            <h1 style="
                                margin: 18px 0 8px;
                                color: #111827;
                                font-size: 24px;
                            ">
                                Registration Successful
                            </h1>

                            <p style="
                                margin: 0;
                                color: #6b7280;
                                font-size: 14px;
                                line-height: 1.7;
                            ">
                                Your hotel manager account has been successfully
                                registered with ApnaYatra.
                            </p>

                        </td>
                    </tr>


                    <!-- Hotel -->
                    <tr>
                        <td style="padding: 5px 32px 25px;">

                            <table width="100%" cellpadding="0" cellspacing="0" border="0"
                                style="
                                    background-color: #f9fafb;
                                    border: 1px solid #e5e7eb;
                                    border-radius: 9px;
                                ">

                                <tr>
                                    <td style="padding: 18px;">

                                        <p style="
                                            margin: 0 0 6px;
                                            color: #9ca3af;
                                            font-size: 11px;
                                            text-transform: uppercase;
                                            letter-spacing: 0.7px;
                                        ">
                                            Registered Hotel
                                        </p>

                                        <p style="
                                            margin: 0;
                                            color: #111827;
                                            font-size: 18px;
                                            font-weight: 700;
                                        ">
                                            {hotel_name}
                                        </p>

                                    </td>
                                </tr>

                            </table>

                        </td>
                    </tr>


                    <!-- Account Details -->
                    <tr>
                        <td style="padding: 0 32px 28px;">

                            <h2 style="
                                margin: 0 0 15px;
                                color: #111827;
                                font-size: 17px;
                            ">
                                Manager Account Details
                            </h2>

                            <table width="100%" cellpadding="0" cellspacing="0" border="0"
                                style="
                                    border: 1px solid #e5e7eb;
                                    border-radius: 9px;
                                ">

                                <!-- Manager ID -->
                                <tr>
                                    <td style="
                                        padding: 14px 17px;
                                        border-bottom: 1px solid #e5e7eb;
                                        color: #6b7280;
                                        font-size: 13px;
                                    ">
                                        Hotel ID
                                    </td>

                                    <td align="right" style="
                                        padding: 14px 17px;
                                        border-bottom: 1px solid #e5e7eb;
                                        color: #111827;
                                        font-size: 14px;
                                        font-weight: 700;
                                    ">
                                        {next_id}
                                    </td>
                                </tr>

                                <!-- Email -->
                                <tr>
                                    <td style="
                                        padding: 14px 17px;
                                        border-bottom: 1px solid #e5e7eb;
                                        color: #6b7280;
                                        font-size: 13px;
                                    ">
                                        Email Address
                                    </td>

                                    <td align="right" style="
                                        padding: 14px 17px;
                                        border-bottom: 1px solid #e5e7eb;
                                        color: #111827;
                                        font-size: 14px;
                                        font-weight: 600;
                                    ">
                                        {email}
                                    </td>
                                </tr>

                                <!-- Phone -->
                                <tr>
                                    <td style="
                                        padding: 14px 17px;
                                        border-bottom: 1px solid #e5e7eb;
                                        color: #6b7280;
                                        font-size: 13px;
                                    ">
                                        Phone Number
                                    </td>

                                    <td align="right" style="
                                        padding: 14px 17px;
                                        border-bottom: 1px solid #e5e7eb;
                                        color: #111827;
                                        font-size: 14px;
                                        font-weight: 600;
                                    ">
                                        {phone_number}
                                    </td>
                                </tr>

                                <!-- Password -->
                                <tr>
                                    <td style="
                                        padding: 14px 17px;
                                        color: #6b7280;
                                        font-size: 13px;
                                    ">
                                        Password
                                    </td>

                                    <td align="right" style="
                                        padding: 14px 17px;
                                        color: #6b7280;
                                        font-size: 13px;
                                        font-style: italic;
                                    ">
                                        ************
                                    </td>
                                </tr>

                            </table>

                        </td>
                    </tr>


                    <!-- Security Notice -->
                    <tr>
                        <td style="padding: 0 32px 30px;">

                            <table width="100%" cellpadding="0" cellspacing="0" border="0"
                                style="
                                    background-color: #fff7ed;
                                    border-left: 4px solid #f97316;
                                    border-radius: 5px;
                                ">

                                <tr>
                                    <td style="padding: 16px 18px;">

                                        <p style="
                                            margin: 0 0 6px;
                                            color: #9a3412;
                                            font-size: 13px;
                                            font-weight: 700;
                                        ">
                                            Security Notice
                                        </p>

                                        <p style="
                                            margin: 0;
                                            color: #7c2d12;
                                            font-size: 13px;
                                            line-height: 1.6;
                                        ">
                                            For your security, your password is not
                                            displayed in this email. Please keep
                                            your login credentials private and
                                            never share your password with anyone.
                                        </p>

                                    </td>
                                </tr>

                            </table>

                        </td>
                    </tr>


                    <!-- Closing -->
                    <tr>
                        <td style="
                            padding: 0 32px 32px;
                            text-align: center;
                        ">

                            <p style="
                                margin: 0;
                                color: #374151;
                                font-size: 14px;
                                line-height: 1.6;
                            ">
                                Your hotel manager account is now ready to use.
                            </p>

                            <p style="
                                margin: 7px 0 0;
                                color: #9ca3af;
                                font-size: 12px;
                            ">
                                Welcome to ApnaYatra.
                            </p>

                        </td>
                    </tr>


                    <!-- Footer -->
                    <tr>
                        <td style="
                            padding: 19px 30px;
                            background-color: #111827;
                            text-align: center;
                        ">

                            <p style="
                                margin: 0;
                                color: #d1d5db;
                                font-size: 12px;
                            ">
                                Automated notification from ApnaYatra
                            </p>

                            <p style="
                                margin: 7px 0 0;
                                color: #6b7280;
                                font-size: 11px;
                            ">
                                Please do not reply to this email.
                            </p>

                            <p style="
                                margin: 9px 0 0;
                                color: #4b5563;
                                font-size: 10px;
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
    msg["To"] = email
    msg["Subject"] = subject

    msg.attach(MIMEText(body, "html"))

    try:
        server = smtplib.SMTP("s", 7)
        server.starttls()
        server.login(sender_email, sender_password)

        server.sendmail(
            sender_email,
            email,
            msg.as_string()
        )

        server.quit()

        print("Hotel manager registration email sent successfully!")

    except Exception as e:
        print(f"Error sending hotel manager registration email: {e}")

