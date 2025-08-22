import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  // Fetch users and goals
  useEffect(() => {
    const fetchData = async () => {
      const { data: profileData, error: userError } = await supabase
        .from("profiles")
        .select("id, role, created_at");

      if (userError) console.error(userError);
      else setUsers(profileData || []);

      const { data: goalsData, error: goalsError } = await supabase
        .from("goals")
        .select("*");

      if (goalsError) console.error(goalsError);
      else setGoals(goalsData || []);

      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) return <p className="page">Loading Admin Dashboard...</p>;

  // Goals Overview
  const now = new Date();
  const totalGoals = goals.length;
  const completedGoals = goals.filter(
    (g) => g.saved_amount >= g.target_amount
  ).length;
  const onTrackGoals = goals.filter(
    (g) => g.saved_amount < g.target_amount && new Date(g.target_date) > now
  ).length;
  const pastDueGoals = goals.filter(
    (g) => g.saved_amount < g.target_amount && new Date(g.target_date) <= now
  ).length;
  const totalSavedAmount = goals.reduce(
    (sum, g) => sum + Number(g.saved_amount),
    0
  );

  // Navigation helper
  const redirectToGoals = () => navigate("/goals");

  return (
    <div className="page">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      {/* Metrics */}
      <div className="dashboard-metrics grid gap-6 md:grid-cols-3 lg:grid-cols-4">
        <div
          className="metric-card cursor-pointer"
          onClick={redirectToGoals}
        >
          <h3>Total Goals</h3>
          <p>{totalGoals}</p>
        </div>
        <div
          className="metric-card cursor-pointer"
          onClick={redirectToGoals}
        >
          <h3>Completed Goals</h3>
          <p className="completed-metric">{completedGoals}</p>
        </div>
        <div
          className="metric-card cursor-pointer"
          onClick={redirectToGoals}
        >
          <h3>On Track Goals</h3>
          <p className="on-track-metric">{onTrackGoals}</p>
        </div>
        <div
          className="metric-card cursor-pointer"
          onClick={redirectToGoals}
        >
          <h3>Past Due Goals</h3>
          <p className="past-due-metric">{pastDueGoals}</p>
        </div>
        <div
          className="metric-card cursor-pointer total-saved"
          onClick={redirectToGoals}
        >
          <h3>Total Saved</h3>
          <p className="currency-amount">
            KSh {totalSavedAmount.toFixed(2)}
          </p>
        </div>
        <div className="metric-card cursor-pointer" onClick={() => navigate("/admin/users")}>
          <h3>Total Users</h3>
          <p>{users.length}</p>
        </div>
      </div>

      {/* Users Overview */}
      <h2 className="mt-8 mb-4 text-2xl font-semibold">User Accounts</h2>
      <div className="goals-grid grid gap-6 md:grid-cols-4 lg:grid-cols-4">
        {users.map((user) => (
          <div key={user.id} className="goal-card">
            <h3>User ID: {user.id}</h3>
            <p>Role: {user.role}</p>
            <p>Joined: {new Date(user.created_at).toLocaleDateString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
