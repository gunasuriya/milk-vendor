"use client";

import { useState, useMemo } from "react";
import { useAppContext, Buyer } from "@/context/AppContext";
import QuantityModal from "@/components/modals/QuantityModal";
import DailyLogModal from "@/components/modals/DailyLogModal";
import { ArrowLeft } from "lucide-react";

// Helper to get today's date in 'YYYY-MM-DD' format
const getTodayDate = () => new Date().toISOString().split('T')[0];

export default function DailyEntryPage() {
  const { allBuyers } = useAppContext();
  
  const [entryDate, setEntryDate] = useState(getTodayDate());
  
  const [isQtyModalOpen, setIsQtyModalOpen] = useState(false);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [selectedBuyer, setSelectedBuyer] = useState<Buyer | null>(null);

  // --- New Grouping Logic ---
  const [selectedSeries, setSelectedSeries] = useState<string | null>(null);

  // 1. Group all buyers by their series, sorted by flat number
  const buyersBySeries = useMemo(() => {
    const grouped: Record<string, Buyer[]> = {};
    
    // Sort all buyers first (this ensures flats are in order)
    const sortedBuyers = [...allBuyers].sort((a, b) => a.flat - b.flat);
    
    sortedBuyers.forEach(buyer => {
      const series = buyer.series;
      if (!grouped[series]) {
        grouped[series] = [];
      }
      grouped[series].push(buyer);
    });
    return grouped;
  }, [allBuyers]);

  // 2. Get a sorted list of the series keys (e.g., ['A', 'B', 'C', 'E'])
  const seriesKeys = useMemo(() => Object.keys(buyersBySeries).sort(), [buyersBySeries]);
  // --- End of Grouping Logic ---


  const openQuantityModal = (buyer: Buyer) => {
    setSelectedBuyer(buyer);
    setIsQtyModalOpen(true);
  };

  return (
    <>
      <div className="space-y-6">
        {/* Entry Form */}
        <section className="bg-gray-50 p-5 rounded-lg shadow-inner space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">1. Select Date</h2>
          <div>
            <input
              type="date"
              id="entry-date"
              value={entryDate}
              onChange={(e) => setEntryDate(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 font-medium"
            />
          </div>
        </section>

        {/* Buyer Grid */}
        <section>
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-semibold text-gray-800">
              {/* Change title based on selection */}
              {selectedSeries ? `2. Choose Flat` : "2. Choose Series"}
            </h2>
            <button
              onClick={() => setIsLogModalOpen(true)}
              className="bg-gray-200 text-gray-800 hover:bg-gray-300 text-sm font-medium py-2 px-4 rounded-lg"
            >
              View Log
            </button>
          </div>

          {/* Conditional Rendering: Show Series or Flats */}
          {!selectedSeries ? (
            // --- SERIES GRID ---
            <div className="grid grid-cols-3 gap-3">
              {allBuyers.length === 0 && (
                <div className="text-center text-gray-500 py-4 col-span-full">
                  Please add buyers in the 'Buyers' tab first.
                </div>
              )}
              {seriesKeys.map((series) => (
                <button
                  key={series}
                  onClick={() => setSelectedSeries(series)}
                  className="p-4 bg-blue-600 text-white rounded-lg text-center font-bold text-xl shadow-lg hover:bg-blue-700 active:scale-95 transition-all"
                >
                  {series}
                </button>
              ))}
            </div>
          ) : (
            // --- FLATS GRID ---
            <div>
              <button
                onClick={() => setSelectedSeries(null)}
                className="flex items-center text-blue-600 hover:underline font-medium mb-3"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to Series
              </button>
              <div className="buyer-grid">
                {buyersBySeries[selectedSeries].map((buyer) => (
                  <button
                    key={buyer.id}
                    onClick={() => openQuantityModal(buyer)}
                    className="buyer-btn"
                  >
                    {buyer.flatFull}
                  </button>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Modals */}
      {isQtyModalOpen && selectedBuyer && (
        <QuantityModal
          buyer={selectedBuyer}
          entryDate={entryDate}
          onClose={() => setIsQtyModalOpen(false)}
        />
      )}

      {isLogModalOpen && (
        <DailyLogModal
          entryDate={entryDate}
          onClose={() => setIsLogModalOpen(false)}
        />
      )}
    </>
  );
}