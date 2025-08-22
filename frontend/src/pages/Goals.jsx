import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function Goals() {
  const [goals, setGoals] = useState([]);
  const [formData, setFormData] = useState({ name: "", target_amount: "", target_date: "" });
  const [depositAmount, setDepositAmount] = useState({});
  const [editGoalId, setEditGoalId] = useState(null);
  const [editFormData, setEditFormData] = useState({});
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

    if (!error) setGoals(data);
  }

  // ✅ Handle form changes
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  // ✅ Add a new goal
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    const { error } = await supabase.from("goals").insert({
      user_id: user.id,
      name: formData.name,
      target_amount: parseFloat(formData.target_amount),
      target_date: formData.target_date,
      saved_amount: 0
    });

    if (!error) {
      setFormData({ name: "", target_amount: "", target_date: "" });
      fetchGoals(user.id);
    }
  };

  // ✅ Deposit into goal
  const handleDeposit = async (goalId) => {
    const amount = parseFloat(depositAmount[goalId] || 0);
    if (isNaN(amount) || amount <= 0) return;

    const goal = goals.find((g) => g.id === goalId);
    if (!goal) return;

    const newSavedAmount = parseFloat(goal.saved_amount) + amount;

    const { error } = await supabase
      .from("goals")
      .update({ saved_amount: newSavedAmount })
      .eq("id", goalId);

    if (!error) {
      setDepositAmount({ ...depositAmount, [goalId]: "" });
      fetchGoals(user.id);
    }
  };

  // ✅ Start editing a goal
  const handleEdit = (goal) => {
    setEditGoalId(goal.id);
    setEditFormData({ name: goal.name, target_amount: goal.target_amount, target_date: goal.target_date });
  };

  // ✅ Save edited goal
  const handleSaveEdit = async (goalId) => {
    const { error } = await supabase
      .from("goals")
      .update({
        name: editFormData.name,
        target_amount: parseFloat(editFormData.target_amount),
        target_date: editFormData.target_date
      })
      .eq("id", goalId);

    if (!error) {
      setEditGoalId(null);
      fetchGoals(user.id);
    }
  };

  // ✅ Delete a goal
  const handleDelete = async (goalId) => {
    const { error } = await supabase.from("goals").delete().eq("id", goalId);
    if (!error) fetchGoals(user.id);
  };

  const formatCurrency = (amount) => `KSh ${amount.toLocaleString()}`;

  return (
    <div className="page">
      <h1 className="text-3xl font-bold mb-6">Your Goals</h1>

      {/* Add Goal Form */}
      <form className="form mb-6" onSubmit={handleSubmit}>
        <input type="text" name="name" placeholder="Goal Name" value={formData.name} onChange={handleChange} required />
        <input type="number" name="target_amount" placeholder="Target Amount (KSh)" value={formData.target_amount} onChange={handleChange} required />
        <input type="date" name="target_date" value={formData.target_date} onChange={handleChange} required />
        <button type="submit">Add Goal</button>
      </form>

      {/* Goals List */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {goals.length === 0 && <p>No goals yet. Add one above!</p>}
        {goals.map((goal) => (
          <div key={goal.id} className="p-5 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
            {editGoalId === goal.id ? (
              <>
                <input type="text" value={editFormData.name} onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })} className="mb-2" />
                <input type="number" value={editFormData.target_amount} onChange={(e) => setEditFormData({ ...editFormData, target_amount: e.target.value })} className="mb-2" />
                <input type="date" value={editFormData.target_date} onChange={(e) => setEditFormData({ ...editFormData, target_date: e.target.value })} className="mb-2" />
                <button onClick={() => handleSaveEdit(goal.id)} className="mr-2 bg-green-500 text-white px-3 py-1 rounded">Save</button>
                <button onClick={() => setEditGoalId(null)} className="bg-gray-300 px-3 py-1 rounded">Cancel</button>
              </>
            ) : (
              <>
                <h3 className="text-xl font-semibold">{goal.name}</h3>
                <p>{formatCurrency(goal.saved_amount)} / {formatCurrency(goal.target_amount)}</p>
                <progress value={goal.saved_amount} max={goal.target_amount} className="w-full mb-2"></progress>
                <p>Target Date: {new Date(goal.target_date).toDateString()}</p>

                {/* Deposit */}
                <div className="deposit-section mt-2 flex gap-2">
                  <input
                    type="number"
                    placeholder="Deposit Amount"
                    value={depositAmount[goal.id] || ""}
                    onChange={(e) => setDepositAmount({ ...depositAmount, [goal.id]: e.target.value })}
                    className="border px-2 py-1 rounded w-1/2"
                  />
                  <button onClick={() => handleDeposit(goal.id)} className="bg-blue-500 text-white px-3 py-1 rounded">Deposit</button>
                </div>

                {/* Edit / Delete */}
                <div className="mt-2 flex gap-2">
                  <button onClick={() => handleEdit(goal)} className="bg-yellow-400 text-white px-3 py-1 rounded">Edit</button>
                  <button onClick={() => handleDelete(goal.id)} className="bg-red-500 text-white px-3 py-1 rounded">Delete</button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
