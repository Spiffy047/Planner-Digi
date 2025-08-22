import { useState, useEffect } from "react";
import { supabase } from "../supabase";

export default function Admin() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all users and their roles
  useEffect(() => {
    const fetchUsers = async () => {
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("id, role, created_at");

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

  // Reset goals for a user
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

  if (loading) return <p>Loading users...</p>;

  return (
    <div className="page">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      {users.length === 0 ? (
        <p>No users found.</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {users.map((user) => (
            <div key={user.id} className="p-5 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <h2 className="text-xl font-semibold mb-2">User ID: {user.id}</h2>
              <p>Role: {user.role}</p>
              <p>Joined: {new Date(user.created_at).toLocaleDateString()}</p>
              <div className="mt-3 flex gap-2">
                <button
                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  onClick={() => handleDeleteUser(user.id)}
                >
                  Delete User
                </button>
                <button
                  className="px-3 py-1 bg-yellow-400 text-white rounded hover:bg-yellow-500"
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
