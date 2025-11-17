"use client";

import { useState } from 'react';
import { Buyer, useAppContext } from '@/context/AppContext';
import { db, appId } from '@/lib/firebase';
import { addDoc, collection } from 'firebase/firestore';
import { X } from 'lucide-react';

interface Props {
  buyer: Buyer;
  entryDate: string;
  onClose: () => void;
}

export default function QuantityModal({ buyer, entryDate, onClose }: Props) {
  const { currentUser } = useAppContext();
  const [liters, setLiters] = useState(0.5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  
  // --- New state to control the "Success" view ---
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!currentUser) return;
    setIsSubmitting(true);
    setMessage('');

    try {
      const newEntry = {
        date: entryDate,
        liters: liters,
        buyerId: buyer.id,
        buyerName: `${buyer.series}-${buyer.flat} (${buyer.name})`,
        timestamp: new Date(),
        addedBy: currentUser.displayName || 'User',
        userId: currentUser.uid,
      };
      
      const entriesCollectionRef = collection(db, 'artifacts', appId, 'public/data', 'entries');
      await addDoc(entriesCollectionRef, newEntry);

      // --- Show success view instead of auto-closing ---
      setMessage(`✅ ${liters.toFixed(1)}L added for ${buyer.name}.`);
      setIsSuccess(true); 

    } catch (error) {
      console.error("Error adding entry: ", error);
      setMessage("Error adding entry. Please try again.");
    } finally {
      // Set submitting to false so the button is re-enabled if they hit an error
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content space-y-5 relative" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-bold text-gray-900 text-center pt-2">
          {/* Change title based on success state */}
          {isSuccess ? "Entry Saved!" : `Add for ${buyer.flatFull} (${buyer.name})`}
        </h2>
        
        {/* Conditionally render the input or the success message */}
        {!isSuccess ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 text-center">Quantity (Litres)</label>
            <div className="flex items-center justify-center space-x-4">
              <button
                onClick={() => setLiters(Math.max(0.5, liters - 0.5))}
                className="bg-red-500 hover:bg-red-600 text-white font-bold w-16 h-16 rounded-full text-4xl flex items-center justify-center shadow-md transition-transform duration-100 active:scale-95"
              >
                -
              </button>
              <span className="text-5xl font-bold text-gray-900 w-32 text-center">
                {liters.toFixed(1)} L
              </span>
              <button
                onClick={() => setLiters(liters + 0.5)}
                className="bg-green-500 hover:bg-green-600 text-white font-bold w-16 h-16 rounded-full text-4xl flex items-center justify-center shadow-md transition-transform duration-100 active:scale-95"
              >
                +
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center text-lg text-green-700 font-medium py-8">
            {message}
          </div>
        )}
        
        {/* Show error messages if they exist */}
        {!isSuccess && message && (
          <div className="text-center text-red-600 font-medium">{message}</div>
        )}

        <div className="flex flex-col space-y-3">
          {/* Conditionally render buttons based on success state */}
          {!isSuccess ? (
            <>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-4 rounded-lg text-lg shadow-lg transition-transform duration-100 active:scale-95 disabled:bg-gray-400"
              >
                {isSubmitting ? "Saving..." : "Submit Entry"}
              </button>
              <button
                onClick={onClose}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={onClose}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg text-lg shadow-lg"
            >
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
}