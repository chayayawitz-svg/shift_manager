"use client";

import { useState, useRef, FormEvent, useEffect } from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import Image from "next/image";
import { Star } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

/* -------------------------------------------------
   חיבור אמיתי למסד הנתונים של Supabase שלך
------------------------------------------------- */
const supabaseUrl = 'https://rbyufhkwrgvywnovdwei.supabase.co';
const supabaseKey = 'sb_publishable_Wc1Cj7wgX1oWRZ2x5svXNg_wa2kVU4u';
const supabase = createClient(supabaseUrl, supabaseKey);

/* -------------------------------------------------
   1. לוגיקת פונטים וייצור תמונה (עבור המייל)
------------------------------------------------- */
const loadRubikFont = async () => {
  if (typeof document === "undefined") return;
  const regular = new FontFace("Rubik", "url(/Rubik-Regular.ttf)");
  const bold = new FontFace("Rubik", "url(/Rubik-Bold.ttf)");
  try {
    await Promise.all([regular.load(), bold.load()]);
    document.fonts.add(regular);
    document.fonts.add(bold);
  } catch (e) { console.error("Font loading failed", e); }
};

const svgToPng = async (svg: SVGElement, name: string): Promise<string> => {
  await loadRubikFont();
  const serializer = new XMLSerializer();
  const svgString = serializer.serializeToString(svg);
  const blob = new Blob([svgString], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  const img = document.createElement("img");
  img.src = url;
  await img.decode();

  const canvas = document.createElement("canvas");
  const scale = 2;
  canvas.width = 800 * scale;
  canvas.height = 1000 * scale;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(scale, scale);

  const grad = ctx.createLinearGradient(0, 0, 0, 1000);
  grad.addColorStop(0, "#2b001a");
  grad.addColorStop(1, "#020414");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 800, 1000);

  ctx.strokeStyle = "rgba(255, 51, 102, 0.4)";
  ctx.lineWidth = 3;
  ctx.strokeRect(25, 25, 750, 950);

  ctx.fillStyle = "#FFFFFF";
  ctx.textAlign = "center";
  ctx.font = "700 40px Rubik";
  ctx.fillText("דוח מיומנויות אישי", 400, 110);
  
  ctx.fillStyle = "#FF3366";
  ctx.font = "700 34px Rubik";
  ctx.fillText(`מפת הבאלנס של ${name}`, 400, 170);

  const chartX = (800 - img.width) / 2;
  ctx.drawImage(img, chartX, 240);

  const logo = document.createElement("img");
  logo.src = "/bituach-yashir-logo.png";
  await logo.decode();
  ctx.fillStyle = "rgba(255,255,255,0.95)";
  ctx.beginPath();
  ctx.roundRect(310, 850, 180, 80, 15);
  ctx.fill();
  ctx.drawImage(logo, 330, 865, 140, 50);

  URL.revokeObjectURL(url);
  return canvas.toDataURL("image/png").split(",")[1];
};

/* -------------------------------------------------
   2. סדר המיומנויות החדש
------------------------------------------------- */
const sections = [
  "הובלה והשפעה על התוצאות",
  "שחקני נשמה",
  "ערבות הדדית",
  "מקצועיות",
  "חיבור לביזנס",
  "סקרנות ולמידה מתמשכת",
  "חדשנות",
  "ניהול שותפויות",
];

/* -------------------------------------------------
   3. רכיבים ויזואליים
------------------------------------------------- */
const Stars = ({ skill, value, onChange }: any) => (
  <div className="space-y-3 border-b border-gray-100 pb-6 text-right">
    <label className="text-xl font-bold text-blue-950 block">{skill}</label>
    <div className="flex gap-2 justify-center flex-wrap" dir="rtl">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
        <button key={n} type="button" onClick={() => onChange(n)} className="transition hover:scale-125">
          <div className="flex flex-col items-center">
            <Star className={`w-8 h-8 ${n <= value ? "fill-[#FF3366] text-[#FF3366]" : "text-gray-200"}`} />
            <span className="text-[11px] text-gray-500 mt-1 font-bold">{n}</span>
          </div>
        </button>
      ))}
    </div>
  </div>
);

