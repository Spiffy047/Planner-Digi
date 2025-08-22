import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

export default function Admin() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select(`
          id,
          role,
          created_at,
          auth_user:user_id (
            email,
            user_metadata
          )
        `);

      if (error) console.error(error);
      else setUsers(profiles);
      setLoading(false);
    };
    fetchUsers();
  }, []);

  const handleDelete = async (userId) => {
    if (!window.confirm("Delete this user?")) return;
    const { error } = await supabase.auth.admin.deleteUser(userId);
    if (error) console.error(error);
    else setUsers(users.filter(u => u.id !== userId));
  };

  const handleResetGoals = async (userId) => {
    if (!window.confirm("Reset all goals for this user?")) return;
    const { error } = await supabase.from("goals").delete().eq("user_id", userId);
    if (error) console.error(error);
    else alert("Goals reset successfully!");
  };

  if (loading) return <p className="page">Loading users...</p>;

  return (
    <div className="page">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {users.map(user => (
          <div key={user.id} className="goal-card">
            <h2 className="font-semibold text-lg">{user.auth_user?.user_metadata?.full_name || "Unknown"}</h2>
            <p>Email: {user.auth_user?.email || "N/A"}</p>
            <p>Role: {user.role}</p>
            <p>Joined: {new Date(user.created_at).toLocaleDateString()}</p>
            <div className="deposit-section mt-3">
              <button className="logout-btn" onClick={() => handleDelete(user.id)}>Delete</button>
              <button className="form-button bg-yellow-400 text-white" onClick={() => handleResetGoals(user.id)}>Reset Goals</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
