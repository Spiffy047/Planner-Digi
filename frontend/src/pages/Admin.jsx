import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

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

  if (loading)
    return <p className="text-center text-gray-500 mt-6">Loading users...</p>;

  return (
    <div className="page">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      {users.length === 0 ? (
        <p className="text-gray-500 mt-6">No users found.</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {users.map((user) => (
            <div
              key={user.id}
              className="p-5 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow"
            >
              <h2 className="text-xl font-semibold mb-2 text-gray-800">
                User ID: {user.id}
              </h2>
              <p className="text-gray-600 mb-1">Role: {user.role}</p>
              <p className="text-gray-600 mb-3">
                Joined: {new Date(user.created_at).toLocaleDateString()}
              </p>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => handleDeleteUser(user.id)}
                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                >
                  Delete User
                </button>
                <button
                  onClick={() => handleResetGoals(user.id)}
                  className="px-3 py-1 bg-yellow-400 text-white rounded hover:bg-yellow-500 transition-colors"
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
