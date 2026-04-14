"use client";

import { useState, useRef, FormEvent, useEffect } from "react";
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
} from "recharts";
import { Star } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

// חיבור לסופבייס - הנתונים נשמרים כפי שהיו
const supabase = createClient('https://rbyufhkwrgvywnovdwei.supabase.co', 'sb_publishable_Wc1Cj7wgX1oWRZ2x5svXNg_wa2kVU4u');

const sections = [
  "התמודדות עם שינויים ומצבי לחץ",
  "הנעה והובלה",
  "חשיבה יצירתית וחדשנות",
  "קילריות והובלה ליעדים",
  "יוזמה והשפעה",
  "עבודת צוות",
];

/* -------------------------------------------------
   רכיבי עיצוב יוקרתיים (שחזור מלא)
------------------------------------------------- */
const Stars = ({ skill, value, onChange }: any) => (
  <div className="space-y-3 border-b border-gray-100 pb-6 text-right">
    <label className="text-xl font-bold text-blue-950 block">{skill}</label>
    <div className="flex gap-2 justify-center flex-wrap" dir="rtl">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
        <button key={n} type="button" onClick={() => onChange(n)} className="transition hover:scale-125 p-1">
          <div className="flex flex-col items-center">
            <Star className={`w-8 h-8 ${n <= value ? "fill-[#FF3366] text-[#FF3366]" : "text-gray-200"}`} />
            <span className="text-[11px] text-gray-500 mt-1 font-bold text-center">{n}</span>
          </div>
        </button>
      ))}
    </div>
  </div>
);

const DotWithValue = (props: any) => {
  const { cx, cy, payload } = props;
  const val = payload?.value;
  if (!val || val === 0) return null;
  return (
    <g>
      <circle cx={cx} cy={cy} r={12} fill="#FF3366" stroke="#fff" strokeWidth={2} />
      <text x={cx} y={cy + 5} fill="#fff" fontSize={11} textAnchor="middle" fontWeight={800} style={{fontFamily: 'Rubik'}}>{val}</text>
    </g>
  );
};

