"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Search, Calendar, RotateCcw, User, ClipboardList, Target } from "lucide-react";

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
  const [selectedCategory, setSelectedCategory] = useState(""); // מסנן קטגוריה
  const [minScore, setMinScore] = useState(""); // ציון מינימלי לקטגוריה

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

  // לוגיקת סינון מתקדמת
  useEffect(() => {
    let temp = [...results];

    // סינון לפי שם
    if (searchTerm) {
      temp = temp.filter(r => r.full_name.toLowerCase().includes(searchTerm.toLowerCase()));
    }

    // סינון לפי תאריכים
    if (startDate) {
      temp = temp.filter(r => new Date(r.created_at) >= new Date(startDate));
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59);
      temp = temp.filter(r => new Date(r.created_at) <= end);
    }

    // סינון לפי קטגוריה (קטגוריה) וציון
    if (selectedCategory && minScore) {
      temp = temp.filter(r => r[selectedCategory] >= parseInt(minScore));
    } else if (selectedCategory) {
      // אם נבחר אגד אבל בלי ציון, אפשר למשל למיין לפיו (כאן פשוט נשאיר את הרשימה)
      temp.sort((a, b) => b[selectedCategory] - a[selectedCategory]);
    }

    setFilteredResults(temp);
  }, [searchTerm, startDate, endDate, selectedCategory, minScore, results]);

  const calculateAverages = () => {
    if (filteredResults.length === 0) return [];
    return keys.map(item => {
      const avg = filteredResults.reduce((acc, curr) => acc + (curr[item.key] || 0), 0) / filteredResults.length;
      return { name: item.label, value: Number(avg.toFixed(1)) };
    });
  };

  const pieData = calculateAverages();

  const renderCustomLabel = ({ cx, cy, midAngle, outerRadius, value, name }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = outerRadius + 25; 
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    const words = name.split(" ");
    let lines = words.length > 2 ? [words.slice(0, 2).join(" "), words.slice(2).join(" ")] : [name];

    return (
      <text x={x} y={y} fill="#1e3a8a" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize="12" fontWeight="800">
        {lines.map((line, i) => (
          <tspan key={i} x={x} dy={i === 0 ? 0 : 14}>
            {i === lines.length - 1 ? `${line} (${value})` : line}
          </tspan>
        ))}
      </text>
    );
  };

  return (
    <div className="min-h-screen p-6 bg-[#f8fafc] text-right font-sans" dir="rtl">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-black text-blue-900 mb-10 text-center">דשבורד מודל הבאלנס | מנהלי משמרת</h1>
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center mt-20 gap-4">
             <div className="w-12 h-12 border-4 border-blue-900 border-t-transparent rounded-full animate-spin"></div>
             <p className="font-bold text-blue-900">מעבד נתונים...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-10">
            
            <div className="flex justify-center">
              <div className="bg-white p-6 rounded-3xl shadow-sm border-b-4 border-blue-900 text-center min-w-[280px]">
                <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">סה"כ משיבים</p>
                <p className="text-6xl font-black text-blue-900">{filteredResults.length}</p>
              </div>
            </div>

            <div className="bg-white p-8 lg:p-12 rounded-[40px] shadow-sm border border-gray-100">
              <h2 className="text-2xl font-black mb-12 text-blue-900 text-center">התפלגות חוזקות </h2>
              <div className="h-[600px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart margin={{ top: 40, right: 60, bottom: 40, left: 60 }}>
                    <Pie
                      data={pieData}
                      cx="50%" cy="50%"
                      innerRadius={85}
                      outerRadius={145}
                      paddingAngle={6}
                      dataKey="value"
                      label={renderCustomLabel}
                      labelLine={{ stroke: '#cbd5e1', strokeWidth: 1 }}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={36} wrapperStyle={{ paddingTop: '80px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-blue-950 p-6 lg:px-10">
                <div className="flex flex-col gap-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <ClipboardList className="text-[#FF3366] w-8 h-8" />
                      <h2 className="text-xl font-black text-white">פירוט תשובות ומסננים</h2>
                    </div>
                    <button 
                      onClick={() => { setSearchTerm(""); setStartDate(""); setEndDate(""); setSelectedCategory(""); setMinScore(""); }} 
                      className="p-2 bg-white/10 hover:bg-[#FF3366] rounded-xl text-white transition-all flex items-center gap-2 text-sm font-bold"
                    >
                      <RotateCcw className="w-4 h-4" /> איפוס הכל
                    </button>
                  </div>
                  
                  {/* שורת המסננים המשודרגת */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 bg-white/5 p-4 rounded-3xl border border-white/10">
                    <div className="relative">
                      <Search className="absolute right-3 top-3 w-4 h-4 text-white/40" />
                      <input 
                        type="text" placeholder="חיפוש לפי שם..." 
                        className="w-full bg-white/10 border border-white/10 text-white text-sm rounded-xl py-2.5 pr-10 pl-4 outline-none focus:bg-white/20"
                        value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>

                    <div className="flex items-center gap-2 bg-white/10 border border-white/10 rounded-xl px-3 py-1">
                      <Calendar className="w-4 h-4 text-white/40" />
                      <input 
                        type="date" className="bg-transparent text-white text-xs outline-none invert brightness-200"
                        value={startDate} onChange={(e) => setStartDate(e.target.value)}
                      />
                      <span className="text-white/20 text-xs">עד</span>
                      <input 
                        type="date" className="bg-transparent text-white text-xs outline-none invert brightness-200"
                        value={endDate} onChange={(e) => setEndDate(e.target.value)}
                      />
                    </div>

                    <div className="relative">
                      <Target className="absolute right-3 top-3 w-4 h-4 text-white/40" />
                      <select 
                        className="w-full bg-white/10 border border-white/10 text-white text-sm rounded-xl py-2.5 pr-10 pl-4 outline-none focus:bg-white/20 appearance-none"
                        value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}
                      >
                        <option value="" className="text-blue-900">סינון לפי קטגוריה (כללי)</option>
                        {keys.map(k => (
                          <option key={k.key} value={k.key} className="text-blue-900">{k.label}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center gap-2 bg-white/10 border border-white/10 rounded-xl px-3">
                      <span className="text-white/40 text-xs font-bold whitespace-nowrap">ציון מעל:</span>
                      <input 
                        type="number" min="0" max="10" placeholder="0"
                        className="bg-transparent text-white text-sm w-full py-2 outline-none"
                        value={minScore} onChange={(e) => setMinScore(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-right border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-blue-900 border-b">
                      <th className="p-5 text-sm font-bold">תאריך</th>
                      <th className="p-5 text-sm font-bold">שם העובד/ת</th>
                      {keys.map(k => (
                        <th key={k.key} className={`p-5 text-[10px] font-bold text-center leading-tight w-20 ${selectedCategory === k.key ? 'bg-[#FF3366] text-white' : 'bg-blue-50/30'}`}>
                          {k.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredResults.length > 0 ? filteredResults.map((row) => {
                      const allUserSubmissions = results
                        .filter(r => r.full_name === row.full_name)
                        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
                      const submissionIndex = allUserSubmissions.findIndex(r => r.id === row.id) + 1;
                      const isMultiple = allUserSubmissions.length > 1;

                      return (
                        <tr key={row.id} className="border-b hover:bg-blue-50/30 transition-colors group">
                          <td className="p-5 text-xs text-gray-400 font-medium">
                            {new Date(row.created_at).toLocaleDateString('he-IL')}
                          </td>
                          <td className="p-5 font-bold text-blue-900">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 group-hover:bg-[#FF3366] group-hover:text-white transition-colors">
                                <User className="w-5 h-5" />
                              </div>
                              <div className="flex flex-col">
                                <span className="text-base">{row.full_name}</span>
                                {isMultiple && (
                                  <span className="text-[10px] text-[#FF3366] font-black uppercase tracking-tighter">
                                    הגשה מספר {submissionIndex}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          {keys.map(k => (
                            <td key={k.key} className={`p-5 text-center font-black ${selectedCategory === k.key ? 'text-[#FF3366] bg-red-50/50' : 'text-gray-700'}`}>
                              {row[k.key]}
                            </td>
                          ))}
                        </tr>
                      );
                    }) : (
                      <tr>
                        <td colSpan={8} className="p-24 text-center opacity-30 text-xl font-bold">לא נמצאו תוצאות לסינון זה</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
