import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../supabase";

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function getSessionUser() {
      const { data: { user: loggedInUser } } = await supabase.auth.getUser();
      if (!loggedInUser) return;

      setUser(loggedInUser);

      // Check if user is admin
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", loggedInUser.id)
        .single();

      setIsAdmin(profile?.role === "admin");
    }

    getSessionUser();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      if (!session?.user) setIsAdmin(false);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsAdmin(false);
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="logo">PlannerDigi</div>
      <ul className="nav-links">
        <li><Link to="/">Home</Link></li>
        {!user && (
          <>
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/signup">Sign Up</Link></li>
          </>
        )}
        {user && (
          <>
            <li><Link to="/dashboard">Dashboard</Link></li>
            <li><Link to="/goals">Goals</Link></li>
            {isAdmin && <li><Link to="/admin">Manage Users</Link></li>}
            <li>
              <button onClick={handleLogout} className="logout-btn">Logout</button>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}
