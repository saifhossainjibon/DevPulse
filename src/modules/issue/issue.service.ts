import { pool } from "../../db";

const createIssueIntoDb = async (payload: any, user: any) => {
  const { title, description, type } = payload;
  const userId = user.id;
  const result = await pool.query(
    `
      INSERT INTO issues (title, description, type, reporter_id)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `,
    [title, description, type, userId],
  );
  return result.rows[0];
};
const deleteIssueFromDb = async (id: string) => {
  const result = await pool.query(`DELETE FROM issues WHERE id = $1`, [id]);
  return result;
};
const updateIssueFromDb = async (payLoad: any, id: string) => {
  const { title, description, type } = payLoad;
  const result = await pool.query(
    `
    UPDATE issues
    SET
      title = COALESCE($1, title),
      description = COALESCE($2, description),
      type = COALESCE($3, type),
      updated_at = NOW()
    WHERE id = $4
    RETURNING *
    `,
    [title, description, type, id],
  );
  return result;
};
const getSingleIssueFromDb = async (id: string) => {
  const issueResult = await pool.query(`SELECT * FROM issues WHERE id = $1`, [
    id,
  ]);

  const issue = issueResult.rows[0];

  if (!issue) return null;
  const userResult = await pool.query(
    `SELECT id, name, role FROM users WHERE id = $1`,
    [issue.reporter_id],
  );

  const user = userResult.rows[0];

  return {
    id: issue.id,
    title: issue.title,
    description: issue.description,
    type: issue.type,
    status: issue.status,
    reporter: user
      ? {
          id: user.id,
          name: user.name,
          role: user.role,
        }
      : null,
    created_at: issue.created_at,
    updated_at: issue.updated_at,
  };
};

const getAllIssueFromDb = async (sort: string = "newest") => {
  let query = `SELECT * FROM issues`;
  if (sort === "oldest") {
    query += ` ORDER BY created_at ASC`;
  } else {
    query += ` ORDER BY created_at DESC`;
  }
  const issueResult = await pool.query(query);
  const issues = issueResult.rows;
  const finalIssues = [];
  for (const issue of issues) {
    const userResult = await pool.query(
      `SELECT id, name, role FROM users WHERE id = $1`,
      [issue.reporter_id],
    );
    const user = userResult.rows[0];
    finalIssues.push({
      id: issue.id,
      title: issue.title,
      description: issue.description,
      type: issue.type,
      status: issue.status,
      reporter: user
        ? {
            id: user.id,
            name: user.name,
            role: user.role,
          }
        : null,
      created_at: issue.created_at,
      updated_at: issue.updated_at,
    });
  }
  return finalIssues;
};
export const issueService = {
  createIssueIntoDb,
  deleteIssueFromDb,
  updateIssueFromDb,
  getSingleIssueFromDb,
  getAllIssueFromDb,
};
