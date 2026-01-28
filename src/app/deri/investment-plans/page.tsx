"use client";
 
import React, { useState, useEffect } from "react";
import { FaEdit, FaSave, FaTimes, FaPercent, FaDollarSign, FaCalendarAlt } from "react-icons/fa";
import { motion } from "framer-motion";
import { InvestmentPlan } from "@/types/businesses";
import { getInvestmentPlans, updateInvestmentPlan } from "@/lib/investmentplan";
import { toast } from "sonner";

interface EditablePlan extends InvestmentPlan {
  isEditing?: boolean;
}

const InvestmentPlansAdmin = () => {
  const [plans, setPlans] = useState<EditablePlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const { data, error } = await getInvestmentPlans();
      
      if (error) {
        setError(error);
      } else if (data) {
        setPlans(data.map(plan => ({ ...plan, isEditing: false })));
      }
    } catch (err) {
        console.error("Error fetching investment plans:", err);
      setError("Failed to load investment plans");
    } finally {
      setLoading(false);
    }
  };

  const toggleEdit = (id: string) => { // Changed from number to string
    setPlans(plans.map(plan => 
      plan.id === id ? { ...plan, isEditing: !plan.isEditing } : plan
    ));
  };

  const handleChange = (
    id: string, // Changed from number to string
    field: keyof InvestmentPlan, 
    value: string | number
  ) => {
    setPlans(plans.map(plan => {
      if (plan.id === id) {
        // Convert string inputs to appropriate types
        if (field === 'percentage' || field === 'referralBonus') {
          return { ...plan, [field]: typeof value === 'string' ? parseFloat(value) : value };
        }
        if (field === 'minAmount' || field === 'maxAmount') {
          return { ...plan, [field]: typeof value === 'string' ? parseFloat(value) : value };
        }
        if (field === 'durationDays') {
          return { ...plan, [field]: typeof value === 'string' ? parseInt(value) : value };
        }
        return { ...plan, [field]: value };
      }
      return plan;
    }));
  };

  const handleUpdate = async (plan: EditablePlan) => {
    try {
      const { success, error } = await updateInvestmentPlan({
        id: plan.id, // This is now a string (UUID)
        title: plan.title,
        percentage: plan.percentage,
        min_amount: plan.minAmount,
        max_amount: plan.maxAmount,
        duration_days: plan.durationDays,
        interval: plan.interval,
        referral_bonus: plan.referralBonus
      });

      if (success) {
        toast.success("Plan updated successfully");
        toggleEdit(plan.id);
        fetchPlans(); // Refresh data
      } else {
        toast.error(error || "Failed to update plan");
      }
    } catch (err) {
        console.error("Error updating investment plan:", err);
      toast.error("An unexpected error occurred");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-700 p-4 rounded-md">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Investment Plans Management</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
          >
            <div className="p-6 border-b border-gray-200 bg-gray-50">
              <div className="flex justify-between items-center">
                {plan.isEditing ? (
                  <input
                    type="text"
                    value={plan.title}
                    onChange={(e) => handleChange(plan.id, 'title', e.target.value)}
                    className="text-lg font-semibold w-full px-2 py-1 border rounded"
                  />
                ) : (
                  <h3 className="text-lg font-semibold text-gray-800">{plan.title}</h3>
                )}
                <button
                  onClick={() => plan.isEditing ? handleUpdate(plan) : toggleEdit(plan.id)}
                  className="p-2 text-emerald-600 hover:text-emerald-800"
                >
                  {plan.isEditing ? <FaSave /> : <FaEdit />}
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center space-x-3">
                <FaPercent className="text-gray-500" />
                {plan.isEditing ? (
                  <input
                    type="number"
                    value={plan.percentage}
                    onChange={(e) => handleChange(plan.id, 'percentage', e.target.value)}
                    className="w-full px-2 py-1 border rounded"
                    step="0.1"
                  />
                ) : (
                  <span>Return: {plan.percentage}%</span>
                )}
              </div>

              <div className="flex items-center space-x-3">
                <FaDollarSign className="text-gray-500" />
                {plan.isEditing ? (
                  <div className="flex space-x-2 w-full">
                    <input
                      type="number"
                      value={plan.minAmount}
                      onChange={(e) => handleChange(plan.id, 'minAmount', e.target.value)}
                      className="w-1/2 px-2 py-1 border rounded"
                      step="1"
                    />
                    <span className="flex items-center">to</span>
                    <input
                      type="number"
                      value={plan.maxAmount}
                      onChange={(e) => handleChange(plan.id, 'maxAmount', e.target.value)}
                      className="w-1/2 px-2 py-1 border rounded"
                      step="1"
                    />
                  </div>
                ) : (
                  <span>Range: ${plan.minAmount} - ${plan.maxAmount}</span>
                )}
              </div>

              <div className="flex items-center space-x-3">
                <FaCalendarAlt className="text-gray-500" />
                {plan.isEditing ? (
                  <input
                    type="number"
                    value={plan.durationDays}
                    onChange={(e) => handleChange(plan.id, 'durationDays', e.target.value)}
                    className="w-full px-2 py-1 border rounded"
                  />
                ) : (
                  <span>Duration: {plan.durationDays} days</span>
                )}
              </div>

              <div className="flex items-center space-x-3">
                <FaDollarSign className="text-gray-500" />
                {plan.isEditing ? (
                  <input
                    type="number"
                    value={plan.referralBonus}
                    onChange={(e) => handleChange(plan.id, 'referralBonus', e.target.value)}
                    className="w-full px-2 py-1 border rounded"
                    step="0.1"
                  />
                ) : (
                  <span>Referral Bonus: {plan.referralBonus}%</span>
                )}
              </div>

              {plan.isEditing && (
                <div className="pt-4">
                  <button
                    onClick={() => toggleEdit(plan.id)}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-gray-800"
                  >
                    <FaTimes className="inline mr-2" />
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default InvestmentPlansAdmin;