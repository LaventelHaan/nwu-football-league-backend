// controllers/watchlistController.js
import pool from "../db.js";

// GET all watchlist players
export const getWatchlist = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        watchlist_id,
        player_name,
        position,
        age,
        current_team AS currentTeam,
        league,
        priority,
        added_by AS addedBy,
        added_date AS addedDate,
        notes,
        next_scouting_date AS nextScoutingDate
      FROM watchlist
    `);
    res.status(200).json(rows ?? []);
  } catch (error) {
    console.error("Error fetching watchlist:", error);
    res.status(500).json({ error: "Failed to fetch watchlist" });
  }
};

// POST add player
export const addToWatchlist = async (req, res) => {
  const {
    player_name,
    position,
    age,
    current_team,
    league,
    priority = "Medium",
    added_by,
    added_date,
    next_scouting_date,
    notes,
  } = req.body;

  if (!player_name || !position || !added_by || !added_date) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO watchlist 
        (player_name, position, age, current_team, league, priority, added_by, added_date, next_scouting_date, notes) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        player_name,
        position,
        age ?? null,
        current_team ?? "Free Agent",
        league ?? null,
        priority,
        added_by,
        added_date,
        next_scouting_date ?? null,
        notes ?? "",
      ]
    );

    res.status(201).json({
      watchlist_id: result.insertId,
      player_name,
      position,
      age,
      current_team,
      league,
      priority,
      added_by,
      added_date,
      next_scouting_date,
      notes,
    });
  } catch (err) {
    console.error("Insert error:", err);
    res.status(500).json({ error: "Failed to add player" });
  }
};

// PUT update player
export const updateWatchlistPlayer = async (req, res) => {
  const { id } = req.params;
  const { player_name, position, notes, next_scouting_date } = req.body;

  if (!id || !player_name || !position) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const [result] = await pool.query(
      `UPDATE watchlist 
       SET player_name = ?, position = ?, notes = ?, next_scouting_date = ? 
       WHERE watchlist_id = ?`,
      [player_name, position, notes ?? "", next_scouting_date ?? null, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Player not found or no changes made" });
    }

    res.status(200).json({
      watchlist_id: id,
      player_name,
      position,
      notes,
      next_scouting_date,
    });
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ error: "Failed to update player" });
  }
};