const DotWithValue = (props: any) => {
  const { cx, cy, value } = props;
  if (!value) return null;
  return (
    <g>
      <circle cx={cx} cy={cy} r={12} fill="#FF3366" stroke="#fff" strokeWidth={2} />
      <text x={cx} y={cy + 5} fill="#fff" fontSize={11} textAnchor="middle" fontWeight={800} style={{fontFamily: 'Rubik'}}>{value}</text>
    </g>
  );
};

const AxisTick = ({ x, y, cx, cy, payload, isMobile }: any) => {
  const dx = x - cx;
  const dy = y - cy;
  const d = Math.sqrt(dx * dx + dy * dy);
  const nx = d > 0 ? dx / d : 0;
  const ny = d > 0 ? dy / d : 0;
  
  const offset = isMobile ? 30 : 45; 
  const newX = x + nx * offset;
  const newY = y + ny * offset;

  let lines: string[] = [];
  
  if (isMobile && payload.value.includes("סקרנות")) {
    lines = ["סקרנות", "ולמידה", "מתמשכת"];
  } else {
    const words = payload.value.split(" ");
    let current = "";
    words.forEach((w: string) => {
      if ((current + " " + w).length > 7) { lines.push(current); current = w; } 
      else { current += (current ? " " : "") + w; }
    });
    if (current) lines.push(current);
  }

  return (
    <text x={newX} y={newY} textAnchor="middle" fill="#fff" fontSize={isMobile ? 9 : 10} fontWeight={700} style={{fontFamily: 'Rubik'}}>
      {lines.map((line, i) => (
        <tspan key={i} x={newX} dy={i === 0 ? 0 : (isMobile ? 10 : 12)}>{line}</tspan>
      ))}
    </text>
  );
};

