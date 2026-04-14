import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(req: Request) {
  try {
    const { name, email, skills, chartPngBase64 } = await req.json();

    /* -------------------------------------------------
       1. הפיכת הלוגו לקוד Base64 (כדי שלא יישבר לעולם)
    ------------------------------------------------- */
    let logoDataUri = "";
    try {
      // קריאת הקובץ ישירות מתיקיית ה-public בשרת
      const logoPath = path.join(process.cwd(), "public", "bituach-yashir-logo.png");
      const logoBuffer = fs.readFileSync(logoPath);
      const logoBase64 = logoBuffer.toString("base64");
      logoDataUri = `data:image/png;base64,${logoBase64}`;
    } catch (e) {
      console.error("Logo loading failed:", e);
      // fallback למקרה שמשהו השתבש בקריאת הקובץ
    }

    // רשימת המיומנויות עם התיקון למניעת שבירת הציון
    const skillsListHtml = Object.entries(skills)
      .map(
        ([skill, rating]) => `
          <li style="background: #f8f9fa; border-right: 4px solid #0028A5; padding: 12px 15px; margin-bottom: 10px; border-radius: 8px; list-style: none; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap;">
            <span style="font-weight: bold; color: #333; margin-left: 10px; flex: 1; min-width: 160px; text-align: right;">${skill}</span>
            <span style="background: #0028A5; color: white; padding: 4px 12px; border-radius: 15px; font-size: 14px; white-space: nowrap; flex-shrink: 0; display: inline-block;">
              ${rating} / 10
            </span>
          </li>`
      )
      .join("");

    const headHtml = `
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Rubik:wght@400;700&display=swap" rel="stylesheet">
        <style>
          * { font-family: 'Rubik', sans-serif; }
          .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 15px 35px rgba(0,0,0,0.1); border: 1px solid #e1e4e8; }
          .header { background: #0028A5; color: white; padding: 30px; text-align: center; }
          .logo-box { background: white; padding: 12px; border-radius: 12px; display: inline-block; margin-bottom: 15px; }
          .logo-img { width: 140px; display: block; border: 0; }
          .content { padding: 35px; line-height: 1.8; color: #2d3748; text-align: right; }
          .footer { background: #f7fafc; text-align: center; padding: 20px; font-size: 13px; color: #718096; border-top: 1px solid #edf2f7; }
        </style>
      </head>
    `;

    // המייל לעובד עם השם האישי
    const emailHtmlUser = `
      <html dir="rtl">
        ${headHtml}
        <body style="margin:0; padding:0; background-color: #f4f7f9;">
          <div class="container">
            <div class="header">
              ${logoDataUri ? `
              <div class="logo-box">
                <img src="${logoDataUri}" alt="ביטוח ישיר" class="logo-img">
              </div>` : ""}
              <h1 style="margin:0; font-size: 24px;">מפת הבאלנס של ${name}</h1>
            </div>
            <div class="content">
              <p style="font-size: 18px;">שלום <strong>${name}</strong>,</p>
              <p>תודה על מילוי הסקר. הנה ריכוז המיומנויות שלך כפי שדורגו:</p>
              <div style="background: #ebf4ff; border-radius: 12px; padding: 20px; margin: 25px 0;">
                <ul style="padding:0; margin:0;">${skillsListHtml}</ul>
              </div>
              <p><strong>מפת הבאלנס הוויזואלית שלך מצורפת למייל זה.</strong></p>
            </div>
            <div class="footer">כל הזכויות שמורות למחלקת הדרכה - ביטוח ישיר © ${new Date().getFullYear()}</div>
          </div>
        </body>
      </html>
    `;

    // מייל למנהלת (חיה)
    const emailHtmlManager = `
      <html dir="rtl">
        ${headHtml}
        <body style="margin:0; padding:0; background-color: #f4f7f9;">
          <div class="container">
            <div class="header" style="background: #2d3748;">
              ${logoDataUri ? `
              <div class="logo-box">
                <img src="${logoDataUri}" alt="ביטוח ישיר" class="logo-img">
              </div>` : ""}
              <h1 style="margin:0; font-size: 22px;">התקבל סקר חדש: ${name}</h1>
            </div>
            <div class="content">
              <p>העובד/ת <strong>${name}</strong> (${email}) סיים/ה את מילוי הסקר.</p>
              <div style="background: #f1f5f9; border-radius: 12px; padding: 20px;">
                <ul style="padding:0; margin:0;">${skillsListHtml}</ul>
              </div>
            </div>
            <div class="footer">דוח מערכת אוטומטי - LD Specialist</div>
          </div>
        </body>
      </html>
    `;

    const payloadBase = {
      sender: { name: "מודל הבאלנס | פיתוח הדרכה", email: "chayayawitz@gmail.com" },
      attachment: [{ name: `Balance_Map_${name}.png`, content: chartPngBase64, type: "image/png" }],
    };

    const headers = { 
      "accept": "application/json", 
      "content-type": "application/json", 
      "api-key": process.env.BREVO_API_KEY! 
    };

    // שליחה למשתתף
    await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers,
      body: JSON.stringify({ ...payloadBase, to: [{ email }], subject: `מפת הבאלנס שלך, ${name}`, htmlContent: emailHtmlUser }),
    });

    // שליחה למנהלת
    await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers,
      body: JSON.stringify({ ...payloadBase, to: [{ email: "haya.y@yashir.co.il" }], subject: `סקר חדש הושלם: ${name}`, htmlContent: emailHtmlManager }),
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
