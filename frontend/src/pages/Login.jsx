import { useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { email, password } = formData;

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setMessage("❌ " + error.message);
    } else {
      // Fetch user role
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();

      if (profileError) {
        setMessage("❌ Could not fetch user role.");
        return;
      }

      setMessage("✅ Login successful!");
      localStorage.setItem("supabaseSession", JSON.stringify(data.session));

      // Redirect based on role
      if (profileData.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/goals");
      }
    }
  };

  return (
    <div className="page">
      <div className="form-page">
        <h1>Welcome Back</h1>
        <form className="form" onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <button type="submit">Login</button>
        </form>
        {message && <p>{message}</p>}
      </div>
    </div>
  );
}