const AxisTick = ({ x, y, cx, cy, payload, isMobile }: any) => {
  const dx = x - cx; const dy = y - cy;
  const d = Math.sqrt(dx * dx + dy * dy);
  const nx = d > 0 ? dx / d : 0; const ny = d > 0 ? dy / d : 0;
  const offset = isMobile ? 30 : 45; 
  const newX = x + nx * offset; const newY = y + ny * offset;

  let lines: string[] = [];
  const words = payload.value.split(" ");
  let current = "";
  words.forEach((w: string) => {
    if ((current + " " + w).length > 7) { lines.push(current); current = w; } 
    else { current += (current ? " " : "") + w; }
  });
  if (current) lines.push(current);

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
  const [skills, setSkills] = useState<Record<string, number>>(Object.fromEntries(sections.map(s => [s, 0])));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name || !email || !sections.every(s => skills[s] > 0)) {
      alert("נא למלא הכל"); return;
    }
    setIsSubmitting(true); setStatus(null);

    try {
      // 1. שמירה לסופבייס - הנתונים המדויקים שסידרת ב-SQL
      const { error: dbError } = await supabase.from('survey_results').insert([{ 
        full_name: name, 
        email: email, 
        cat1_leadership: skills[sections[0]], 
        cat2_soul_player: skills[sections[1]], 
        cat3_mutual_guarantee: skills[sections[2]], // שם העמודה כפי שהמשתמש כתב
        cat4_professionalism: skills[sections[3]], // שם העמודה כפי שהמשתמש כתב
        cat5_business_connection: skills[sections[4]], // שם העמודה כפי שהמשתמש כתב
        cat6_curiosity: skills[sections[5]]
      }]);

      if (dbError) throw new Error(`סופבייס: ${dbError.message}`);

      // 2. שליחה למייל (שולחים רק מספרים - ב-backend ה-API מייצר את הגרף)
      const mailRes = await fetch("/api/send-survey-results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, skills }),
      });

      if (!mailRes.ok) throw new Error("מייל נכשל");

      setStatus("success");
    } catch (err: any) {
      setStatus(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen p-4 bg-[#020414] text-right font-sans" dir="rtl">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 items-start">
        
        {/* טופס הדירוג */}
        <form onSubmit={handleSubmit} className="bg-white rounded-[40px] p-8 lg:p-12 flex-1 shadow-2xl w-full border-t-8 border-[#FF3366]">
          <h1 className="text-3xl font-black text-blue-900 mb-2 text-center text-pretty">מודל הבאלנס</h1>
          <p className="text-blue-600 text-center mb-8 font-bold text-xl italic underline">קורס מנהלי משמרת</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
            <input placeholder="שם מלא" className="w-full border-b-4 border-gray-100 p-4 text-xl focus:border-[#FF3366] outline-none transition bg-gray-50 rounded-t-2xl text-right font-bold" value={name} onChange={e => setName(e.target.value)} required />
            <input placeholder="אימייל" type="email" className="w-full border-b-4 border-gray-100 p-4 text-xl focus:border-[#FF3366] outline-none transition bg-gray-50 rounded-t-2xl text-left font-bold" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>

          <div className="space-y-10 max-h-[500px] overflow-y-auto pl-4 custom-scrollbar">
            {sections.map(s => (
              <Stars key={s} skill={s} value={skills[s]} onChange={(v: number) => setSkills(p => ({ ...p, [s]: v }))} />
            ))}
          </div>

          <button disabled={isSubmitting} className="w-full mt-10 bg-[#FF3366] text-white py-5 rounded-full font-black text-2xl shadow-xl active:scale-95 transition disabled:bg-gray-400">
            {isSubmitting ? "שולח נתונים..." : "שלחו לי את המפה !"}
          </button>
          
          {status === "success" && <p className="text-green-600 text-center mt-6 font-black text-xl animate-pulse">✓ המפה נשלחה בהצלחה! התוצאות נשמרו.</p>}
          {status && status !== "success" && <div className="mt-6 p-4 bg-red-50 border-r-4 border-red-500 text-red-700 font-bold text-center text-sm">{status}</div>}
        </form>

        {/* המפה היוקרתית (שחזור מלא) */}
        <div className="flex-1 bg-gradient-to-br from-[#3b002a] via-[#050824] to-[#020414] rounded-[40px] p-4 lg:p-12 flex flex-col items-center justify-center shadow-2xl min-h-[600px] lg:min-h-[700px] border-2 border-white/10 w-full overflow-hidden relative">
          
          <div className="bg-[#FF3366] px-10 py-3 rounded-full shadow-2xl mb-10 transform -rotate-1 border-2 border-white/20">
            <h2 className="text-2xl lg:text-3xl font-black text-white">{name ? `המפה של ${name}` : "המפה האישית שלך"}</h2>
          </div>

          <div className="w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height={isMobile ? 450 : 550}>
              <RadarChart cx="50%" cy="50%" outerRadius={isMobile ? 120 : 180} data={sections.map(s => ({ subject: s, value: skills[s] }))}>
                <PolarGrid gridType="circle" stroke="#4B5563" strokeDasharray="3 3" />
                <PolarRadiusAxis domain={[0, 10]} tickCount={11} tick={false} axisLine={false} />
                <PolarAngleAxis dataKey="subject" tick={(props) => <AxisTick {...props} isMobile={isMobile} />} axisLine={false} />
                <Radar dataKey="value" stroke="#FF3366" fill="#FF3366" fillOpacity={0.4} strokeWidth={4} dot={<DotWithValue />} isAnimationActive={false} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-10 opacity-80 text-center">
             <div className="text-white font-bold text-xl italic">ביטוח ישיר</div>
          </div>
        </div>
      </div>
    </div>
  );
}
