import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function AdminPanel() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const { data, error } = await supabase.from("profiles").select("*");
    if (!error) setUsers(data);
  };

  const changeRole = async (id, role) => {
    await supabase.from("profiles").update({ role }).eq("id", id);
    fetchUsers();
  };

  return (
    <div className="page">
      <h1>Admin Panel</h1>
      <table className="w-full table-auto mt-4 border">
        <thead>
          <tr>
            <th>Email/ID</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id} className="border-t">
              <td>{u.id}</td>
              <td>{u.role}</td>
              <td>
                {u.role !== "admin" && (
                  <button onClick={() => changeRole(u.id, "admin")} className="btn-admin">Make Admin</button>
                )}
                {u.role !== "user" && (
                  <button onClick={() => changeRole(u.id, "user")} className="btn-user ml-2">Revoke Admin</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
