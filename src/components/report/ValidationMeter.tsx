import React from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';

interface ValidationMeterProps {
  validVotes: number;
  invalidVotes: number;
}

export const ValidationMeter: React.FC<ValidationMeterProps> = ({ validVotes, invalidVotes }) => {
  const totalVotes = validVotes + invalidVotes;
  // Mencegah pembagian dengan nol
  const validPercentage = totalVotes === 0 ? 50 : Math.round((validVotes / totalVotes) * 100);
  const invalidPercentage = totalVotes === 0 ? 50 : 100 - validPercentage;

  return (
    <div className="w-full flex flex-col gap-2">
      <div className="flex justify-between items-end text-sm">
        <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
          <ThumbsUp className="w-4 h-4" />
          <span>{validVotes} Valid</span>
        </div>
        <div className="flex items-center gap-1.5 text-red-600 dark:text-red-400 font-bold">
          <span>{invalidVotes} Hoaks/Keliru</span>
          <ThumbsDown className="w-4 h-4" />
        </div>
      </div>
      
      {/* Progress Bar Container */}
      <div className="w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden flex">
        <div 
          className="h-full bg-emerald-500 transition-all duration-500"
          style={{ width: `${validPercentage}%` }}
        />
        <div 
          className="h-full bg-red-500 transition-all duration-500"
          style={{ width: `${invalidPercentage}%` }}
        />
      </div>
      <p className="text-xs text-center text-slate-500 mt-1">
        Tingkat Kepercayaan: <span className="font-bold">{validPercentage}%</span>
      </p>
    </div>
  );
};