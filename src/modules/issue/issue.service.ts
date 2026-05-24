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

const getAllIssueFromDb = async (queryList: any) => {
  const { sort = "newest", type, status } = queryList;
  let issueResult;
  if (type && status) {
    issueResult = await pool.query(
      `
            SELECT * FROM issues 
            WHERE type = $1 AND status = $2
        `,
      [type, status],
    );
  } else if (type) {
    issueResult = await pool.query(
      `
            SELECT * FROM issues 
            WHERE type = $1
        `,
      [type],
    );
  } else if (status) {
    issueResult = await pool.query(
      `
            SELECT * FROM issues 
            WHERE status = $1
        `,
      [status],
    );
  } else {
    if (sort === "oldest") {
      issueResult = await pool.query(`
                SELECT * FROM issues ORDER BY created_at ASC
            `);
    } else {
      issueResult = await pool.query(`
                SELECT * FROM issues ORDER BY created_at DESC
            `);
    }
  }
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
