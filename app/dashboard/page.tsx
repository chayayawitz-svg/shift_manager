"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

// התחברות ל-Supabase
const supabaseUrl = 'https://rbyufhkwrgvywnovdwei.supabase.co';
const supabaseKey = 'sb_publishable_Wc1Cj7wgX1oWRZ2x5svXNg_wa2kVU4u';
const supabase = createClient(supabaseUrl, supabaseKey);

const COLORS = ['#FF3366', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function DashboardPage() {
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchResults() {
      const { data, error } = await supabase
        .from('survey_results')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error) setResults(data || []);
      setIsLoading(false);
    }
    fetchResults();
  }, []);

  const calculateAverages = () => {
    if (results.length === 0) return [];
    
    // רשימת המיומנויות המעודכנת (6 מיומנויות)
    const keys = [
      { key: 'cat1_leadership', label: 'שינויים ומצבי לחץ' },
      { key: 'cat2_soul_player', label: 'הנעה והובלה' },
      { key: 'cat3_mutual_guarantee', label: 'חשיבה יצירתית וחדשנות' },
      { key: 'cat4_professionalism', label: 'קילריות ויעדים' },
      { key: 'cat5_business_connection', label: 'יוזמה והשפעה' },
      { key: 'cat6_curiosity', label: 'עבודת צוות' }
    ];

    return keys.map(item => {
      const avg = results.reduce((acc, curr) => acc + (curr[item.key] || 0), 0) / results.length;
      return { name: item.label, value: Number(avg.toFixed(1)) };
    });
  };

  const pieData = calculateAverages();

  return (
    <div className="min-h-screen p-8 bg-[#f4f7f6] text-right" dir="rtl">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-black text-blue-900 mb-8 text-center">סיכום תוצאות מודל הבאלנס</h1>
        
        {isLoading ? (
          <p className="text-center mt-10 font-bold text-lg text-blue-900">טוען נתונים מהמערכת...</p>
        ) : (
          <>
            {/* כרטיסי סיכום עליונים */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
              <div className="bg-white p-8 rounded-3xl shadow-lg border-r-8 border-blue-900 text-center">
                <p className="text-gray-500 font-bold text-lg">סה"כ משיבים</p>
                <p className="text-5xl font-black text-blue-900">{results.length}</p>
              </div>
              <div className="bg-white p-8 rounded-3xl shadow-lg border-r-8 border-[#FF3366] text-center">
                <p className="text-gray-500 font-bold text-lg">ממוצע התמודדות (צוותי)</p>
                <p className="text-5xl font-black text-[#FF3366]">
                  {(results.reduce((acc, curr) => acc + (curr.cat1_leadership || 0), 0) / results.length || 0).toFixed(1)}
                </p>
              </div>
            </div>

            {/* גרף עוגה מיושר ומתוקן */}
            <div className="bg-white p-10 rounded-[40px] shadow-2xl mb-12 border border-gray-100 overflow-hidden">
              <h2 className="text-3xl font-black mb-6 text-blue-900 text-center">התפלגות חוזקות צוותית (ממוצע)</h2>
              <div className="h-[700px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart margin={{ top: 20, right: 40, bottom: 20, left: 40 }}>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      label={({ cx, cy, midAngle, innerRadius, outerRadius, value, name }) => {
                        const RADIAN = Math.PI / 180;
                        const mAngle = midAngle || 0;
                        const oRadius = outerRadius || 0;
                        const centerX = cx || 0;
                        const centerY = cy || 0;
                        const textRadius = oRadius + 45; 
                        const x = centerX + textRadius * Math.cos(-mAngle * RADIAN);
                        const y = centerY + textRadius * Math.sin(-mAngle * RADIAN);
                        
                        return (
                          <text 
                            x={x} y={y} fill="#4b5563" textAnchor="middle" 
                            dominantBaseline="central" fontSize="14" fontWeight="bold"
                          >
                            {`${name}: ${value}`}
                          </text>
                        );
                      }}
                      labelLine={{ stroke: '#4b5563', strokeWidth: 2 }}
                      outerRadius={160}
                      innerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend 
                        verticalAlign="bottom" height={36} iconType="circle"
                        wrapperStyle={{ paddingTop: "80px", fontSize: "14px", fontWeight: "bold" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* טבלה גולמית מעודכנת */}
            <div className="bg-white rounded-[40px] shadow-2xl overflow-hidden border border-gray-100 mb-10">
               <div className="bg-[#0b1a40] text-white p-6 font-black text-2xl text-center">פירוט תשובות גולמיות</div>
               <div className="overflow-x-auto">
                <table className="w-full text-right border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-blue-900 border-b-2 border-gray-100">
                      <th className="p-5 font-bold">תאריך</th>
                      <th className="p-5 font-bold">שם מלא</th>
                      <th className="p-5 font-bold text-center text-xs">שינויים/לחץ</th>
                      <th className="p-5 font-bold text-center text-xs">הנעה/הובלה</th>
                      <th className="p-5 font-bold text-center text-xs">יצירתיות</th>
                      <th className="p-5 font-bold text-center text-xs">קילריות</th>
                      <th className="p-5 font-bold text-center text-xs">יוזמה</th>
                      <th className="p-5 font-bold text-center text-xs">עבודת צוות</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((row) => (
                      <tr key={row.id} className="border-b border-gray-50 hover:bg-blue-50/50 transition-all">
                        <td className="p-5 text-sm text-gray-500">
                          {new Date(row.created_at).toLocaleDateString('he-IL')}
                        </td>
                        <td className="p-5 font-black text-blue-900">{row.full_name}</td>
                        <td className="p-5 font-bold text-center">{row.cat1_leadership}</td>
                        <td className="p-5 font-bold text-center">{row.cat2_soul_player}</td>
                        <td className="p-5 font-bold text-center">{row.cat3_mutual_guarantee}</td>
                        <td className="p-5 font-bold text-center">{row.cat4_professionalism}</td>
                        <td className="p-5 font-bold text-center">{row.cat5_business_connection}</td>
                        <td className="p-5 font-bold text-center">{row.cat6_curiosity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
