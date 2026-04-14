"use client";

import { useState, FormEvent } from "react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from "recharts";
import { Star } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient('https://rbyufhkwrgvywnovdwei.supabase.co', 'sb_publishable_Wc1Cj7wgX1oWRZ2x5svXNg_wa2kVU4u');

const sections = [
  "התמודדות עם שינויים ומצבי לחץ",
  "הנעה והובלה",
  "חשיבה יצירתית וחדשנות",
  "קילריות והובלה ליעדים",
  "יוזמה והשפעה",
  "עבודת צוות",
];

export default function Home() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [skills, setSkills] = useState<Record<string, number>>(Object.fromEntries(sections.map(s => [s, 0])));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name || !email || !sections.every(s => skills[s] > 0)) {
      alert("נא למלא הכל"); return;
    }
    setIsSubmitting(true); setStatus(null);

    try {
      // 1. שמירה לסופבייס - מיפוי שמות עמודות לפי הצילומים שלך
      const { error: dbError } = await supabase.from('survey_results').insert([{ 
        full_name: name, 
        email: email, 
        cat1_leadership: skills[sections[0]], 
        cat2_soul_player: skills[sections[1]], 
       cat3_mutual_guarantee: skills[sections[2]], // זה השם שסידרנו ב-SQL
        cat4_professionalism: skills[sections[3]], 
       cat5_business_connection: skills[sections[4]], 
        cat6_curiosity: skills[sections[5]]
      }]);

      if (dbError) throw new Error(`סופבייס: ${dbError.message}`);

      // 2. שליחה למייל (שולחים רק מספרים!)
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
    <div className="min-h-screen p-4 bg-[#020414] text-right" dir="rtl">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 items-start">
        <form onSubmit={handleSubmit} className="bg-white rounded-[40px] p-8 lg:p-12 flex-1 shadow-2xl w-full border-t-8 border-[#FF3366]">
          <h1 className="text-3xl font-black text-blue-900 mb-6 text-center">מודל הבאלנס</h1>
          <div className="space-y-4 mb-8">
            <input placeholder="שם מלא" className="w-full border-b-2 p-3 font-bold" value={name} onChange={e => setName(e.target.value)} required />
            <input placeholder="אימייל" className="w-full border-b-2 p-3 font-bold text-left" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="space-y-8 max-h-[450px] overflow-y-auto pl-2 custom-scrollbar">
            {sections.map(s => (
              <div key={s} className="border-b pb-4">
                <label className="font-bold text-blue-950 block mb-2">{s}</label>
                <div className="flex gap-1 justify-center">
                  {[1,2,3,4,5,6,7,8,9,10].map(n => (
                    <button key={n} type="button" onClick={() => setSkills(p => ({ ...p, [s]: n }))}>
                      <Star className={`w-7 h-7 ${n <= skills[s] ? "fill-[#FF3366] text-[#FF3366]" : "text-gray-200"}`} />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <button disabled={isSubmitting} className="w-full mt-10 bg-[#FF3366] text-white py-5 rounded-full font-bold text-xl shadow-lg transition active:scale-95">
            {isSubmitting ? "שולח..." : "שלחו לי את המפה !"}
          </button>
          {status === "success" && <p className="text-green-600 text-center mt-4 font-bold">✓ המפה נשלחה בהצלחה!</p>}
          {status && status !== "success" && <p className="text-red-600 text-center mt-4 text-xs font-bold bg-red-50 p-2">{status}</p>}
        </form>

        <div className="flex-1 bg-[#020414] rounded-[40px] p-8 flex flex-col items-center justify-center min-h-[600px] border border-white/10">
          <div className="bg-[#FF3366] px-8 py-2 rounded-full mb-8 text-white font-bold text-xl">
             {name ? `המפה של ${name}` : "המפה האישית שלך"}
          </div>
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart data={sections.map(s => ({ subject: s, value: skills[s] }))}>
              <PolarGrid stroke="#444" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: 'white', fontSize: 10 }} />
              <Radar dataKey="value" stroke="#FF3366" fill="#FF3366" fillOpacity={0.5} strokeWidth={3} isAnimationActive={false} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
