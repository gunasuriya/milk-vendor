"use client";

import { useMemo } from 'react';
import { useAppContext } from '@/context/AppContext';
import { X } from 'lucide-react';

interface Props {
  entryDate: string;
  onClose: () => void;
}

const formatTime = (date: Date) => 
  date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

export default function DailyLogModal({ entryDate, onClose }: Props) {
  const { allEntries } = useAppContext();

  const { todayEntries, totalL, flatCount } = useMemo(() => {
    const filtered = allEntries
      .filter(entry => entry.date === entryDate)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    const total = filtered.reduce((sum, entry) => sum + entry.liters, 0);
    const count = new Set(filtered.map(entry => entry.buyerId)).size;
    
    return { todayEntries: filtered, totalL: total, flatCount: count };
  }, [allEntries, entryDate]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content space-y-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Log for {entryDate}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-blue-50 p-4 rounded-lg shadow text-center">
            <div className="text-sm text-blue-800 font-medium">Total Litres</div>
            <div className="text-3xl font-bold text-blue-900">{totalL.toFixed(1)} L</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg shadow text-center">
            <div className="text-sm text-green-800 font-medium">Flats Delivered</div>
            <div className="text-3xl font-bold text-green-900">{flatCount}</div>
          </div>
        </div>
        
        <div className="space-y-2 max-h-80 overflow-y-auto bg-white p-3 rounded-lg border border-gray-200">
          {todayEntries.length === 0 ? (
            <div className="text-center text-gray-500 py-4">No entries for today.</div>
          ) : (
            todayEntries.map(entry => (
              <div key={entry.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                <div>
                  <div className="font-semibold text-blue-800">{entry.buyerName}</div>
                  <div className="text-sm text-gray-600">{entry.liters.toFixed(1)} L</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-700">{formatTime(entry.timestamp)}</div>
                  <div className="text-xs text-gray-500">by {entry.addedBy.split(' ')[0]}</div>
                </div>
              </div>
            ))
          )}
        </div>
        
        <button
          onClick={onClose}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg"
        >
          OK
        </button>
      </div>
    </div>
  );
}