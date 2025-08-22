import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate, useParams } from "react-router-dom";

export default function Goals() {
  const [goals, setGoals] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    targetAmount: "",
    targetDate: "",
  });
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);

  const navigate = useNavigate();
  const { goalId } = useParams(); // for edit page

  // Fetch goals
  useEffect(() => {
    const fetchGoals = async () => {
      const { data, error } = await supabase
        .from("goals")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) console.error(error);
      else setGoals(data);
      setLoading(false);
    };

    fetchGoals();
  }, []);

  // Fetch goal for editing
  useEffect(() => {
    if (!goalId) return;

    const goalToEdit = goals.find((g) => g.id === goalId);
    if (goalToEdit) {
      setFormData({
        name: goalToEdit.name,
        targetAmount: goalToEdit.target_amount,
        targetDate: goalToEdit.target_date,
      });
      setEditingId(goalId);
    }
  }, [goalId, goals]);

  // Handle input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Add or Update goal
  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, targetAmount, targetDate } = formData;

    if (!name || !targetAmount || !targetDate) {
      alert("Please fill in all fields!");
      return;
    }

    if (editingId) {
      const { error } = await supabase
        .from("goals")
        .update({
          name,
          target_amount: targetAmount,
          target_date: targetDate,
        })
        .eq("id", editingId);

      if (error) console.error(error);
      else navigate("/dashboard");
    } else {
      const { error } = await supabase.from("goals").insert([
        {
          name,
          target_amount: targetAmount,
          target_date: targetDate,
        },
      ]);

      if (error) console.error(error);
      else setFormData({ name: "", targetAmount: "", targetDate: "" });
    }
  };

  if (loading) return <p className="page">Loading...</p>;

  return (
    <div className="page">
      <h1>{editingId ? "Edit Goal" : "Add New Goal"}</h1>

      <div className="form-page">
        <form className="form" onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Goal Name"
            value={formData.name}
            onChange={handleChange}
          />
          <input
            type="number"
            name="targetAmount"
            placeholder="Target Amount"
            value={formData.targetAmount}
            onChange={handleChange}
          />
          <input
            type="date"
            name="targetDate"
            placeholder="Target Date"
            value={formData.targetDate}
            onChange={handleChange}
          />
          <button type="submit">
            {editingId ? "Update Goal" : "Add Goal"}
          </button>
        </form>
      </div>

      <h2 style={{ marginTop: "2rem" }}>Your Goals</h2>
      <div className="goals-grid grid gap-6 md:grid-cols-4 lg:grid-cols-4">
        {goals.map((goal) => (
          <div key={goal.id} className="goal-card">
            <h3>{goal.name}</h3>
            <p>
              Saved: KSh {goal.saved_amount} / KSh {goal.target_amount}
            </p>
            <p>Target Date: {new Date(goal.target_date).toLocaleDateString()}</p>
            <div className="deposit-section">
              <button
                style={{ backgroundColor: "#2563eb" }}
                onClick={() => navigate(`/goals/edit/${goal.id}`)}
              >
                Edit
              </button>
              <button
                style={{ backgroundColor: "#ef4444" }}
                onClick={async () => {
                  if (!window.confirm("Delete this goal?")) return;
                  const { error } = await supabase
                    .from("goals")
                    .delete()
                    .eq("id", goal.id);
                  if (error) console.error(error);
                  else setGoals(goals.filter((g) => g.id !== goal.id));
                }}
              >
                Delete
              </button>
            </div>
            <div className="progress-bar">
              <div
                className="progress-bar-fill"
                style={{
                  width: `${Math.min(
                    (goal.saved_amount / goal.target_amount) * 100,
                    100
                  )}%`,
                }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
