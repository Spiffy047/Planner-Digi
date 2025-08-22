import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

export default function Admin() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch users and their profile info
  useEffect(() => {
    const fetchUsers = async () => {
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("id, full_name, email, role, created_at");

      if (error) {
        console.error("Error fetching users:", error);
      } else {
        setUsers(profiles);
      }
      setLoading(false);
    };

    fetchUsers();
  }, []);

  // Delete a user
  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    const { error } = await supabase.auth.admin.deleteUser(userId);
    if (error) {
      console.error("Error deleting user:", error.message);
    } else {
      setUsers(users.filter(u => u.id !== userId));
    }
  };

  // Reset all goals for a user
  const handleResetGoals = async (userId) => {
    if (!window.confirm("Reset all goals for this user?")) return;

    const { error } = await supabase
      .from("goals")
      .delete()
      .eq("user_id", userId);

    if (error) {
      console.error("Error resetting goals:", error.message);
    } else {
      alert("Goals reset successfully!");
    }
  };

  if (loading) return <p className="page">Loading users...</p>;

  return (
    <div className="page">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      {users.length === 0 ? (
        <p>No users found.</p>
      ) : (
        <div className="goals-list">
          {users.map(user => (
            <div key={user.id} className="goal-card">
              <h2>{user.full_name || "No Name"}</h2>
              <p>Email: {user.email || "No Email"}</p>
              <p>Role: 
                <select
                  value={user.role}
                  onChange={async (e) => {
                    const newRole = e.target.value;
                    const { error } = await supabase
                      .from("profiles")
                      .update({ role: newRole })
                      .eq("id", user.id);

                    if (!error) {
                      setUsers(users.map(u => u.id === user.id ? { ...u, role: newRole } : u));
                    }
                  }}
                  className="form-select"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </p>
              <p>Joined: {new Date(user.created_at).toLocaleDateString()}</p>

              <div className="deposit-section mt-3">
                <button
                  className="logout-btn"
                  onClick={() => handleDeleteUser(user.id)}
                >
                  Delete User
                </button>
                <button
                  className="form-button"
                  style={{ backgroundColor: "#facc15", color: "#fff" }}
                  onClick={() => handleResetGoals(user.id)}
                >
                  Reset Goals
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
