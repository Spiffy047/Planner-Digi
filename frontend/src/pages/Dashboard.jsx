import React from "react";
import { useNavigate } from "react-router-dom";

export default function Dashboard({ goals }) {
  const navigate = useNavigate();
  const now = new Date();

  const totalGoals = goals.length;
  const totalSaved = goals.reduce((sum, g) => sum + Number(g.saved_amount), 0);
  const completedGoals = goals.filter(g => Number(g.saved_amount) >= Number(g.target_amount)).length;
  const onTrackGoals = goals.filter(g => Number(g.saved_amount) < Number(g.target_amount) && new Date(g.target_date) > now).length;
  const pastDueGoals = goals.filter(g => Number(g.saved_amount) < Number(g.target_amount) && new Date(g.target_date) <= now).length;

  const metrics = [
    { title: "Total Goals", value: totalGoals, color: "bg-blue-400", path: "/goals" },
    { title: "Completed Goals", value: completedGoals, color: "bg-green-400", path: "/goals" },
    { title: "On Track Goals", value: onTrackGoals, color: "bg-yellow-400", path: "/goals" },
    { title: "Past Due Goals", value: pastDueGoals, color: "bg-red-400", path: "/goals" },
    { title: "Total Saved (KSh)", value: totalSaved.toFixed(2), color: "bg-purple-400", path: "/goals" }
  ];

  return (
    <div className="page">
      <h1 className="text-3xl font-bold mb-6">Your Dashboard Overview</h1>

      {/* Metrics Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        {metrics.map((m, i) => (
          <div
            key={i}
            className={`p-5 rounded-2xl shadow-lg cursor-pointer hover:shadow-xl transition-shadow ${m.color} text-white`}
            onClick={() => navigate(m.path)}
          >
            <h2 className="text-xl font-semibold">{m.title}</h2>
            <p className="text-2xl mt-2 font-bold">{m.value}</p>
          </div>
        ))}
      </div>

      {/* Goals Grid */}
      <h2 className="text-2xl font-semibold mb-4">Your Goals</h2>
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {goals.map(goal => {
          const progress = Math.min((goal.saved_amount / goal.target_amount) * 100, 100);
          const status = goal.saved_amount >= goal.target_amount ? "Achieved" : new Date(goal.target_date) < now ? "Overdue" : "In Progress";
          const statusColor =
            status === "Achieved" ? "bg-green-500" : status === "Overdue" ? "bg-red-500" : "bg-yellow-400";

          return (
            <div key={goal.id} className="goal-card cursor-pointer hover:shadow-xl transition-shadow">
              <h3 className="font-semibold text-lg">{goal.name}</h3>
              <p className="text-gray-600 mt-1">
                KSh {goal.saved_amount.toLocaleString()} / KSh {goal.target_amount.toLocaleString()}
              </p>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-3 mt-2">
                <div
                  className={`h-3 rounded-full ${statusColor}`}
                  style={{ width: `${progress}%` }}
                ></div>
              </div>

              <p className={`mt-2 font-medium text-white inline-block px-2 py-1 rounded ${statusColor}`}>{status}</p>
              <p className="mt-1 text-gray-500 text-sm">Target: {new Date(goal.target_date).toLocaleDateString()}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
