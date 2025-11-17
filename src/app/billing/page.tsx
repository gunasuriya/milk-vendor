"use client";

import React, { useState, useMemo } from 'react';
import { useAppContext, Buyer } from '@/context/AppContext';
import { db, appId } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';

// Helper to get current month in 'YYYY-MM' format
const getCurrentMonth = () => new Date().toISOString().split('T')[0].slice(0, 7);

const PRICE_PER_LITER = 55;

interface BillingItem extends Buyer {
  totalLiters: number;
  totalAmount: number;
  paymentId: string;
  status: 'paid' | 'unpaid' | 'na'; // 'na' for no activity
}

export default function BillingPage() {
  const { allBuyers, allEntries, allPayments, currentUser } = useAppContext();
  const [billingMonth, setBillingMonth] = useState(getCurrentMonth());
  const [loadingPayment, setLoadingPayment] = useState<string | null>(null); // Track which button is loading

  const billingReport = useMemo(() => {
    // A. Group entries by buyer
    const entriesForMonth = allEntries.filter(e => e.date.startsWith(billingMonth));
    const buyerTotals: Record<string, { totalLiters: number }> = {};

    for (const entry of entriesForMonth) {
      if (!buyerTotals[entry.buyerId]) {
        buyerTotals[entry.buyerId] = { totalLiters: 0 };
      }
      buyerTotals[entry.buyerId].totalLiters += entry.liters;
    }

    // B. Create a report for ALL buyers
    const reportData: BillingItem[] = allBuyers.map(buyer => {
      const totalLiters = buyerTotals[buyer.id] ? buyerTotals[buyer.id].totalLiters : 0;
      const totalAmount = totalLiters * PRICE_PER_LITER;
      const paymentId = `${buyer.id}_${billingMonth}`;
      const status = allPayments[paymentId] ? allPayments[paymentId].status : (totalLiters > 0 ? 'unpaid' : 'na');

      return {
        ...buyer,
        totalLiters,
        totalAmount,
        paymentId,
        status,
      };
    });

    // C. Sort the report
    reportData.sort((a, b) => {
      const statusOrder = { 'unpaid': 1, 'paid': 2, 'na': 3 };
      if (statusOrder[a.status] !== statusOrder[b.status]) {
        return statusOrder[a.status] - statusOrder[b.status];
      }
      if (a.series < b.series) return -1;
      if (a.series > b.series) return 1;
      return a.flat - b.flat;
    });

    return reportData;
  }, [allBuyers, allEntries, allPayments, billingMonth]);

  const { unpaidCount, totalUnpaidAmount } = useMemo(() => {
    let count = 0;
    let amount = 0;
    billingReport.forEach(item => {
      if (item.status === 'unpaid') {
        count++;
        amount += item.totalAmount;
      }
    });
    return { unpaidCount: count, totalUnpaidAmount: amount };
  }, [billingReport]);

  const handlePaymentStatus = async (item: BillingItem, newStatus: 'paid' | 'unpaid') => {
    if (!currentUser) return;
    setLoadingPayment(item.paymentId); // Start loading
    
    try {
      const docRef = doc(db, 'artifacts', appId, 'public/data', 'payments', item.paymentId);
      await setDoc(docRef, { 
        status: newStatus,
        updatedAt: new Date(),
        updatedBy: currentUser.displayName,
      });
      // onSnapshot will handle the UI update
    } catch (error) {
      console.error("Error updating payment status: ", error);
    } finally {
      setLoadingPayment(null); // Stop loading
    }
  };

  const getWhatsappLink = (item: BillingItem) => {
    const billText = `Hi ${item.name.split(' ')[0]} (${item.flatFull})! Here is your milk bill for ${billingMonth}.\n\nTotal Litres: ${item.totalLiters.toFixed(1)} L\nAmount Due: ₹${item.totalAmount.toFixed(2)}\n\nThanks!`;
    return `https://wa.me/${item.phone}?text=${encodeURIComponent(billText)}`;
  };

  return (
    <div className="space-y-6">
      {/* Month Selector */}
      <section className="bg-gray-50 p-5 rounded-lg shadow-inner space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">1. Select Month for Billing</h2>
        <div>
          <input
            type="month"
            id="billing-month-selector"
            value={billingMonth}
            onChange={(e) => setBillingMonth(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="text-center text-gray-600 font-medium">
          You have {unpaidCount} unpaid bills, totaling ₹{totalUnpaidAmount.toFixed(2)}.
        </div>
      </section>

      {/* Billing Report List */}
      <section>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">2. Monthly Bills</h2>
        <div className="space-y-3">
          {billingReport.length === 0 && (
            <div className="text-center text-gray-500 py-4">No buyers found.</div>
          )}
          
          {billingReport.map((item) => {
            if (item.status === 'na') return null; // Skip buyers with 0 litres
            
            const isLoading = loadingPayment === item.paymentId;

            return (
              <div
                key={item.id}
                className={`p-4 rounded-lg border ${item.status === 'paid' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="font-bold text-lg text-gray-800">{item.flatFull} ({item.name})</div>
                    <div className="font-medium text-gray-700">
                      {item.totalLiters.toFixed(1)} L = <span className="text-xl font-bold">₹{item.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                  <span className={`font-bold text-sm py-1 px-3 rounded-full ${item.status === 'paid' ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                    {item.status.toUpperCase()}
                  </span>
                </div>
                <div className="flex gap-2">
                  {item.status === 'unpaid' ? (
                    <>
                      <button
                        onClick={() => handlePaymentStatus(item, 'paid')}
                        disabled={isLoading}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-3 rounded-lg flex items-center justify-center disabled:bg-gray-400"
                      >
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Mark as Paid"}
                      </button>
                      {item.phone && (
                        <a
                          href={getWhatsappLink(item)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-3 rounded-lg text-center"
                        >
                          Send Bill
                        </a>
                      )}
                    </>
                  ) : (
                    <button
                      onClick={() => handlePaymentStatus(item, 'unpaid')}
                      disabled={isLoading}
                      className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-3 rounded-lg flex items-center justify-center disabled:bg-gray-400"
                    >
                      {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Mark as Unpaid"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}