export default function Home() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [skills, setSkills] = useState<Record<string, number>>(
    Object.fromEntries(sections.map((s) => [s, 0]))
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<any>(null);
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    
    const style = document.createElement("style");
    style.innerHTML = `
      @import url('https://fonts.googleapis.com/css2?family=Rubik:wght@400;700;900&display=swap');
      * { font-family: 'Rubik', sans-serif !important; direction: rtl; }
      .custom-scrollbar::-webkit-scrollbar { width: 5px; }
      .custom-scrollbar::-webkit-scrollbar-thumb { background: #FF3366; border-radius: 10px; }
    `;
    document.head.appendChild(style);
    
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const chartData = sections.map((s) => ({ subject: s, value: skills[s] }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name || !email || Object.values(skills).includes(0)) {
      alert("נא למלא הכל ולדרג את כל המיומנויות");
      return;
    }
    setIsSubmitting(true);
    setStatus(null);

    try {
      // 1. ייצור התמונה עבור ה-API שלך
      const svg = chartRef.current?.querySelector("svg");
      const png = svg ? await svgToPng(svg, name) : "";

      // 2. שמירת הנתונים ב-Supabase עבור דשבורד המנהלים
      const { error: supabaseError } = await supabase
        .from('survey_results')
        .insert([
          { 
            full_name: name, 
            email: email, 
            cat1_leadership: skills["הובלה והשפעה על התוצאות"],
            cat2_soul_player: skills["שחקני נשמה"],
            cat3_mutual_guarantee: skills["ערבות הדדית"],
            cat4_professionalism: skills["מקצועיות"],
            cat5_business_connection: skills["חיבור לביזנס"],
            cat6_curiosity: skills["סקרנות ולמידה מתמשכת"],
            cat7_innovation: skills["חדשנות"],
            cat8_partnership: skills["ניהול שותפויות"]
          }
        ]);

      if (supabaseError) {
        console.error("שגיאה בשמירה ל-Supabase:", supabaseError);
      }

      // 3. שליחה ל-API המקורי שלך (כדי שהמייל יישלח למשתתף)
      const response = await fetch("/api/send-survey-results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, skills, chartPngBase64: png }),
      });
      
      if (response.ok) setStatus("success");
      else setStatus("error");

    } catch (error) { 
      console.error(error);
      setStatus("error"); 
    }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen p-4 bg-[#020414] text-right">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 items-start">
        
        <form onSubmit={handleSubmit} className="bg-white rounded-[40px] p-8 lg:p-12 flex-1 shadow-2xl w-full">
          <h1 className="text-4xl font-black text-blue-900 mb-8 text-center">מודל הבאלנס <span className="text-[#FF3366]">|</span> פיתוח הדרכה</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
            <input placeholder="שם מלא" className="w-full border-b-4 border-gray-100 p-4 text-xl focus:border-[#FF3366] outline-none transition bg-gray-50 rounded-t-2xl text-right" value={name} onChange={(e) => setName(e.target.value)} required />
            <input placeholder="אימייל" type="email" className="w-full border-b-4 border-gray-100 p-4 text-xl focus:border-[#FF3366] outline-none transition bg-gray-50 rounded-t-2xl text-right" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="space-y-10 max-h-[600px] overflow-y-auto pl-4 custom-scrollbar">
            {sections.map((s) => (
              <Stars key={s} skill={s} value={skills[s]} onChange={(v: number) => setSkills(p => ({ ...p, [s]: v }))} />
            ))}
          </div>
          <button disabled={isSubmitting} className="w-full mt-10 bg-[#FF3366] text-white py-5 rounded-full font-black text-2xl shadow-xl active:scale-95 transition">
            {isSubmitting ? "מייצר מפה..." : "שלחו לי את המפה !"}
          </button>
          {status === "success" && <p className="text-green-600 text-center mt-6 font-black text-xl">✓ הסקר נשלח בהצלחה! התוצאות נשארו לפנייך.</p>}
        </form>

        <div className="flex-1 bg-gradient-to-br from-[#3b002a] via-[#050824] to-[#020414] rounded-[40px] p-4 lg:p-12 flex flex-col items-center justify-center shadow-2xl min-h-[550px] lg:min-h-[650px] border-2 border-white/10 w-full overflow-hidden">
          <h2 className="text-2xl lg:text-3xl font-black text-white mb-8 bg-[#FF3366] px-8 py-2 rounded-full shadow-lg">
            {name ? `המפה של ${name}` : "המפה האישית שלך"}
          </h2>
          <div ref={chartRef} className="w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height={isMobile ? 450 : 550}>
              <RadarChart 
                cx="50%" cy="50%" 
                outerRadius={isMobile ? 95 : 180} 
                data={chartData} 
                margin={isMobile ? { top: 40, right: 60, bottom: 40, left: 60 } : { top: 20, right: 30, bottom: 20, left: 30 }} 
              >
                <PolarGrid gridType="circle" stroke="#4B5563" strokeDasharray="3 3" />
                <PolarRadiusAxis domain={[0, 10]} tickCount={11} tick={false} axisLine={false} />
                <PolarAngleAxis dataKey="subject" tick={(props) => <AxisTick {...props} isMobile={isMobile} />} axisLine={false} tickLine={false} />
                <Radar dataKey="value" stroke="#FF3366" fill="#FF3366" fillOpacity={0.4} strokeWidth={4} dot={<DotWithValue />} isAnimationActive={false} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-10 p-4 lg:p-6 bg-white/5 rounded-3xl backdrop-blur-sm">
            <Image src="/bituach-yashir-logo.png" alt="Logo" width={120} height={45} className="brightness-0 invert" />
          </div>
        </div>
      </div>
    </div>
  );
}
