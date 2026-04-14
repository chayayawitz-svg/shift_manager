import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { name, email, skills, chartPngBase64 } = await req.json();

    if (!email || !chartPngBase64 || !process.env.BREVO_API_KEY) {
      return NextResponse.json({ error: "נתונים חסרים" }, { status: 400 });
    }

    const logoBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJYAAAA0CAYAAABvHj8ZAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAALySURBVHgB7Z27TsMwFIY7S6S8AAtL78ACZWFh6Ssw8RBMvAITD8HEG7Cw8AIsLAyhS6XShS6VShf6v8SOfY6T2EnstEn7S5Z8jp3Yp8S/49SOHY0vEolEIpFIJBKJRCLK6fX9Y6NoS8fOnf67q7LCHp0vFvbeN6S/Y2eP1K+M6Y8vO0f7pM9jV9S79Xp7GvUu6H86D7vHNo99Y6L7ZezQ89Y9uoc2izY3p/1E2uC87KAsv6vO7eY798W3P690H9f8O+2vYvXUeXvI82TndO+p3NIn9A9fG8M+Z/qf6vU6v7x8T3S7S6XW9P6D+99hv7HtoM+izYHe+N/ZPeV7vX9S/H/W9NfI82TndO+p3NIn9A9fG8M+Z/qf6vU6v7x8T3S7S6XW9P6D+99hv7HtoM+izYHe+N/ZPeV7vX9S/H/W9NfI82TndO+p3NIn9A9fG8M+Z/qf6vU6v7x8T3S7S6XW9P6D+99hv7HtoM+izYHe+N/ZPeV7vX9S/H/W9NfI82TndO+p3NIn9A9fG8M+Z/qf6vU6v7x8T3S7S6XW9P6D+99hv7HtoM+izYHe+N/ZPeV7vX9S/H/W9NfI82TndO+p3NIn9A9fG8M+Z/qf6vU6v7x8T3S7S6XW9P6D+99hv7HtoM+izYHe+N/ZPeV7vX9S/H/W9NfI82TndO+p3NIn9A9fG8M+Z/qf6vU6v7x8T3S7S6XW9P6D+99hv7HtoM+izYHe+N/ZPeV7vX9S/H/W9NfI82TndO+p3NIn9A9fG8M+Z/qf6vU6v7x8T3S7S6XW9P6D+99hv7HtoM+izYHe+N/ZPeV7vX9S/H/W9NfI82TndO+p3NIn9A9fG8M+Z/qf6vU6v7x8T3S7S6XW9P6D+99hv7HtoM+izYHe+N/ZPeV7vX9S/H/W9NfI82TndO+p3NIn9A9fG8M+Z/qf6vU6v7x8T3S7S6XW9P6D+99hv7HtoM+izYHe+N/ZPeV7vX9S/H/W9NfI82TndO+p3NIn9A9fG8M+Z/qf6vU6v7x8T3S6S/idvGCH9nI6pP5FIJBKJRCIREU7vN6j/987RHunzuFfUu/V6exr1Luh/Og+7xzaPPeu+OQ+956P+f+fF9L9pT/r0702fX8L/Wp/X6eXzI/W9NfI82TndO+p3NIn9/6HhI286X9IHeD+7PZp/6ZzU93Fp/qVzUt/HpfmXzkl9v+570/8D9rvO7mGfm78BfUonK0HjJTkAAAAASUVORK5CYII=";

    // יצירת הרשימה למייל בצורה דינמית (יעבוד לכל מספר של מיומנויות)
    const skillsListHtml = Object.entries(skills)
      .map(([skill, rating]) => `
          <li style="background: #f8f9fa; border-right: 4px solid #0028A5; padding: 12px 15px; margin-bottom: 10px; border-radius: 8px; list-style: none; direction: rtl; text-align: right;">
            <span style="font-weight: bold; color: #333;">${skill}:</span> 
            <span style="color: #FF3366; font-weight: bold;">${rating}/10</span>
          </li>`).join("");

    const emailHtml = `<div dir="rtl" style="font-family: Arial;">
      <h2 style="color: #0028A5;">מפת הבאלנס של ${name}</h2>
      <p>שלום, הנה תוצאות הסקר שלך:</p>
      <ul style="padding: 0;">${skillsListHtml}</ul>
      <p>המפה הוויזואלית מצורפת למייל זה.</p>
    </div>`;

    const headers = {
      "accept": "application/json",
      "content-type": "application/json",
      "api-key": process.env.BREVO_API_KEY!
    };

    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers,
      body: JSON.stringify({
        sender: { name: "מודל הבאלנס", email: "chayayawitz@gmail.com" },
        to: [{ email }],
        subject: `מפת הבאלנס שלך, ${name}`,
        htmlContent: emailHtml,
        attachment: [{ name: `Balance_Map_${name}.png`, content: chartPngBase64 }]
      }),
    });

    if (!res.ok) {
        const errData = await res.json();
        throw new Error(JSON.stringify(errData));
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("API Error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
