import pool from '../models/faqDB.js'

// Get all FAQs
export const getAllFAQs = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM faqs ORDER BY updated_at DESC')
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// Get single FAQ by ID
export const getFAQById = async (req, res) => {
  const { id } = req.params
  try {
    const [rows] = await pool.query('SELECT * FROM faqs WHERE faq_id = ?', [id])
    if (rows.length === 0) return res.status(404).json({ error: 'FAQ not found' })
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// Create new FAQ
export const createFAQ = async (req, res) => {
  const {
    question,
    answer_md,
    created_by,
    category = 'Uncategorized',
    status = 'Draft',
    tags = '',
    views = 0,
    helpful = 0,
    notHelpful = 0,
  } = req.body

  try {
    const [result] = await pool.query(
      `INSERT INTO faqs (
        question, answer_md, created_by, category, status, tags, views, helpful, notHelpful, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [question, answer_md, created_by, category, status, tags, views, helpful, notHelpful]
    )

    res.json({ faq_id: result.insertId })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// Update FAQ
export const updateFAQ = async (req, res) => {
  const { id } = req.params
  const {
    question,
    answer_md,
    updated_by,
    is_active,
    category,
    status,
    tags,
    views,
    helpful,
    notHelpful,
  } = req.body

  try {
    await pool.query(
      `UPDATE faqs SET
        question = ?,
        answer_md = ?,
        updated_by = ?,
        is_active = ?,
        category = ?,
        status = ?,
        tags = ?,
        views = ?,
        helpful = ?,
        notHelpful = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE faq_id = ?`,
      [
        question,
        answer_md,
        updated_by,
        is_active,
        category,
        status,
        tags,
        views,
        helpful,
        notHelpful,
        id,
      ]
    )

    res.json({ message: 'Updated successfully' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// Delete FAQ
export const deleteFAQ = async (req, res) => {
  const { id } = req.params
  try {
    await pool.query('DELETE FROM faqs WHERE faq_id = ?', [id])
    res.json({ message: 'Deleted successfully' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// Increment Views
export const incrementFAQViews = async (req, res) => {
  const { id } = req.params
  try {
    await pool.query(
      'UPDATE faqs SET views = views + 1 WHERE faq_id = ?',
      [id]
    )
    res.json({ message: 'View count incremented' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// Publish FAQ
export const publishFAQ = async (req, res) => {
  const { id } = req.params
  try {
    await pool.query(
      'UPDATE faqs SET status = "Published", updated_at = CURRENT_TIMESTAMP WHERE faq_id = ?',
      [id]
    )
    res.json({ message: 'Published successfully' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
