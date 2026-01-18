"use client";
import { useState, useEffect } from "react";
import QuestionCard from "../components/QuestionCard";

export default function Homepage() {
  const [questions, setQuestions] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [numToGen, setNumToGen] = useState(3); 

  const loadHistory = async () => {
    try {
      const res = await fetch("/api/history");
      if (res.ok) setHistory(await res.json());
    } catch (e) { console.error("History offline"); }
  };

  useEffect(() => { loadHistory(); }, []);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);

    const fd = new FormData();
    fd.append("file", file);

    try {
      // Added a timeout controller to the fetch
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000); // 12s timeout

      const res = await fetch(`/api/generate?count=${numToGen}`, { 
        method: "POST", 
        body: fd,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!res.ok) throw new Error("Server Timeout");

      const result = await res.json();

      if (result && result.questions && result.questions.length > 0) {
        setQuestions(prev => [...result.questions, ...prev].slice(0, 50));
      } else {
        alert("The AI took too long or failed. Try a smaller PDF or fewer questions.");
      }
      
    } catch (error) {
      console.error("Connection error:", error);
      alert("Connection Failed: The server took too long. Try reducing the question count.");
    } finally {
      setLoading(false);
      loadHistory();
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      {/* Sidebar */}
      <aside className="w-80 bg-white border-r p-8 hidden xl:flex flex-col shadow-sm">
        <h2 className="text-xl font-black text-indigo-600 mb-10 italic">MENTORA</h2>
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Recent Sessions</h3>
        <div className="space-y-3 overflow-y-auto">
          {history.map(h => (
            <div key={h._id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <p className="text-xs font-bold text-slate-700 truncate">{h.filename}</p>
            </div>
          ))}
        </div>
      </aside>

      {/* Main Studio */}
      <main className="flex-1 p-8 lg:p-16 max-w-5xl mx-auto">
        <header className="mb-10 text-center lg:text-left">
          <h1 className="text-5xl font-black text-slate-900 tracking-tight mb-3">Quiz Studio</h1>
          <p className="text-slate-500 font-medium">Fast AI generation (Optimized for Vercel).</p>
        </header>

        <div className="bg-white p-8 rounded-[2rem] shadow-xl border mb-12">
          <div className="flex flex-col md:flex-row items-end gap-6">
            <div className="w-full md:w-32">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Count</label>
              <input type="number" value={numToGen} onChange={(e) => setNumToGen(e.target.value)} className="w-full bg-slate-50 border-2 rounded-xl px-4 py-3 font-bold" min="1" max="10" />
            </div>
            <div className="flex-1 w-full">
              <input type="file" id="pdf" className="hidden" onChange={handleUpload} accept=".pdf" />
              <label htmlFor="pdf" className={`flex items-center justify-center w-full h-[60px] rounded-xl font-black transition-all cursor-pointer ${loading ? 'bg-indigo-100 text-indigo-400' : 'bg-indigo-600 text-white shadow-lg'}`}>
                {loading ? "PROCESSING..." : "UPLOAD & GENERATE"}
              </label>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {questions.map((q, i) => <QuestionCard key={i} index={i} q={q} />)}
        </div>
      </main>
    </div>
  );
}