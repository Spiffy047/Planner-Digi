import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

export default function Dashboard() {
  const [goals, setGoals] = useState([]);

  useEffect(() => {
    const fetchGoals = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData?.session?.user?.id;
      if (!userId) return;

      const { data, error } = await supabase
        .from("goals")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (!error) setGoals(data);
    };
    fetchGoals();
  }, []);

  const formatCurrency = (amount) => `KSh ${amount.toLocaleString()}`;

  const checkStatus = (goal) => {
    const now = new Date();
    const targetDate = new Date(goal.target_date);
    if (goal.saved_amount >= goal.target_amount) return "Achieved";
    if (targetDate < now) return "Overdue";
    return "In Progress";
  };

  return (
    <div className="page">
      <h1 className="text-3xl font-bold mb-6">Goals Overview</h1>
      {goals.length === 0 ? (
        <p>No goals set yet.</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {goals.map((goal) => {
            const progress = Math.min((goal.saved_amount / goal.target_amount) * 100, 100);
            const status = checkStatus(goal);
            const statusColor =
              status === "Achieved" ? "bg-green-500" :
              status === "Overdue" ? "bg-red-500" :
              "bg-yellow-400";

            return (
              <div key={goal.id} className="goal-card">
                <h2 className="text-xl font-semibold mb-2">{goal.name}</h2>
                <p className="text-gray-600 mb-3">{formatCurrency(goal.saved_amount)} / {formatCurrency(goal.target_amount)}</p>
                
                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-4 mb-3">
                  <div
                    className={`h-4 rounded-full ${statusColor}`}
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>

                {/* Status */}
                <span className={`inline-block px-3 py-1 text-white rounded-full ${statusColor} text-sm font-medium`}>
                  {status}
                </span>

                {/* Target Date */}
                <p className="mt-2 text-gray-500 text-sm">Target: {new Date(goal.target_date).toLocaleDateString()}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
