"use client";

import React, { useState } from 'react';
import { useAppContext, Buyer } from '@/context/AppContext';
import { db, appId } from '@/lib/firebase';
import { collection, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { PlusCircle, Trash2, Loader2 } from 'lucide-react';

export default function BuyersPage() {
  const { allBuyers, currentUser } = useAppContext();
  
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [series, setSeries] = useState('');
  const [flat, setFlat] = useState('');
  const [email, setEmail] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const showMessage = (text: string, isError = false) => {
    setMessage(text);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleAddBuyer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !series || !flat) {
      showMessage("Name, Series, and Flat No. are required.", true);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const buyersCollectionRef = collection(db, 'artifacts', appId, 'public/data', 'buyers');
      await addDoc(buyersCollectionRef, {
        name: name.trim(),
        phone: phone.trim(),
        series: series.trim().toUpperCase(),
        flat: parseInt(flat) || 0,
        flatFull: `${series.trim().toUpperCase()}-${flat.trim()}`,
        email: email.trim(),
        addedBy: currentUser?.displayName || 'User',
      });

      showMessage("Buyer saved successfully!");
      // Clear form
      setName('');
      setPhone('');
      setSeries('');
      setFlat('');
      setEmail('');

    } catch (error) {
      console.error("Error adding buyer: ", error);
      showMessage("Error saving buyer. Check console.", true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteBuyer = async (buyer: Buyer) => {
    // A custom modal is better than window.confirm in a real app
    if (confirm(`Are you sure you want to delete ${buyer.name} (${buyer.flatFull})?`)) {
      try {
        const docRef = doc(db, 'artifacts', appId, 'public/data', 'buyers', buyer.id);
        await deleteDoc(docRef);
        showMessage("Buyer deleted.");
      } catch (error) {
        console.error("Error deleting buyer: ", error);
        showMessage("Error deleting buyer.", true);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Add Buyer Form */}
      <section className="bg-gray-50 p-5 rounded-lg shadow-inner space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">Add New Buyer</h2>
        <form onSubmit={handleAddBuyer} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="buyer-name" className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                id="buyer-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full p-2 border border-gray-300 rounded-lg shadow-sm"
              />
            </div>
            <div>
              <label htmlFor="buyer-phone" className="block text-sm font-medium text-gray-700">Phone (for WhatsApp)</label>
              <input
                type="tel"
                id="buyer-phone"
                placeholder="e.g. 919876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1 w-full p-2 border border-gray-300 rounded-lg shadow-sm"
              />
            </div>
            <div>
              <label htmlFor="buyer-series" className="block text-sm font-medium text-gray-700">Flat Series (e.g. A)</label>
              <input
                type="text"
                id="buyer-series"
                value={series}
                onChange={(e) => setSeries(e.target.value)}
                className="mt-1 w-full p-2 border border-gray-300 rounded-lg shadow-sm"
              />
            </div>
            <div>
              <label htmlFor="buyer-flat" className="block text-sm font-medium text-gray-700">Flat No. (e.g. 101)</label>
              <input
                type="number"
                id="buyer-flat"
                value={flat}
                onChange={(e) => setFlat(e.target.value)}
                className="mt-1 w-full p-2 border border-gray-300 rounded-lg shadow-sm"
              />
            </div>
          </div>
          <div>
            <label htmlFor="buyer-email" className="block text-sm font-medium text-gray-700">Email (Optional)</label>
            <input
              type="email"
              id="buyer-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full p-2 border border-gray-300 rounded-lg shadow-sm"
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg text-lg shadow-lg flex items-center justify-center disabled:bg-gray-400"
          >
            {isSubmitting ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <PlusCircle className="w-6 h-6 mr-2" />
            )}
            Save Buyer
          </button>
          {message && <div className="text-center text-green-600 font-medium">{message}</div>}
        </form>
      </section>

      {/* Buyer List */}
      <section>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">All Buyers</h2>
        <div className="space-y-2 max-h-96 overflow-y-auto bg-white p-3 rounded-lg border border-gray-200">
          {allBuyers.length === 0 ? (
            <div className="text-center text-gray-500 py-4">No buyers added yet.</div>
          ) : (
            allBuyers.map((buyer) => (
              <div key={buyer.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                <div>
                  <div className="font-semibold text-blue-800">{buyer.flatFull} ({buyer.name})</div>
                  <div className="text-sm text-gray-600">{buyer.phone || 'No phone'}</div>
                </div>
                <button
                  onClick={() => handleDeleteBuyer(buyer)}
                  className="bg-red-100 text-red-700 hover:bg-red-200 p-2 rounded-full"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}