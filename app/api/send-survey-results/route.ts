import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { name, email, skills } = await req.json();

    // 1. הגדרת הגרף (QuickChart)
    const chartConfig = {
      type: 'radar',
      data: {
        labels: Object.keys(skills),
        datasets: [{
          data: Object.values(skills),
          backgroundColor: 'rgba(255, 51, 102, 0.3)',
          borderColor: '#FF3366',
          borderWidth: 4,
          pointBackgroundColor: '#FF3366',
          pointRadius: 6
        }]
      },
      options: {
        legend: { display: false },
        scale: {
          gridLines: { color: 'rgba(0, 40, 165, 0.2)' },
          angleLines: { color: 'rgba(0, 40, 165, 0.2)' },
          ticks: { display: true, min: 0, max: 10, stepSize: 1, fontColor: '#0028A5', backdropColor: 'transparent' },
          pointLabels: { fontColor: '#0028A5', fontSize: 14, fontStyle: 'bold' }
        }
      }
    };

    const chartUrl = `https://quickchart.io/chart?c=${encodeURIComponent(JSON.stringify(chartConfig))}&width=800&height=800&bg=white`;

    const imageRes = await fetch(chartUrl);
    const imageBuffer = await imageRes.arrayBuffer();
    const imageBase64 = Buffer.from(imageBuffer).toString('base64');

    const skillsHtml = Object.entries(skills)
      .map(([s, v]) => `
        <tr style="border-bottom: 1px solid #eee;">
          <td style="padding: 10px; color: #333;">${s}</td>
          <td style="padding: 10px; color: #FF3366; font-weight: bold; text-align: center;">${v}/10</td>
        </tr>`).join("");

    // תבנית לעובד
    const htmlEmployee = `
      <div dir="rtl" style="font-family: Arial; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 20px; overflow: hidden;">
        <div style="background: #0028A5; padding: 20px; text-align: center; color: #fff;">
          <h1 style="margin: 0;">מודל הבאלנס</h1>
        </div>
        <div style="padding: 30px;">
          <h2 style="color: #0028A5;">היי ${name},</h2>
          <p>מפת הבאלנס שלך מוכנה!</p>
          <div style="text-align: center; margin: 20px 0;">
            <img src="cid:balanceMap" style="width: 100%; max-width: 400px;" />
          </div>
          <table style="width: 100%; border-collapse: collapse;">${skillsHtml}</table>
        </div>
      </div>`;

    // תבנית למנהלת
    const htmlManager = `
      <div dir="rtl" style="font-family: Arial; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 20px; overflow: hidden;">
        <div style="background: #FF3366; padding: 20px; text-align: center; color: #fff;">
          <h1 style="margin: 0;">עדכון: סקר חדש בוצע</h1>
        </div>
        <div style="padding: 30px;">
          <h2 style="color: #0028A5;">שלום,</h2>
          <p>העובד/ת <strong>${name}</strong> מילא/ה את מפת הבאלנס.</p>
          <div style="text-align: center; margin: 20px 0;">
            <img src="cid:balanceMap" style="width: 100%; max-width: 400px;" />
          </div>
          <table style="width: 100%; border-collapse: collapse;">${skillsHtml}</table>
        </div>
      </div>`;

    const commonAttachment = [{ 
      name: `Balance_Map_${name}.jpg`, 
      content: imageBase64,
      contentType: "image/jpeg",
      contentId: "balanceMap" 
    }];

    // --- שימי לב לשינוי כאן ב-sender ---

    // שליחה לעובד
    await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: { "accept": "application/json", "content-type": "application/json", "api-key": process.env.BREVO_API_KEY! },
      body: JSON.stringify({
        sender: { name: "מודל הבאלנס", email: "chayayawitz@gmail.com" }, // רק השם יוצג ברוב התיבות
        to: [{ email }],
        subject: `היי ${name}, מפת הבאלנס שלך מוכנה!`,
        htmlContent: htmlEmployee,
        attachment: commonAttachment
      }),
    });

    // שליחה למנהלת
    await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: { "accept": "application/json", "content-type": "application/json", "api-key": process.env.BREVO_API_KEY! },
      body: JSON.stringify({
        sender: { name: "מערכת מודל הבאלנס", email: "chayayawitz@gmail.com" },
        to: [{ email: "haya.y@yashir.co.il" }],
        subject: `תוצאות סקר: ${name} - מפת באלנס`,
        htmlContent: htmlManager,
        attachment: commonAttachment
      }),
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
