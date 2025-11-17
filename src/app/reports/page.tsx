"use client";

import React, { useState, useMemo } from 'react';
import { useAppContext } from '@/context/AppContext';

// Helper to get today's date in 'YYYY-MM-DD' format
const getTodayDate = () => new Date().toISOString().split('T')[0];

const formatTime = (date: Date) => 
  date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

export default function ReportsPage() {
  const { allEntries } = useAppContext();
  const [reportDate, setReportDate] = useState(getTodayDate());

  const { reportEntries, totalL, flatCount } = useMemo(() => {
    const filtered = allEntries
      .filter(entry => entry.date === reportDate)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    const total = filtered.reduce((sum, entry) => sum + entry.liters, 0);
    const count = new Set(filtered.map(entry => entry.buyerId)).size;
    
    return { reportEntries: filtered, totalL: total, flatCount: count };
  }, [allEntries, reportDate]);

  return (
    <div className="space-y-6">
      {/* Date Selector */}
      <section className="bg-gray-50 p-5 rounded-lg shadow-inner space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">1. Select Date for Report</h2>
        <div>
          <input
            type="date"
            id="report-date"
            value={reportDate}
            onChange={(e) => setReportDate(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 font-medium"
          />
        </div>
      </section>

      {/* Report Log */}
      <section>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Log for {reportDate}</h2>
        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-blue-50 p-4 rounded-lg shadow text-center">
            <div className="text-sm text-blue-800 font-medium">Total Litres</div>
            <div id="report-total-liters" className="text-3xl font-bold text-blue-900">{totalL.toFixed(1)} L</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg shadow text-center">
            <div className="text-sm text-green-800 font-medium">Flats Delivered</div>
            <div id="report-flat-count" className="text-3xl font-bold text-green-900">{flatCount}</div>
          </div>
        </div>
        {/* Log List */}
        <div id="report-log-container" className="space-y-2 max-h-96 overflow-y-auto bg-white p-3 rounded-lg border border-gray-200">
          {reportEntries.length === 0 ? (
            <div className="text-center text-gray-500 py-4">No entries for selected date.</div>
          ) : (
            reportEntries.map(entry => (
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
      </section>
    </div>
  );
}