"use client";
export const dynamic = "force-dynamic";


import { getUserDeposits } from '@/lib/investmentplan';
import { Deposit } from '@/types/businesses';
import { motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import { FaBitcoin, FaDog, FaEthereum, FaHistory, FaWallet, FaSpinner } from 'react-icons/fa';
import { SiBinance, SiLitecoin, SiRipple, SiSolana, SiTether } from 'react-icons/si';

const DepositHistoryPage = () => {
  const [loading, setLoading] = useState({
    deposits: true,
    form: false
  });
  const [error, setError] = useState({
    deposits: ''
  });
  const [deposits, setDeposits] = useState<Deposit[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: depositsData, error: depositsError } = await getUserDeposits();
        
        if (depositsError) throw new Error(depositsError);
        
        setDeposits(depositsData || []);
      } catch (err) {
        setError({
          deposits: err instanceof Error ? err.message : "Failed to load deposits"
        });
      } finally {
        setLoading({
          deposits: false,
          form: false
        });
      }
    };
    fetchData();
  }, []);

  const getCryptoIcon = (symbol: string) => {
    switch (symbol) {
      case 'BTC': return <FaBitcoin className="text-yellow-500" />;
      case 'ETH': return <FaEthereum className="text-purple-500" />;
      case 'BNB': return <SiBinance className="text-yellow-600" />;
      case 'DOGE': return <FaDog className="text-orange-400" />;
      case 'SOL': return <SiSolana className="text-indigo-500" />;
      case 'USDT': return <SiTether className="text-green-500" />;
      case 'XRP': return <SiRipple className="text-blue-500" />;
      case 'LTC': return <SiLitecoin className="text-gray-400" />;
      default: return <FaWallet className="text-gray-500" />;
    }
  };

  return (
    <div>
      <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6">Your Deposit History</h2>
      {loading.deposits ? (
        <div className="flex justify-center items-center h-64">
          <FaSpinner className="animate-spin text-4xl text-green-500" />
        </div>
      ) : error.deposits ? (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
          <p>{error.deposits}</p>
        </div>
      ) : deposits.length === 0 ? (
        <div className="text-center py-12">
          <FaHistory className="mx-auto text-4xl text-gray-400 mb-4" />
          <p className="text-gray-500">No deposit history found</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
          <table className="min-w-full divide-y divide-gray-200 ">
            <thead className="bg-gray-50  ">
              <tr>
                <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Amount</th>
                <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Method</th>
                <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Status</th>
                <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="bg-white   divide-y divide-gray-200 ">
              {deposits.map((deposit) => (
                <motion.tr
                  key={deposit.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="hover:bg-gray-50  "
                >
                  <td className="px-3 py-3 sm:px-6 sm:py-4 whitespace-nowrap">
                    <div className="text-sm sm:text-base">${deposit.amount.toFixed(2)}</div>
                  </td>
                  <td className="px-3 py-3 sm:px-6 sm:py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 mr-1 sm:mr-2">
                        {getCryptoIcon(deposit.cryptoType)}
                      </div>
                      <span className="text-sm sm:text-base">{deposit.cryptoType}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3 sm:px-6 sm:py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      deposit.status === 'completed' ? 'bg-green-100 text-green-800' :
                      deposit.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {deposit.status}
                    </span>
                  </td>
                  <td className="px-3 py-3 sm:px-6 sm:py-4 whitespace-nowrap">
                    <div className="text-xs sm:text-sm text-gray-500">
                      {new Date(deposit.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DepositHistoryPage;