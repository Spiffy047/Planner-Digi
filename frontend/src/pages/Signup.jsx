import { useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { email, password } = formData;

    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      setMessage("❌ " + error.message);
    } else {
      // Add profile with role 'user'
      await supabase.from("profiles").insert([{ id: data.user.id, role: "user" }]);

      setMessage("✅ Signup successful! Check your email for confirmation.");
      navigate("/login"); // send user to login after signup
    }
  };

  return (
    <div className="page">
      <div className="form-page">
        <h1>Create an Account</h1>
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
          <button type="submit">Sign Up</button>
        </form>
        {message && <p>{message}</p>}
      </div>
    </div>
  );
}
