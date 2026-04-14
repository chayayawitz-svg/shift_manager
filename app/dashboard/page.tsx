"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

// חיבור ל-Supabase עם הנתונים שלך
const supabaseUrl = 'https://rbyufhkwrgvywnovdwei.supabase.co';
const supabaseKey = 'sb_publishable_Wc1Cj7wgX1oWRZ2x5svXNg_wa2kVU4u';
const supabase = createClient(supabaseUrl, supabaseKey);

export default function DashboardPage() {
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchResults() {
      // משיכת כל הנתונים מהטבלה, מסודרים מהחדש לישן
      const { data, error } = await supabase
        .from('survey_results')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("שגיאה במשיכת הנתונים:", error);
      } else {
        setResults(data || []);
      }
      setIsLoading(false);
    }

    fetchResults();
  }, []);

  return (
    <div className="min-h-screen p-8 bg-[#f4f7f6] text-right" dir="rtl">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-black text-blue-900 mb-8">דשבורד מנהלים - תוצאות הסקר</h1>
        
        {isLoading ? (
          <p className="text-xl text-center mt-10">טוען נתונים מ-Supabase...</p>
        ) : results.length === 0 ? (
          <p className="text-xl text-center mt-10 text-gray-500">עדיין אין תוצאות בסקר. ברגע שמישהו ימלא, הנתונים יופיעו כאן.</p>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-[#0b1a40] text-white">
                  <th className="p-4 border-b">תאריך</th>
                  <th className="p-4 border-b">שם מלא</th>
                  <th className="p-4 border-b">אימייל</th>
                  <th className="p-4 border-b">הובלה והשפעה</th>
                  <th className="p-4 border-b">שחקן נשמה</th>
                  <th className="p-4 border-b">ערבות הדדית</th>
                  <th className="p-4 border-b">מקצועיות</th>
                  <th className="p-4 border-b">חיבור לביזנס</th>
                  <th className="p-4 border-b">סקרנות ולמידה</th>
                  <th className="p-4 border-b">חדשנות</th>
                  <th className="p-4 border-b">ניהול שותפויות</th>
                </tr>
              </thead>
              <tbody>
                {results.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50 border-b transition-colors">
                    <td className="p-4 text-gray-600">
                      {new Date(row.created_at).toLocaleDateString('he-IL')}
                    </td>
                    <td className="p-4 font-bold">{row.full_name}</td>
                    <td className="p-4 text-gray-500">{row.email}</td>
                    <td className="p-4">{row.cat1_leadership || '-'}</td>
                    <td className="p-4">{row.cat2_soul_player || '-'}</td>
                    <td className="p-4">{row.cat3_mutual_guarantee || '-'}</td>
                    <td className="p-4">{row.cat4_professionalism || '-'}</td>
                    <td className="p-4">{row.cat5_business_connection || '-'}</td>
                    <td className="p-4">{row.cat6_curiosity || '-'}</td>
                    <td className="p-4">{row.cat7_innovation || '-'}</td>
                    <td className="p-4">{row.cat8_partnership || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
