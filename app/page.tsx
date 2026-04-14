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
import html2canvas from "html2canvas"; // ודאי שהתקנת: npm install html2canvas

// התחברות ל-Supabase שלך
const supabaseUrl = 'https://rbyufhkwrgvywnovdwei.supabase.co';
const supabaseKey = 'sb_publishable_Wc1Cj7wgX1oWRZ2x5svXNg_wa2kVU4u';
const supabase = createClient(supabaseUrl, supabaseKey);

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
   רכיבים ויזואליים - שחזור המראה הישן והעדין
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

// שחזור הנקודות העדינות עם המספרים בגרף
const DotWithValue = (props: any) => {
  const { cx, cy, value } = props;
  if (!value) return null;
  return (
    <g>
      {/* שחזור הרדיוס ל-12 והפונט ל-11 - עדין כמו קודם */}
      <circle cx={cx} cy={cy} r={12} fill="#FF3366" stroke="#fff" strokeWidth={2} />
      <text x={cx} y={cy + 5} fill="#fff" fontSize={11} textAnchor="middle" fontWeight={800} style={{fontFamily: 'Rubik'}}>
        {value}
      </text>
    </g>
  );
};

// שחזור יישור הטקסט מסביב לגרף - בדיוק כמו בתמונה הישנה
const AxisTick = ({ x, y, cx, cy, payload, isMobile }: any) => {
  const dx = x - cx;
  const dy = y - cy;
  const d = Math.sqrt(dx * dx + dy * dy);
  const nx = d > 0 ? dx / d : 0;
  const ny = d > 0 ? dy / d : 0;
  
  // שחזור ה-offset המקורי והקטן (30 בנייד, 45 במחשב) - זה יחזיר את המילים פנימה
  const offset = isMobile ? 30 : 45; 
  const newX = x + nx * offset;
  const newY = y + ny * offset;

  let lines: string[] = [];
  
  // שחזור שבירת השורות העדינה
  const words = payload.value.split(" ");
  let current = "";
  words.forEach((w: string) => {
    if ((current + " " + w).length > 7) { lines.push(current); current = w; } 
    else { current += (current ? " " : "") + w; }
  });
  if (current) lines.push(current);

  return (
    /* שחזור גודל פונט עדין - 9px בנייד, 10px במחשב - כמו שאהבת */
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
      // --- צילום תמונה חדה (Scale 3) מבלי לשנות את העיצוב ---
      let png = "";
      if (chartRef.current) {
        const canvas = await html2canvas(chartRef.current, {
          scale: 3, // שומר על חדות במייל, אבל לא משנה את מראה הגרף על המסך
          useCORS: true,
          logging: false,
          backgroundColor: "#020414", // שחזור הרקע הכהה והמקורי לצילום
        });
        png = canvas.toDataURL("image/png", 1.0).split(",")[1];
      }

      // שמירה ל-Supabase
      await supabase.from('survey_results').insert([
        { 
          full_name: name, email: email, 
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

      // שליחה ל-API המקורי שלך
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
    <div className="min-h-screen p-4 bg-[#020414] text-right" dir="rtl">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 items-start">
        
        {/* טופס הדירוג */}
        <form onSubmit={handleSubmit} className="bg-white rounded-[40px] p-8 lg:p-12 flex-1 shadow-2xl w-full">
          <h1 className="text-3xl font-black text-blue-900 mb-8 text-center">מודל הבאלנס <span className="text-[#FF3366]">|</span> פיתוח הדרכה</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
            <input placeholder="שם מלא" className="w-full border-b-4 border-gray-100 p-4 text-xl focus:border-[#FF3366] outline-none transition bg-gray-50 rounded-t-2xl" value={name} onChange={(e) => setName(e.target.value)} required />
            <input placeholder="אימייל" type="email" className="w-full border-b-4 border-gray-100 p-4 text-xl focus:border-[#FF3366] outline-none transition bg-gray-50 rounded-t-2xl" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="space-y-10 max-h-[500px] overflow-y-auto pl-4 custom-scrollbar">
            {sections.map((s) => (
              <Stars key={s} skill={s} value={skills[s]} onChange={(v: number) => setSkills(p => ({ ...p, [s]: v }))} />
            ))}
          </div>
          <button disabled={isSubmitting} className="w-full mt-10 bg-[#FF3366] text-white py-5 rounded-full font-black text-2xl shadow-xl active:scale-95 transition">
            {isSubmitting ? "מייצר מפה..." : "שלחו לי את המפה !"}
          </button>
          {status === "success" && <p className="text-green-600 text-center mt-6 font-black text-xl">✓ הסקר נשלח בהצלחה!</p>}
        </form>

        {/* תצוגת הגרף - שחזור המראה הישן והעדין */}
        <div ref={chartRef} className="flex-1 bg-gradient-to-br from-[#3b002a] via-[#050824] to-[#020414] rounded-[40px] p-4 lg:p-12 flex flex-col items-center justify-center shadow-2xl min-h-[600px] lg:min-h-[650px] border-2 border-white/10 w-full overflow-hidden relative">
          
          {/* שחזור הכותרת העדינה המקורית (כמו בתמונה השנייה) */}
          <h2 className="text-2xl lg:text-3xl font-black text-white mb-8 bg-[#FF3366] px-8 py-2 rounded-full shadow-lg">
            {name ? `המפה של ${name}` : "המפה האישית שלך"}
          </h2>

          <div className="w-full flex items-center justify-center">
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
