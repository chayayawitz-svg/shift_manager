"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Search, Calendar, Filter, RotateCcw } from "lucide-react";

const supabaseUrl = 'https://rbyufhkwrgvywnovdwei.supabase.co';
const supabaseKey = 'sb_publishable_Wc1Cj7wgX1oWRZ2x5svXNg_wa2kVU4u';
const supabase = createClient(supabaseUrl, supabaseKey);

const COLORS = ['#FF3366', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const keys = [
  { key: 'cat1_leadership', label: 'שינויים ומצבי לחץ' },
  { key: 'cat2_soul_player', label: 'הנעה והובלה' },
  { key: 'cat3_mutual_guarantee', label: 'חשיבה יצירתית וחדשנות' },
  { key: 'cat4_professionalism', label: 'קילריות ויעדים' },
  { key: 'cat5_business_connection', label: 'יוזמה והשפעה' },
  { key: 'cat6_curiosity', label: 'עבודת צוות' }
];

export default function DashboardPage() {
  const [results, setResults] = useState<any[]>([]);
  const [filteredResults, setFilteredResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // מצבי מסננים
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [minScore, setMinScore] = useState(0);

  useEffect(() => {
    async function fetchResults() {
      const { data, error } = await supabase
        .from('survey_results')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error) {
        setResults(data || []);
        setFilteredResults(data || []);
      }
      setIsLoading(false);
    }
    fetchResults();
  }, []);

  // לוגיקת הסינון - רצה בכל פעם שאחד המסננים משתנה
  useEffect(() => {
    let temp = [...results];

    if (searchTerm) {
      temp = temp.filter(r => r.full_name.toLowerCase().includes(searchTerm.toLowerCase()));
    }

    if (startDate) {
      temp = temp.filter(r => new Date(r.created_at) >= new Date(startDate));
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59); // סוף היום
      temp = temp.filter(r => new Date(r.created_at) <= end);
    }

    if (minScore > 0) {
      // מסנן אם לפחות אחת הקטגוריות מתחת לציון המינימלי (עוזר לאתר חולשות)
      temp = temp.filter(r => 
        keys.some(k => r[k.key] >= minScore)
      );
    }

    setFilteredResults(temp);
  }, [searchTerm, startDate, endDate, minScore, results]);

  const resetFilters = () => {
    setSearchTerm("");
    setStartDate("");
    setEndDate("");
    setMinScore(0);
  };

  const calculateAverages = () => {
    if (filteredResults.length === 0) return [];
    return keys.map(item => {
      const avg = filteredResults.reduce((acc, curr) => acc + (curr[item.key] || 0), 0) / filteredResults.length;
      return { name: item.label, value: Number(avg.toFixed(1)) };
    });
  };

  const pieData = calculateAverages();

  return (
    <div className="min-h-screen p-8 bg-[#f4f7f6] text-right font-sans" dir="rtl">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-black text-blue-900 mb-8 text-center">סיכום תוצאות מודל הבאלנס</h1>
        
        {isLoading ? (
          <p className="text-center mt-10 font-bold text-lg text-blue-900">טוען נתונים מהמערכת...</p>
        ) : (
          <>
            {/* סרגל מסננים חדש */}
            <div className="bg-white p-6 rounded-3xl shadow-sm mb-8 border border-gray-100">
              <div className="flex flex-wrap items-end gap-4">
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-sm font-bold text-gray-600 mb-1 flex items-center gap-1">
                    <Search className="w-4 h-4" /> חיפוש לפי שם
                  </label>
                  <input 
                    type="text" 
                    className="w-full p-2 bg-gray-50 border rounded-xl focus:ring-2 ring-blue-100 outline-none transition"
                    placeholder="הקלידו שם..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-600 mb-1 flex items-center gap-1">
                    <Calendar className="w-4 h-4" /> מתאריך
                  </label>
                  <input 
                    type="date" 
                    className="p-2 bg-gray-50 border rounded-xl outline-none"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-600 mb-1 flex items-center gap-1">
                    <Calendar className="w-4 h-4" /> עד תאריך
                  </label>
                  <input 
                    type="date" 
                    className="p-2 bg-gray-50 border rounded-xl outline-none"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>

                <button 
                  onClick={resetFilters}
                  className="p-2.5 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition"
                  title="איפוס מסננים"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* כרטיס סיכום עליון */}
            <div className="flex justify-center mb-10">
              <div className="bg-white p-8 rounded-3xl shadow-lg border-r-8 border-blue-900 text-center min-w-[300px] transition-transform hover:scale-105">
                <p className="text-gray-500 font-bold text-lg">סה"כ משיבים (מסונן)</p>
                <p className="text-6xl font-black text-blue-900">{filteredResults.length}</p>
                {filteredResults.length !== results.length && (
                  <p className="text-xs text-blue-400 mt-2 font-bold">מתוך {results.length} סה"כ</p>
                )}
              </div>
            </div>

            {filteredResults.length === 0 ? (
              <div className="bg-white p-20 rounded-[40px] text-center shadow-sm">
                <Filter className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                <p className="text-2xl font-bold text-gray-400">לא נמצאו תוצאות העונות לסינון הנבחר</p>
              </div>
            ) : (
              <>
                {/* גרף עוגה */}
                <div className="bg-white p-10 rounded-[40px] shadow-2xl mb-12 border border-gray-100">
                  <h2 className="text-3xl font-black mb-6 text-blue-900 text-center">התפלגות חוזקות צוותית (ממוצע)</h2>
                  <div className="h-[600px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%" cy="50%"
                          outerRadius={160} innerRadius={100}
                          paddingAngle={5} dataKey="value"
                          label={({ name, value }) => `${name}: ${value}`}
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend verticalAlign="bottom" height={36} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* טבלה גולמית */}
                <div className="bg-white rounded-[40px] shadow-2xl overflow-hidden border border-gray-100">
                   <div className="bg-[#0b1a40] text-white p-6 font-black text-2xl text-center flex justify-between items-center px-12">
                     <span>פירוט תשובות גולמיות</span>
                     <span className="text-sm font-normal opacity-70">מציג {filteredResults.length} שורות</span>
                   </div>
                   <div className="overflow-x-auto">
                    <table className="w-full text-right border-collapse">
                      <thead>
                        <tr className="bg-gray-50 text-blue-900 border-b-2 border-gray-100">
                          <th className="p-5 font-bold">תאריך</th>
                          <th className="p-5 font-bold">שם מלא</th>
                          {keys.map(k => <th key={k.key} className="p-5 font-bold text-center text-xs">{k.label}</th>)}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredResults.map((row) => (
                          <tr key={row.id} className="border-b border-gray-50 hover:bg-blue-50/50 transition-all">
                            <td className="p-5 text-sm text-gray-400">
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
          </>
        )}
      </div>
    </div>
  );
}
