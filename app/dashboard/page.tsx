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
  const [isMobile, setIsMobile] = useState(false);

  // מצבי מסננים
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(""); 
  const [minScore, setMinScore] = useState("");

  // זיהוי גודל מסך
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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

  useEffect(() => {
    let temp = [...results];
    if (searchTerm) temp = temp.filter(r => r.full_name.toLowerCase().includes(searchTerm.toLowerCase()));
    if (startDate) temp = temp.filter(r => new Date(r.created_at) >= new Date(startDate));
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59);
      temp = temp.filter(r => new Date(r.created_at) <= end);
    }
    if (selectedCategory && minScore) {
      temp = temp.filter(r => r[selectedCategory] >= parseInt(minScore));
    } else if (selectedCategory) {
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

  // כיתובים מותאמים לנייד (קטנים יותר וקרובים יותר)
  const renderCustomLabel = ({ cx, cy, midAngle, outerRadius, value, name }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = outerRadius + (isMobile ? 12 : 25); 
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    const words = name.split(" ");
    let lines = words.length > 2 ? [words.slice(0, 2).join(" "), words.slice(2).join(" ")] : [name];

    return (
      <text x={x} y={y} fill="#1e3a8a" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={isMobile ? "9" : "12"} fontWeight="800">
        {lines.map((line, i) => (
          <tspan key={i} x={x} dy={i === 0 ? 0 : (isMobile ? 10 : 14)}>
            {i === lines.length - 1 ? `${line} (${value})` : line}
          </tspan>
        ))}
      </text>
    );
  };

  return (
    <div className="min-h-screen p-3 md:p-6 bg-[#f8fafc] text-right font-sans" dir="rtl">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl md:text-4xl font-black text-blue-900 mb-6 md:text-center">
          דשבורד מודל הבאלנס | מנהלי משמרת
        </h1>
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center mt-20 gap-4 font-bold text-blue-900 animate-pulse">
             מעבד נתונים...
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            
            {/* סה"כ משיבים */}
            <div className="flex justify-center">
              <div className="bg-white p-4 md:p-5 rounded-3xl shadow-sm border-b-4 border-blue-900 text-center min-w-[200px] md:min-w-[280px]">
                <p className="text-gray-400 font-bold text-[10px] md:text-xs uppercase tracking-widest">סה"כ משיבים</p>
                <p className="text-4xl md:text-6xl font-black text-blue-900">{filteredResults.length}</p>
              </div>
            </div>

            {/* תיבת הגרף - מותאמת לנייד */}
            <div className="bg-white p-4 md:p-8 rounded-[30px] md:rounded-[40px] shadow-sm border border-gray-100 w-full overflow-hidden">
              <h2 className="text-lg md:text-2xl font-black mb-4 text-blue-900 text-center">התפלגות חוזקות</h2>
              <div className={isMobile ? "h-[350px]" : "h-[480px]"}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart margin={{ top: 10, right: isMobile ? 30 : 80, bottom: 10, left: isMobile ? 30 : 80 }}>
                    <Pie
                      data={pieData}
                      cx="50%" cy="50%"
                      innerRadius={isMobile ? 55 : 105}
                      outerRadius={isMobile ? 85 : 165}
                      paddingAngle={4}
                      dataKey="value"
                      label={renderCustomLabel}
                      labelLine={{ stroke: '#cbd5e1', strokeWidth: 1 }}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                      ))}
                    </Pie>
                    <Tooltip />
                    {!isMobile && <Legend verticalAlign="bottom" height={36} wrapperStyle={{ paddingTop: '20px' }} />}
                  </PieChart>
                </ResponsiveContainer>
              </div>
              {isMobile && (
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {pieData.map((entry, index) => (
                    <div key={index} className="flex items-center gap-2 text-[10px] font-bold">
                      <div className="w-2 h-2 rounded-full" style={{ background: COLORS[index % COLORS.length] }}></div>
                      <span className="text-blue-900">{entry.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* טבלה ומסננים */}
            <div className="bg-white rounded-[30px] md:rounded-[40px] shadow-sm border border-gray-100 overflow-hidden mt-2">
              <div className="bg-blue-950 p-5 md:p-8">
                <div className="flex flex-col gap-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ClipboardList className="text-[#FF3366] w-6 h-6" />
                      <h2 className="text-lg font-black text-white">פירוט תשובות</h2>
                    </div>
                    <button 
                      onClick={() => { setSearchTerm(""); setStartDate(""); setEndDate(""); setSelectedCategory(""); setMinScore(""); }} 
                      className="p-1.5 bg-white/10 hover:bg-[#FF3366] rounded-lg text-white text-[10px] font-bold"
                    >
                       איפוס
                    </button>
                  </div>
                  
                  {/* מסננים - בנייד זה הופך לטור */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 bg-white/5 p-3 rounded-2xl border border-white/10">
                    <div className="relative">
                      <Search className="absolute right-3 top-2.5 w-3.5 h-3.5 text-white/40" />
                      <input type="text" placeholder="חיפוש שם..." className="w-full bg-white/10 border border-white/10 text-white text-xs rounded-lg py-2 pr-9 outline-none" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                    <div className="flex items-center gap-1 bg-white/10 border border-white/10 rounded-lg px-2 py-1.5">
                      <Calendar className="w-3.5 h-3.5 text-white/40" />
                      <input type="date" className="bg-transparent text-white text-[10px] outline-none invert" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                      <span className="text-white/20 text-[10px]">עד</span>
                      <input type="date" className="bg-transparent text-white text-[10px] outline-none invert" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                    </div>
                    <select className="bg-white/10 border border-white/10 text-white text-xs rounded-lg py-2 px-2 outline-none" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                        <option value="" className="text-blue-900">כל הקטגוריות</option>
                        {keys.map(k => <option key={k.key} value={k.key} className="text-blue-900">{k.label}</option>)}
                    </select>
                    <div className="flex items-center gap-2 bg-white/10 border border-white/10 rounded-lg px-2">
                      <span className="text-white/40 text-[10px] font-bold">ציון מעל:</span>
                      <input type="number" className="bg-transparent text-white text-xs w-full py-2 outline-none" value={minScore} onChange={(e) => setMinScore(e.target.value)} />
                    </div>
                  </div>
                </div>
              </div>

              {/* טבלה עם פס גלילה בנייד */}
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-right border-collapse min-w-[700px]">
                  <thead>
                    <tr className="bg-gray-50 text-blue-900 border-b text-xs">
                      <th className="p-4 font-bold">תאריך</th>
                      <th className="p-4 font-bold">שם העובד/ת</th>
                      {keys.map(k => (
                        <th key={k.key} className={`p-4 font-bold text-center leading-tight ${selectedCategory === k.key ? 'bg-[#FF3366] text-white' : 'bg-blue-50/30'}`}>
                          {k.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {filteredResults.length > 0 ? filteredResults.map((row) => {
                      const allUserSubmissions = results.filter(r => r.full_name === row.full_name).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
                      const submissionIndex = allUserSubmissions.findIndex(r => r.id === row.id) + 1;
                      const isMultiple = allUserSubmissions.length > 1;

                      return (
                        <tr key={row.id} className="border-b hover:bg-blue-50/20 transition-colors">
                          <td className="p-4 text-[10px] text-gray-400">{new Date(row.created_at).toLocaleDateString('he-IL')}</td>
                          <td className="p-4 font-bold text-blue-900">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                <User className="w-4 h-4" />
                              </div>
                              <div className="flex flex-col">
                                <span className="text-sm">{row.full_name}</span>
                                {isMultiple && <span className="text-[9px] text-[#FF3366] font-black italic">הגשה {submissionIndex}</span>}
                              </div>
                            </div>
                          </td>
                          {keys.map(k => (
                            <td key={k.key} className={`p-4 text-center font-black ${selectedCategory === k.key ? 'text-[#FF3366] bg-red-50/50' : 'text-gray-700'}`}>
                              {row[k.key]}
                            </td>
                          ))}
                        </tr>
                      );
                    }) : (
                      <tr><td colSpan={8} className="p-10 text-center opacity-30 font-bold">אין תוצאות</td></tr>
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
