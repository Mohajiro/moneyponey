import express from "express";
import dotenv from "dotenv";
import mysql from "mysql2/promise";
import cors from "cors";

dotenv.config();

const app = express();
app.use(cors()); 
app.use(express.json());

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

app.get("/api/expenses", async (req, res) => {
  const { category_id, dateFrom, dateTo } = req.query;

  let query = "SELECT * FROM expenses WHERE 1";
  const params = [];

  if (category_id) {
    query += " AND category_id = ?";
    params.push(category_id);
  }

  if (dateFrom) {
    query += " AND date >= ?";
    params.push(dateFrom);
  }

  if (dateTo) {
    query += " AND date <= ?";
    params.push(dateTo);
  }

  try {
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error("Ошибка при фильтрации:", err);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

app.post("/api/expenses", async (req, res) => {
  const { title, summe, date, category_id } = req.body;

  if (!title || !summe || !date || !category_id) {
    return res.status(400).json({ error: "Все поля обязательны" });
  }

  try {
    const [result] = await pool.query(
      "INSERT INTO expenses (title, summe, date, category_id) VALUES (?, ?, ?, ?)",
      [title, summe, date, category_id]
    );
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    console.error("Ошибка при добавлении расхода:", err);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

app.delete("/api/expenses/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query("DELETE FROM expenses WHERE id = ?", [id]);
    res.status(204).end();
  } catch (err) {
    console.error("Ошибка при удалении:", err);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

app.put("/api/expenses/:id", async (req, res) => {
  const { id } = req.params;
  const { title, summe, date, category_id } = req.body;

  try {
    await pool.query(
      "UPDATE expenses SET title = ?, summe = ?, date = ?, category_id = ? WHERE id = ?",
      [title, summe, date, category_id, id]
    );
    res.status(200).json({ message: "Расход обновлён" });
  } catch (err) {
    console.error("Ошибка при обновлении:", err);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
