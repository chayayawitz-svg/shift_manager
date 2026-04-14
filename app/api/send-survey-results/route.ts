import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { name, email, skills } = await req.json();

    // 1. הגדרת גרף יוקרתי וגדול עבור QuickChart
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
          gridLines: { color: 'rgba(0, 40, 165, 0.2)', lineWidth: 1 },
          angleLines: { color: 'rgba(0, 40, 165, 0.2)' },
          ticks: { 
            display: true, 
            min: 0, max: 10, stepSize: 1,
            fontSize: 10, fontColor: '#0028A5', backdropColor: 'transparent'
          },
          pointLabels: { fontColor: '#0028A5', fontSize: 14, fontStyle: 'bold' }
        }
      }
    };

    // יצירת קישור למפה גדולה (800x800)
    const chartUrl = `https://quickchart.io/chart?c=${encodeURIComponent(JSON.stringify(chartConfig))}&width=800&height=800&bg=white`;

    // 2. הורדת התמונה בשרת כדי לשלוח אותה כקובץ מצורף
    const imageRes = await fetch(chartUrl);
    const imageBuffer = await imageRes.arrayBuffer();
    const imageBase64 = Buffer.from(imageBuffer).toString('base64');

    const skillsHtml = Object.entries(skills)
      .map(([s, v]) => `
        <tr style="border-bottom: 1px solid #eee;">
          <td style="padding: 10px; color: #333;">${s}</td>
          <td style="padding: 10px; color: #FF3366; font-weight: bold; text-align: center;">${v}/10</td>
        </tr>`).join("");

    const emailHtml = `
      <div dir="rtl" style="font-family: Segoe UI, Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 20px; overflow: hidden; background: #fff;">
        <div style="background: #0028A5; padding: 30px; text-align: center;">
          <h1 style="color: #fff; margin: 0; font-size: 24px;">מודל הבאלנס</h1>
          <p style="color: #FF3366; margin: 5px 0 0 0; font-weight: bold; font-style: italic;">קורס מנהלי משמרת | ביטוח ישיר</p>
        </div>
        <div style="padding: 30px;">
          <h2 style="color: #0028A5;">היי ${name},</h2>
          <p style="font-size: 16px; color: #444;">מפת הבאלנס האישית שלך מוכנה! הנה סיכום הדירוגים והמפה המצורפת:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <img src="cid:balanceMap" style="width: 100%; max-width: 450px; border-radius: 15px; box-shadow: 0 10px 20px rgba(0,0,0,0.1);" />
          </div>

          <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <thead style="background: #f8f9fa;">
              <tr>
                <th style="padding: 10px; text-align: right; color: #0028A5;">מיומנות</th>
                <th style="padding: 10px; text-align: center; color: #0028A5;">ציון</th>
              </tr>
            </thead>
            <tbody>${skillsHtml}</tbody>
          </table>
        </div>
        <div style="background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #999;">
          נשלח עבור ביטוח ישיר - קורס מנהלי משמרת 2026
        </div>
      </div>`;

    // 3. שליחה דרך Brevo עם קובץ מצורף ותמונת CID (כדי שיופיע בתוך המייל)
    await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: { "accept": "application/json", "content-type": "application/json", "api-key": process.env.BREVO_API_KEY! },
      body: JSON.stringify({
        sender: { name: "מודל הבאלנס", email: "chayayawitz@gmail.com" },
        to: [{ email }, { email: "haya.y@yashir.co.il" }],
        subject: `מפת הבאלנס של ${name}`,
        htmlContent: emailHtml,
        attachment: [{ 
          name: `Balance_Map_${name}.jpg`, 
          content: imageBase64,
          contentType: "image/jpeg",
          contentId: "balanceMap" // זה מה שגורם לתמונה להופיע בתוך המייל
        }]
      }),
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
