"use client";
import { useState, useEffect } from "react";
import QuestionCard from "../components/QuestionCard";

export default function Homepage() {
  const [questions, setQuestions] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [numToGen, setNumToGen] = useState(3);

  const loadHistory = async () => {
    const res = await fetch("/api/history");
    if (res.ok) setHistory(await res.json());
  };

  useEffect(() => { loadHistory(); }, []);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);

    const fd = new FormData();
    fd.append("file", file);

    try {
      const res = await fetch(`/api/generate?count=${numToGen}`, { method: "POST", body: fd });
      const result = await res.json();
      if (result.questions) setQuestions(prev => [...result.questions, ...prev]);
      loadHistory();
    } catch (err) { alert("Upload failed"); }
    setLoading(false);
  };

  const deleteSession = async (id) => {
    if (!confirm("Delete this session?")) return;
    const res = await fetch(`/api/history/${id}`, { method: "DELETE" });
    if (res.ok) loadHistory();
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="w-80 bg-white border-r p-8 hidden lg:flex flex-col">
        <h2 className="text-xl font-black mb-10 text-indigo-600 italic uppercase">Question Generator</h2>
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">History</h3>
        <div className="space-y-3 flex-1 overflow-y-auto">
          {history.map(h => (
            <div key={h._id} className="group flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-transparent hover:border-indigo-100 transition-all">
              <div className="truncate flex-1">
                <p className="text-xs font-bold truncate">{h.filename}</p>
              </div>
              <button onClick={() => deleteSession(h._id)} className="ml-2 text-slate-300 hover:text-rose-500 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
            </div>
          ))}
        </div>
      </aside>

      <main className="flex-1 p-10 max-w-4xl mx-auto">
        <header className="mb-12 text-center lg:text-left">
          <h1 className="text-5xl font-black tracking-tight mb-2">AI Quiz Studio</h1>
          <p className="text-slate-500 font-medium italic">Assignment: Service Deployment & Operations</p>
        </header>

        <section className="bg-white p-8 rounded-[2rem] shadow-xl border border-slate-100 mb-12">
          <div className="flex flex-col md:flex-row gap-6 items-end">
            <div className="w-full md:w-32">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Count</label>
              <input type="number" min="1" max="10" value={numToGen} onChange={(e)=>setNumToGen(e.target.value)} className="w-full bg-slate-50 border-2 rounded-xl px-4 py-3 font-bold focus:border-indigo-500 outline-none transition-all"/>
            </div>
            <div className="flex-1 w-full">
              <input type="file" id="pdf" className="hidden" onChange={handleUpload} accept=".pdf" />
              <label htmlFor="pdf" className={`flex items-center justify-center w-full h-[60px] rounded-xl font-black cursor-pointer transition-all ${loading ? 'bg-indigo-100 text-indigo-400 animate-pulse' : 'bg-indigo-600 text-white shadow-lg hover:bg-indigo-700'}`}>
                {loading ? "PROCESSING..." : "UPLOAD PDF (2 PAGES ONLY)"}
              </label>
            </div>
          </div>
        </section>

        <div className="space-y-4">
          {questions.map((q, i) => <QuestionCard key={i} index={i} q={q} />)}
        </div>
      </main>
    </div>
  );
}