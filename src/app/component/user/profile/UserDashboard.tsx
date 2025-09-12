'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiDollarSign, 
  FiTrendingUp, 
  FiBriefcase, 
  FiGift, 
  FiDownload,
  FiClock,
  FiCopy,
  FiCheck
} from 'react-icons/fi';
import {
  getTotalDeposit,
  getTotalInvestment,
  getTotalCompletedWithdrawal,
  getTotalPendingWithdrawal,
  getProfileData
} from '@/lib/balance';
import TransactionsTable from '../layout/TransactionsTable';

const UserDashboard: React.FC = () => {
  const [userStats, setUserStats] = useState({
    balance: 0,
    totalDeposit: 0,
    currentInvestment: 0,
    totalBonus: 0, 
    totalWithdrawal: 0,
    pendingWithdrawal: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState({
    username: '',
    referralLink: ''
  });
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(user.referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const [
          profileData,
          totalDeposit,
          totalInvestment,
          totalCompletedWithdrawal,
          totalPendingWithdrawal
        ] = await Promise.all([
          getProfileData(),
          getTotalDeposit(),
          getTotalInvestment(),
          getTotalCompletedWithdrawal(),
          getTotalPendingWithdrawal()
        ]);

        if (profileData.error || !profileData.data) {
          throw new Error(profileData.error || 'Failed to fetch profile data');
        }

        setUser({
          username: profileData.data.username,
          referralLink: `https://accilent-finance-limited.vercel.app/signup?ref_id=${profileData.data.referralCode}`
        });

        setUserStats({
          balance: profileData.data.balance || 0,
          totalDeposit: totalDeposit,
          currentInvestment: totalInvestment,
          totalBonus: profileData.data.totalBonusAndInterest || 0, // Updated to use totalBonusAndInterest
          totalWithdrawal: totalCompletedWithdrawal,
          pendingWithdrawal: totalPendingWithdrawal
        });

      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const stats = [
    { 
      title: 'Account Balance', 
      amount: userStats.balance, 
      icon: <FiDollarSign className="text-primary" />,
      color: 'bg-blue-50',
      trend: null
    },
    { 
      title: 'Total Deposit', 
      amount: userStats.totalDeposit, 
      icon: <FiTrendingUp className="text-green-500" />,
      color: 'bg-green-50',
      trend: 'up'
    },
    { 
      title: 'Current Investment', 
      amount: userStats.currentInvestment, 
      icon: <FiBriefcase className="text-purple-500" />,
      color: 'bg-purple-50',
      trend: null
    },
    { 
      title: 'Total Bonus & Interest', // Updated title to be more descriptive
      amount: userStats.totalBonus, 
      icon: <FiGift className="text-yellow-500" />,
      color: 'bg-yellow-50',
      trend: null
    },
    { 
      title: 'Total Withdrawal', 
      amount: userStats.totalWithdrawal, 
      icon: <FiDownload className="text-red-500" />,
      color: 'bg-red-50',
      trend: null
    },
    { 
      title: 'Pending Withdrawal', 
      amount: userStats.pendingWithdrawal, 
      icon: <FiClock className="text-orange-500" />,
      color: 'bg-orange-50',
      trend: null
    },
  ];

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-sm p-6 h-36 animate-pulse"
            >
              <div className="h-6 w-3/4 bg-gray-200 rounded mb-4"></div>
              <div className="h-8 w-1/2 bg-gray-200 rounded"></div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-red-50 border-l-4 border-red-500 p-4 mb-6"
        >
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                <strong>Error loading dashboard:</strong> {error}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {user.username}!</h1>
        <p className="text-gray-600 mb-4">Here&apos;s what&apos;s happening with your account today.</p>
        
        {/* Referral Section */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="mb-4 md:mb-0">
              <h3 className="text-lg font-medium text-gray-900">Your Referral Link</h3>
              <p className="text-sm text-gray-500 mt-1">Earn rewards by sharing with friends</p>
            </div>
            <div className="flex items-center">
              <div className="bg-white rounded-lg px-4 py-2 border border-gray-200 flex-1 min-w-0">
                <p className="text-sm truncate">{user.referralLink}</p>
              </div>
              <button
                onClick={copyToClipboard}
                className="ml-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <AnimatePresence mode="wait" initial={false}>
                  {copied ? (
                    <motion.span
                      key="check"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center"
                    >
                      <FiCheck className="mr-1" /> Copied
                    </motion.span>
                  ) : (
                    <motion.span
                      key="copy"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center"
                    >
                      <FiCopy className="mr-1" /> Copy
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          visible: {
            transition: {
              staggerChildren: 0.1
            }
          }
        }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
      >
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            variants={cardVariants}
            transition={{ duration: 0.3 }}
            className={`${stat.color} rounded-xl shadow-sm overflow-hidden`}
          >
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                  <p className="text-2xl font-semibold text-gray-900 mt-1">
                    ${Number(stat.amount).toFixed(2)}
                  </p>
                </div>
                <div className="bg-white rounded-full p-3 shadow-sm">
                  {stat.icon}
                </div>
              </div>
              {stat.trend && (
                <div className="mt-4 flex items-center text-sm">
                  <span className={`flex items-center ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.trend === 'up' ? (
                      <FiTrendingUp className="mr-1" />
                    ) : (
                      <FiTrendingUp className="mr-1 transform rotate-180" />
                    )}
                    {stat.trend === 'up' ? '5.2%' : '2.3%'} from last month
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </motion.div>

      <TransactionsTable />
    </div>
  );
};

export default UserDashboard;