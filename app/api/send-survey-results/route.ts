import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // קבלת הנתונים מהפרונטאנד
    const { name, email, skills, chartPngBase64 } = await req.json();

    // בדיקה בסיסית של נתונים חובה
    if (!email || !chartPngBase64 || !process.env.BREVO_API_KEY) {
      console.error("Missing required data or API Key");
      return NextResponse.json(
        { error: "Missing required data or API Key" },
        { status: 400 }
      );
    }

    // לוגו של ביטוח ישיר בפורמט Base64
    const logoBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJYAAAA0CAYAAABvHj8ZAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAALySURBVHgB7Z27TsMwFIY7S6S8AAtL78ACZWFh6Ssw8RBMvAITD8HEG7Cw8AIsLAyhS6XShS6VShf6v8SOfY6T2EnstEn7S5Z8jp3Yp8S/49SOHY0vEolEIpFIJBKJRCLK6fX9Y6NoS8fOnf67q7LCHp0vFvbeN6S/Y2eP1K+M6Y8vO0f7pM9jV9S79Xp7GvUu6H86D7vHNo99Y6L7ZezQ89Y9uoc2izY3p/1E2uC87KAsv6vO7eY798W3P690H9f8O+2vYvXUeXvI82TndO+p3NIn9A9fG8M+Z/qf6vU6v7x8T3S7S6XW9P6D+99hv7HtoM+izYHe+N/ZPeV7vX9S/H/W9NfI82TndO+p3NIn9A9fG8M+Z/qf6vU6v7x8T3S7S6XW9P6D+99hv7HtoM+izYHe+N/ZPeV7vX9S/H/W9NfI82TndO+p3NIn9A9fG8M+Z/qf6vU6v7x8T3S7S6XW9P6D+99hv7HtoM+izYHe+N/ZPeV7vX9S/H/W9NfI82TndO+p3NIn9A9fG8M+Z/qf6vU6v7x8T3S7S6XW9P6D+99hv7HtoM+izYHe+N/ZPeV7vX9S/H/W9NfI82TndO+p3NIn9A9fG8M+Z/qf6vU6v7x8T3S7S6XW9P6D+99hv7HtoM+izYHe+N/ZPeV7vX9S/H/W9NfI82TndO+p3NIn9A9fG8M+Z/qf6vU6v7x8T3S7S6XW9P6D+99hv7HtoM+izYHe+N/ZPeV7vX9S/H/W9NfI82TndO+p3NIn9A9fG8M+Z/qf6vU6v7x8T3S7S6XW9P6D+99hv7HtoM+izYHe+N/ZPeV7vX9S/H/W9NfI82TndO+p3NIn9A9fG8M+Z/qf6vU6v7x8T3S7S6XW9P6D+99hv7HtoM+izYHe+N/ZPeV7vX9S/H/W9NfI82TndO+p3NIn9A9fG8M+Z/qf6vU6v7x8T3S7S6XW9P6D+99hv7HtoM+izYHe+N/ZPeV7vX9S/H/W9NfI82TndO+p3NIn9A9fG8M+Z/qf6vU6v7x8T3S7S6XW9P6D+99hv7HtoM+izYHe+N/ZPeV7vX9S/H/W9NfI82TndO+p3NIn9A9fG8M+Z/qf6vU6v7x8T3S6S/idvGCH9nI6pP5FIJBKJRCIREU7vN6j/987RHunzuFfUu/V6exr1Luh/Og+7xzaPPeu+OQ+956P+f+fF9L9pT/r0702fX8L/Wp/X6eXzI/W9NfI82TndO+p3NIn9/6HhI286X9IHeD+7PZp/6ZzU93Fp/qVzUt/HpfmXzkl9v+570/8D9rvO7mGfm78BfUonK0HjJTkAAAAASUVORK5CYII=";

    // יצירת רשימת המיומנויות (מותאם אוטומטית ל-6 מיומנויות)
    const skillsListHtml = Object.entries(skills)
      .map(
        ([skill, rating]) => `
          <li style="background: #f8f9fa; border-right: 4px solid #0028A5; padding: 12px 15px; margin-bottom: 10px; border-radius: 8px; list-style: none; direction: rtl; display: block; clear: both;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-weight: bold; color: #333; float: right;">${skill}</span>
              <span style="background: #0028A5; color: white; padding: 4px 12px; border-radius: 15px; font-size: 14px; float: left;">
                ${rating} / 10
              </span>
            </div>
            <div style="clear: both;"></div>
          </li>`
      )
      .join("");

    const emailHtmlUser = `
      <html dir="rtl">
        <body style="margin:0; padding:20px; background-color: #f4f7f9; text-align: right; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #e1e4e8; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <div style="background: #0028A5; padding: 30px; text-align: center;">
              <img src="${logoBase64}" alt="ביטוח ישיר" style="width: 140px; background: white; padding: 10px; border-radius: 10px;">
              <h1 style="color: white; margin-top: 20px; font-size: 24px; font-weight: bold;">מפת הבאלנס האישית שלך</h1>
            </div>
            <div style="padding: 35px; color: #2d3748; line-height: 1.6;">
              <p style="font-size: 18px;">שלום <strong>${name}</strong>,</p>
              <p>כל הכבוד על השלמת הסקר! הנה הציונים שנתת לעצמך במיומנויות הליבה:</p>
              <ul style="padding:0; margin: 25px 0;">${skillsListHtml}</ul>
              <div style="background: #f0f7ff; padding: 20px; border-radius: 12px; border-right: 5px solid #FF3366; margin-top: 30px;">
                <p style="margin: 0; font-weight: bold; color: #0028A5;">
                  מצורפת למייל זה המפה הוויזואלית שלך.
                </p>
                <p style="margin: 5px 0 0 0; font-size: 14px; color: #4a5568;">
                  מומלץ לשמור אותה כחלק מתהליך הלמידה והפיתוח האישי.
                </p>
              </div>
            </div>
            <div style="background: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8;">
              © ${new Date().getFullYear()} ביטוח ישיר - פיתוח הדרכה ולמידה
            </div>
          </div>
        </body>
      </html>
    `;

    const headers = {
      "accept": "application/json",
      "content-type": "application/json",
      "api-key": process.env.BREVO_API_KEY!
    };

    // שליחה ללקוח ולמנהלת (haya.y@yashir.co.il)
    const responses = await Promise.all([
      // מייל למשתמש
      fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers,
        body: JSON.stringify({
          sender: { name: "מודל הבאלנס | ביטוח ישיר", email: "chayayawitz@gmail.com" },
          to: [{ email: email }],
          subject: `מפת הבאלנס שלך, ${name}`,
          htmlContent: emailHtmlUser,
          attachment: [{ name: `Balance_Map_${name}.png`, content: chartPngBase64 }]
        }),
      }),
      // מייל עדכון למערכת
      fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers,
        body: JSON.stringify({
          sender: { name: "מערכת מודל הבאלנס", email: "chayayawitz@gmail.com" },
          to: [{ email: "haya.y@yashir.co.il" }],
          subject: `סקר חדש הושלם: ${name}`,
          htmlContent: `<div dir="rtl" style="font-family: Arial;"><h3>התקבל סקר חדש מ-${name}</h3><p>אימייל: ${email}</p><ul style="padding:0;">${skillsListHtml}</ul></div>`,
          attachment: [{ name: `Balance_Map_${name}.png`, content: chartPngBase64 }]
        }),
      })
    ]);

    // בדיקה אם המייל הראשון נשלח בהצלחה
    if (!responses[0].ok) {
      const errorData = await responses[0].json();
      console.error("Brevo API Error:", errorData);
      throw new Error(`Brevo error: ${JSON.stringify(errorData)}`);
    }

    return NextResponse.json({ success: true });

  } catch (err: any) {
    console.error("Route Error:", err.message);
    return NextResponse.json(
      { error: err.message || "Internal Server Error" }, 
      { status: 500 }
    );
  }
}
