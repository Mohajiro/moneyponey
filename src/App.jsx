import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

function App() {
  const [expenses, setExpenses] = useState([]);
  const [newExpense, setNewExpense] = useState({
    title: "",
    summe: "",
    date: "",
    category_id: 1,
  });
  const [editId, setEditId] = useState(null);
  const [filters, setFilters] = useState({
    category_id: "",
    dateFrom: "",
    dateTo: "",
  });

  const fetchExpenses = () => {
    const params = new URLSearchParams();

    if (filters.category_id) params.append("category_id", filters.category_id);
    if (filters.dateFrom) params.append("dateFrom", filters.dateFrom);
    if (filters.dateTo) params.append("dateTo", filters.dateTo);

    fetch(`/api/expenses?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => setExpenses(data))
      .catch((err) => console.error("Ошибка загрузки данных:", err));
  };

  const chartData = expenses.reduce((acc, exp) => {
    const date = exp.date.slice(0, 10);
    const sum = parseFloat(exp.summe);
  
    const existing = acc.find((item) => item.date === date);
    if (existing) {
      existing.total += sum;
    } else {
      acc.push({ date, total: sum });
    }
  
    return acc;
  }, []);

  useEffect(() => {
    fetchExpenses();
  }, [filters]); // автоматическое применение при изменении фильтра

  const handleSubmit = (e) => {
    e.preventDefault();

    const method = editId ? "PUT" : "POST";
    const url = editId ? `/api/expenses/${editId}` : "/api/expenses";

    fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newExpense),
    })
      .then((res) => res.json())
      .then(() => {
        setNewExpense({ title: "", summe: "", date: "", category_id: 1 });
        setEditId(null);
        fetchExpenses();
      })
      .catch((err) => console.error("Ошибка при сохранении:", err));
  };

  const handleDelete = (id) => {
    fetch(`/api/expenses/${id}`, {
      method: "DELETE",
    })
      .then(() => {
        setExpenses((prev) => prev.filter((exp) => exp.id !== id));
      })
      .catch((err) => console.error("Ошибка при удалении:", err));
  };

  const handleEdit = (exp) => {
    setNewExpense({
      title: exp.title,
      summe: exp.summe,
      date: exp.date.slice(0, 10),
      category_id: exp.category_id,
    });
    setEditId(exp.id);
  };

  const totalSum = expenses
    .reduce((acc, exp) => acc + parseFloat(exp.summe), 0)
    .toFixed(2);

  return (
    <div className="max-w-xl mx-auto p-4 bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 rounded-2xl shadow-lg">
      <h1 className="text-3xl font-bold mb-4 text-center text-purple-600">
        🦄 MoneyPoney
      </h1>

      {/* Форма добавления / редактирования */}
      <form onSubmit={handleSubmit} className="mb-6 space-y-3">
        <input
          type="text"
          placeholder="Название"
          value={newExpense.title}
          onChange={(e) =>
            setNewExpense({ ...newExpense, title: e.target.value })
          }
          className="border border-purple-300 p-2 w-full rounded bg-white shadow-sm"
          required
        />
        <input
          type="number"
          placeholder="Сумма"
          value={newExpense.summe}
          onChange={(e) =>
            setNewExpense({ ...newExpense, summe: e.target.value })
          }
          className="border border-purple-300 p-2 w-full rounded bg-white shadow-sm"
          required
        />
        <input
          type="date"
          value={newExpense.date}
          onChange={(e) =>
            setNewExpense({ ...newExpense, date: e.target.value })
          }
          className="border border-purple-300 p-2 w-full rounded bg-white shadow-sm"
          required
        />
        <select
          value={newExpense.category_id}
          onChange={(e) =>
            setNewExpense({ ...newExpense, category_id: e.target.value })
          }
          className="border border-purple-300 p-2 w-full rounded bg-white shadow-sm"
        >
          <option value="1">🛒 Продукты</option>
          <option value="2">🚌 Транспорт</option>
          <option value="3">🎮 Развлечения</option>
          <option value="4">🏠 Коммуналка</option>
        </select>
        <button
          type="submit"
          className="bg-pink-400 hover:bg-pink-500 text-white px-4 py-2 rounded w-full font-semibold shadow-md"
        >
          {editId ? "💾 Сохранить" : "➕ Добавить"}
        </button>
        {editId && (
          <button
            type="button"
            onClick={() => {
              setNewExpense({ title: "", summe: "", date: "", category_id: 1 });
              setEditId(null);
            }}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded w-full font-semibold"
          >
            ✖ Отменить
          </button>
        )}
      </form>

      {/* Фильтры */}
      <h2 className="text-xl font-semibold mb-2 text-purple-600">🔍 Фильтр</h2>
      <div className="mb-6 space-y-2">
        <select
          value={filters.category_id}
          onChange={(e) =>
            setFilters({ ...filters, category_id: e.target.value })
          }
          className="border border-purple-200 p-2 w-full rounded bg-white shadow-sm"
        >
          <option value="">Все категории</option>
          <option value="1">🛒 Продукты</option>
          <option value="2">🚌 Транспорт</option>
          <option value="3">🎮 Развлечения</option>
          <option value="4">🏠 Коммуналка</option>
        </select>

        <div className="flex space-x-2">
          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) =>
              setFilters({ ...filters, dateFrom: e.target.value })
            }
            className="border border-purple-200 p-2 rounded w-full bg-white shadow-sm"
          />
          <input
            type="date"
            value={filters.dateTo}
            onChange={(e) =>
              setFilters({ ...filters, dateTo: e.target.value })
            }
            className="border border-purple-200 p-2 rounded w-full bg-white shadow-sm"
          />
        </div>
        <button
          onClick={() => {
            setFilters({ category_id: "", dateFrom: "", dateTo: "" });
          }}
          className="bg-purple-300 hover:bg-purple-400 text-white px-4 py-2 rounded w-full font-semibold shadow-md"
        >
          🧹 Сбросить фильтр
        </button>
      </div>

      {/* Список расходов */}
      <h2 className="text-xl font-semibold mb-2 text-purple-600">🧾 Расходы</h2>
      <ul className="space-y-3">
  {expenses.map((exp) => (
    <li
      key={exp.id}
      className="border border-purple-200 p-3 rounded-xl shadow bg-white flex flex-col sm:flex-row sm:justify-between sm:items-center"
    >
      <div className="text-purple-800">
        <div className="font-semibold text-lg">{exp.title}</div>
        <div className="text-sm text-gray-600">
          {parseFloat(exp.summe).toFixed(2)} € —{" "}
          {new Date(exp.date).toLocaleDateString("ru-RU", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </div>
      </div>

      <div className="flex mt-2 sm:mt-0 sm:ml-4 space-x-3 justify-end sm:justify-start">
        <button
          onClick={() => handleEdit(exp)}
          className="text-blue-500 hover:text-blue-700 font-bold text-lg"
          title="Изменить"
        >
          ✏️
        </button>
        <button
          onClick={() => handleDelete(exp.id)}
          className="text-red-500 hover:text-red-700 font-bold text-lg"
          title="Удалить"
        >
          ✖
        </button>
      </div>
    </li>
  ))}
</ul>
      {/* Итого */}
      <div className="mt-6 text-right text-lg font-bold text-purple-700">
        🌈 Итого: {totalSum} €
      </div>
      <h2 className="text-xl font-semibold mb-2 text-purple-600 mt-8">📈 График по дням</h2>
      <div className="bg-white rounded-xl shadow p-4">
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="total" stroke="#c084fc" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default App;
