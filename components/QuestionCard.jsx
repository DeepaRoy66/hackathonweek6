export default function QuestionCard({ index, q }) {
  return (
    <div className="bg-white dark:bg-[#1E293B] p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-start gap-4">
        <span className="flex-shrink-0 w-8 h-8 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg flex items-center justify-center font-black text-sm">
          {index + 1}
        </span>
        <div className="space-y-2">
          <p className="font-bold text-slate-800 dark:text-slate-100">{q.q}</p>
          <div className="pt-2 border-t border-slate-50 dark:border-slate-800">
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
              <span className="text-[10px] font-black uppercase text-indigo-500 mr-2">Answer:</span>
              {q.a}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}