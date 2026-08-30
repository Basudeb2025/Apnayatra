import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.utils import formataddr
from dotenv import load_dotenv
import os

load_dotenv()

def send_signup_email_to_user(user_email,phone_number,user_name):
    # Sender email credentials
    sender_email = os.getenv("Sender_email")
    sender_password = os.getenv("App_password")

    
    subject = "Welcome to ApnaYatra - Your Account Has Been Created"

    body = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to ApnaYatra</title>
    </head>

    <body style="
        margin: 0;
        padding: 0;
        background-color: #f5f7fa;
        font-family: Arial, Helvetica, sans-serif;
        color: #1f2937;
    ">

    <table width="100%" cellpadding="0" cellspacing="0" border="0"
        style="padding: 40px 15px; background-color: #f5f7fa;">

        <tr>
            <td align="center">

                <!-- Main Container -->
                <table width="600" cellpadding="0" cellspacing="0" border="0"
                    style="
                        max-width: 600px;
                        width: 100%;
                        background-color: #ffffff;
                        border-radius: 12px;
                        overflow: hidden;
                        border: 1px solid #e5e7eb;
                    ">

                    <!-- Brand Header -->
                    <tr>
                        <td style="
                            padding: 28px 30px;
                            border-bottom: 1px solid #eeeeee;
                        ">

                            <p style="
                                margin: 0;
                                color: #111827;
                                font-size: 22px;
                                font-weight: 700;
                            ">
                                ApnaYatra
                            </p>

                            <p style="
                                margin: 6px 0 0;
                                color: #9ca3af;
                                font-size: 12px;
                            ">
                                Travel. Stay. Explore.
                            </p>

                        </td>
                    </tr>


                    <!-- Welcome Section -->
                    <tr>
                        <td style="
                            padding: 38px 35px 25px;
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
                                font-size: 24px;
                                font-weight: bold;
                            ">
                                ✓
                            </div>

                            <h1 style="
                                margin: 20px 0 8px;
                                color: #111827;
                                font-size: 25px;
                                font-weight: 700;
                            ">
                                Welcome to ApnaYatra!
                            </h1>

                            <p style="
                                margin: 0;
                                color: #6b7280;
                                font-size: 14px;
                                line-height: 1.7;
                            ">
                                Your account has been successfully created.
                                We're happy to have you with us.
                            </p>

                        </td>
                    </tr>


                    <!-- Greeting -->
                    <tr>
                        <td style="padding: 5px 35px 25px;">

                            <p style="
                                margin: 0;
                                color: #374151;
                                font-size: 15px;
                                line-height: 1.7;
                            ">
                                Hello <strong>{user_name}</strong>,
                            </p>

                            <p style="
                                margin: 12px 0 0;
                                color: #6b7280;
                                font-size: 14px;
                                line-height: 1.7;
                            ">
                                Thank you for creating your account with ApnaYatra.
                                You can now explore destinations, discover hotels,
                                and manage your travel bookings from your account.
                            </p>

                        </td>
                    </tr>


                    <!-- Account Information -->
                    <tr>
                        <td style="padding: 0 35px 30px;">

                            <h2 style="
                                margin: 0 0 14px;
                                color: #111827;
                                font-size: 17px;
                            ">
                                Your Account Information
                            </h2>

                            <table width="100%" cellpadding="0" cellspacing="0" border="0"
                                style="
                                    background-color: #f9fafb;
                                    border: 1px solid #e5e7eb;
                                    border-radius: 9px;
                                ">

                                <!-- Name -->
                                <tr>
                                    <td style="
                                        padding: 15px 18px;
                                        border-bottom: 1px solid #e5e7eb;
                                    ">
                                        <p style="
                                            margin: 0 0 5px;
                                            color: #9ca3af;
                                            font-size: 11px;
                                            text-transform: uppercase;
                                            letter-spacing: 0.6px;
                                        ">
                                            Name
                                        </p>

                                        <p style="
                                            margin: 0;
                                            color: #111827;
                                            font-size: 14px;
                                            font-weight: 600;
                                        ">
                                            {user_name}
                                        </p>
                                    </td>
                                </tr>

                                <!-- Email -->
                                <tr>
                                    <td style="
                                        padding: 15px 18px;
                                        border-bottom: 1px solid #e5e7eb;
                                    ">
                                        <p style="
                                            margin: 0 0 5px;
                                            color: #9ca3af;
                                            font-size: 11px;
                                            text-transform: uppercase;
                                            letter-spacing: 0.6px;
                                        ">
                                            Email Address
                                        </p>

                                        <p style="
                                            margin: 0;
                                            color: #111827;
                                            font-size: 14px;
                                            font-weight: 600;
                                        ">
                                            {user_email}
                                        </p>
                                    </td>
                                </tr>

                                <!-- Phone -->
                                <tr>
                                    <td style="
                                        padding: 15px 18px;
                                    ">
                                        <p style="
                                            margin: 0 0 5px;
                                            color: #9ca3af;
                                            font-size: 11px;
                                            text-transform: uppercase;
                                            letter-spacing: 0.6px;
                                        ">
                                            Phone Number
                                        </p>

                                        <p style="
                                            margin: 0;
                                            color: #111827;
                                            font-size: 14px;
                                            font-weight: 600;
                                        ">
                                            {phone_number}
                                        </p>
                                    </td>
                                </tr>

                            </table>

                        </td>
                    </tr>


                    <!-- Getting Started -->
                    <tr>
                        <td style="padding: 0 35px 32px;">

                            <table width="100%" cellpadding="0" cellspacing="0" border="0"
                                style="
                                    background-color: #f3f4f6;
                                    border-radius: 9px;
                                ">

                                <tr>
                                    <td style="padding: 17px 18px;">

                                        <p style="
                                            margin: 0 0 6px;
                                            color: #374151;
                                            font-size: 13px;
                                            font-weight: 700;
                                        ">
                                            You're all set!
                                        </p>

                                        <p style="
                                            margin: 0;
                                            color: #6b7280;
                                            font-size: 13px;
                                            line-height: 1.6;
                                        ">
                                            Start exploring destinations and find
                                            a stay that suits your journey.
                                        </p>

                                    </td>
                                </tr>

                            </table>

                        </td>
                    </tr>


                    <!-- Closing -->
                    <tr>
                        <td style="
                            padding: 0 35px 32px;
                            text-align: center;
                        ">

                            <p style="
                                margin: 0;
                                color: #374151;
                                font-size: 14px;
                                line-height: 1.6;
                            ">
                                We look forward to being part of your journey.
                            </p>

                            <p style="
                                margin: 7px 0 0;
                                color: #6b7280;
                                font-size: 13px;
                            ">
                                Happy travelling!
                            </p>

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
                                This is an automated email from ApnaYatra.
                            </p>

                            <p style="
                                margin: 7px 0 0;
                                color: #6b7280;
                                font-size: 11px;
                            ">
                                Please do not reply to this email.
                            </p>

                            <p style="
                                margin: 10px 0 0;
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
    msg["To"] = user_email
    msg["Subject"] = subject

    msg.attach(MIMEText(body, "html"))

    try:
        server = smtplib.SMTP("som", 7)
        server.starttls()
        server.login(sender_email, sender_password)

        server.sendmail(
            sender_email,
            user_email,
            msg.as_string()
        )

        server.quit()

        print("Registration email sent successfully!")

    except Exception as e:
        print(f"Error sending registration email: {e}")

