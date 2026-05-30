import React from 'react';
import { Loader2 } from 'lucide-react';

export const ProcessingState: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="relative">
        <div className="absolute inset-0 bg-indigo-200 rounded-full animate-ping opacity-25"></div>
        <Loader2 className="w-16 h-16 text-indigo-600 animate-spin relative z-10" />
      </div>
      <h2 className="mt-8 text-2xl font-bold text-slate-800">Analyzing Content</h2>
      <p className="mt-2 text-slate-500 max-w-md text-center">
        Our AI is watching your video, identifying key moments, and generating quiz questions...
      </p>
      
      <div className="mt-8 w-full max-w-md bg-slate-200 rounded-full h-2.5 dark:bg-slate-700 overflow-hidden">
        <div className="bg-indigo-600 h-2.5 rounded-full animate-progress" style={{ width: '60%' }}></div>
      </div>
      <style>{`
        @keyframes progress {
          0% { width: 0% }
          50% { width: 70% }
          100% { width: 95% }
        }
        .animate-progress {
          animation: progress 8s ease-out forwards;
        }
      `}</style>
    </div>
  );
};