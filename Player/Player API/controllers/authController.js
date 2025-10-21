import bcrypt from "bcrypt";
import pool from '../models/db.js'

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const [users] = await pool.query(
      `SELECT u.user_id, u.email, u.password_hash, r.role_key AS role
       FROM users u
       JOIN user_roles ur ON u.user_id = ur.user_id
       JOIN roles r ON ur.role_id = r.role_id
       WHERE u.email = ?`,
      [email]
    );

    if (users.length === 0) return res.status(404).send("User not found");

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) return res.status(401).send("Invalid password");

    res.json({
      user_id: user.user_id,
      email: user.email,
      role: user.role,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).send("Internal server error");
  }
};