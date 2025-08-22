import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function Goals() {
  const [goals, setGoals] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    target_amount: "",
    target_date: ""
  });
  const [depositAmount, setDepositAmount] = useState({});
  const [user, setUser] = useState(null);

  // ✅ Fetch logged-in user
  useEffect(() => {
    async function getUser() {
      const { data, error } = await supabase.auth.getUser();
      if (!error && data?.user) {
        setUser(data.user);
        fetchGoals(data.user.id);
      }
    }
    getUser();
  }, []);

  // ✅ Fetch goals for the user
  async function fetchGoals(userId) {
    const { data, error } = await supabase
      .from("goals")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
    } else {
      setGoals(data);
    }
  }

  // ✅ Handle form changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ✅ Add a new goal
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    const { error } = await supabase.from("goals").insert({
      user_id: user.id,
      name: formData.name,
      target_amount: parseFloat(formData.target_amount),
      target_date: formData.target_date
    });

    if (error) {
      console.error(error);
    } else {
      setFormData({ name: "", target_amount: "", target_date: "" });
      fetchGoals(user.id);
    }
  };

  // ✅ Deposit into goal
  const handleDeposit = async (goalId) => {
    const amount = parseFloat(depositAmount[goalId] || 0);
    if (isNaN(amount) || amount <= 0) return;

    // Get current goal
    const goal = goals.find((g) => g.id === goalId);
    if (!goal) return;

    const newSavedAmount = parseFloat(goal.saved_amount) + amount;

    const { error } = await supabase
      .from("goals")
      .update({ saved_amount: newSavedAmount })
      .eq("id", goalId);

    if (error) {
      console.error(error);
    } else {
      setDepositAmount({ ...depositAmount, [goalId]: "" });
      fetchGoals(user.id);
    }
  };

  return (
    <div className="page">
      <h1>Your Goals</h1>

      {/* Goal Form */}
      <form className="form" onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Goal Name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="target_amount"
          placeholder="Target Amount"
          value={formData.target_amount}
          onChange={handleChange}
          required
        />
        <input
          type="date"
          name="target_date"
          value={formData.target_date}
          onChange={handleChange}
          required
        />
        <button type="submit">Add Goal</button>
      </form>

      {/* Goals List */}
      <div className="goals-list">
        {goals.length === 0 ? (
          <p>No goals yet. Add one above!</p>
        ) : (
          goals.map((goal) => (
            <div key={goal.id} className="goal-card">
              <h3>{goal.name}</h3>
              <p>
                Saved: ${goal.saved_amount} / ${goal.target_amount}
              </p>
              <progress
                value={goal.saved_amount}
                max={goal.target_amount}
              ></progress>
              <p>Target Date: {new Date(goal.target_date).toDateString()}</p>

              {/* Deposit Form */}
              <div className="deposit-section">
                <input
                  type="number"
                  placeholder="Deposit Amount"
                  value={depositAmount[goal.id] || ""}
                  onChange={(e) =>
                    setDepositAmount({
                      ...depositAmount,
                      [goal.id]: e.target.value
                    })
                  }
                />
                <button onClick={() => handleDeposit(goal.id)}>Deposit</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
