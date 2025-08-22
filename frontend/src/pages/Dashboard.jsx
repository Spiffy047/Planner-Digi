import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function Dashboard() {
  const [goals, setGoals] = useState([]);

  // Fetch goals for logged-in user
  useEffect(() => {
    const fetchGoals = async () => {
      const sessionData = await supabase.auth.getSession();
      const userId = sessionData.data?.session?.user?.id;
      if (!userId) return;

      const { data, error } = await supabase
        .from("goals")
        .select("*")
        .eq("user_id", userId);

      if (!error) setGoals(data);
    };

    fetchGoals();
  }, []);

  // Metrics calculations
  const now = new Date();
  const totalGoals = goals.length;
  const totalSavedAmount = goals.reduce((sum, goal) => sum + Number(goal.saved_amount), 0);

  const completedGoals = goals.filter(
    (goal) => Number(goal.saved_amount) >= Number(goal.target_amount)
  ).length;

  const onTrackGoals = goals.filter(goal => {
    const targetDate = new Date(goal.target_date);
    const savedAmount = Number(goal.saved_amount);
    const targetAmount = Number(goal.target_amount);
    return savedAmount < targetAmount && targetDate > now;
  }).length;

  const pastDueGoals = goals.filter(goal => {
    const targetDate = new Date(goal.target_date);
    const savedAmount = Number(goal.saved_amount);
    const targetAmount = Number(goal.target_amount);
    return targetDate <= now && savedAmount < targetAmount;
  }).length;

  // Format currency
  const formatCurrency = (amount) => `KSh ${amount.toLocaleString()}`;

  return (
    <div className="page">
      <h1 className="text-3xl font-bold mb-6">Overall Savings Overview</h1>

      <div className="dashboard-metrics grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="goal-card">
          <h3>Total Goals</h3>
          <p>{totalGoals}</p>
        </div>
        <div className="goal-card">
          <h3>Goals Completed</h3>
          <p className="completed-metric">{completedGoals}</p>
        </div>
        <div className="goal-card">
          <h3>On Track Goals</h3>
          <p className="on-track-metric">{onTrackGoals}</p>
        </div>
        <div className="goal-card">
          <h3>Past Due Goals</h3>
          <p className="past-due-metric">{pastDueGoals}</p>
        </div>
        <div className="goal-card">
          <h3>Total Saved Across All Goals</h3>
          <p className="currency-amount">{formatCurrency(totalSavedAmount)}</p>
        </div>
      </div>
    </div>
  );
}
