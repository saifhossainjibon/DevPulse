
   import { createRequire } from 'module';
   const require = createRequire(import.meta.url);
  

// src/app.ts
import express from "express";

// src/modules/user/user.route.ts
import { Router } from "express";

// src/utils/sendResponse.ts
var sendResponse = (res, data) => {
  res.status(data.statusCode).json({
    success: data.success,
    message: data.message,
    data: data.data,
    error: data.error
  });
};
var sendResponse_default = sendResponse;

// src/db/index.ts
import { Pool } from "pg";

// src/config/index.ts
import dotenv from "dotenv";
import path from "path";
dotenv.config({
  path: path.join(process.cwd(), ".env")
});
var config = {
  port: process.env.PORT,
  connection_string: process.env.DATABASE_URL,
  secret: process.env.JWT_SECRET,
  refresh_secret: process.env.JWT_REFRESH_SECRET,
  node_env: process.env.NODE_ENV
};
var config_default = config;

// src/db/index.ts
var pool = new Pool({
  connectionString: config_default.connection_string
});
var initDB = async () => {
  try {
    await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(250) UNIQUE NOT NULL,
                password TEXT NOT NULL,
                role VARCHAR(20) DEFAULT 'contributor'
                    CHECK (role IN ('contributor', 'maintainer')),
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
                )
            `);
    await pool.query(`
            CREATE TABLE IF NOT EXISTS issues (
            id SERIAL PRIMARY KEY,
            title VARCHAR(150) NOT NULL,
            description TEXT NOT NULL
                CHECK (LENGTH(description) >= 20),
            type VARCHAR(20) NOT NULL
                CHECK (type IN ('bug', 'feature_request')),
            status VARCHAR(15) DEFAULT 'open'
                CHECK (status IN ('open', 'in_progress', 'resolved')),
            reporter_id INT,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
            )
      `);
    console.log("DATABASE CONNECTED SUCCESFULLY!!!");
  } catch (error) {
    console.log(error);
  }
};

// src/modules/user/user.service.ts
import bcrypt from "bcryptjs";
var createUserIntoDb = async (payLoad) => {
  const { name, email, password, role } = payLoad;
  const hashPassword = await bcrypt.hash(password, 10);
  const result = await pool.query(
    `
    INSERT INTO users(name, email, password, role)
    VALUES($1,$2,$3,COALESCE($4,'contributor'))
    RETURNING *
    `,
    [name, email, hashPassword, role]
  );
  delete result.rows[0].password;
  return result;
};
var userService = {
  createUserIntoDb
};

// src/modules/user/user.controller.ts
var createUser = async (req, res) => {
  try {
    const result = await userService.createUserIntoDb(req.body);
    sendResponse_default(res, {
      statusCode: 201,
      success: true,
      message: "User registered successfully",
      data: result.rows[0]
    });
  } catch (error) {
    sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: error.message,
      error
    });
  }
};
var userController = {
  createUser
};

// src/modules/user/user.route.ts
var router = Router();
router.post("/", userController.createUser);
var userRoute = router;

// src/modules/auth/auth.route.ts
import { Router as Router2 } from "express";

// src/modules/auth/auth.service.ts
import bcrypt2 from "bcryptjs";
import jwt from "jsonwebtoken";
var logInUserIntoDb = async (payLoad) => {
  const { email, password } = payLoad;
  const userData = await pool.query(
    `SELECT * FROM users WHERE email=$1
        `,
    [email]
  );
  if (userData.rows.length === 0) {
    throw new Error("Invalid Credentials emails!");
  }
  const user = userData.rows[0];
  const matchPassword = await bcrypt2.compare(password, user.password);
  if (!matchPassword) {
    throw new Error("Invalid Credentials!");
  }
  const jwtpayload = {
    id: user.id,
    name: user.name,
    role: user.role,
    email: user.email
  };
  const token = jwt.sign(jwtpayload, config_default.secret, {
    expiresIn: "1d"
  });
  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      created_at: user.created_at,
      updated_at: user.updated_at
    }
  };
};
var authService = {
  logInUserIntoDb
};

// src/modules/auth/auth.controller.ts
var loginUser = async (req, res) => {
  try {
    const result = await authService.logInUserIntoDb(req.body);
    sendResponse_default(res, {
      statusCode: 200,
      success: true,
      message: "Login successful",
      data: result
    });
  } catch (error) {
    sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: error.message,
      error
    });
  }
};
var authController = {
  loginUser
};

// src/modules/auth/auth.route.ts
var router2 = Router2();
router2.post("/", authController.loginUser);
var authRoute = router2;

// src/modules/issue/issue.route.ts
import { Router as Router3 } from "express";

// src/modules/issue/issue.service.ts
var createIssueIntoDb = async (payload, user) => {
  const { title, description, type } = payload;
  const userId = user.id;
  const result = await pool.query(
    `
      INSERT INTO issues (title, description, type, reporter_id)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `,
    [title, description, type, userId]
  );
  return result.rows[0];
};
var deleteIssueFromDb = async (id) => {
  const result = await pool.query(`DELETE FROM issues WHERE id = $1`, [id]);
  return result;
};
var updateIssueFromDb = async (payLoad, id) => {
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
    [title, description, type, id]
  );
  return result;
};
var getSingleIssueFromDb = async (id) => {
  const issueResult = await pool.query(`SELECT * FROM issues WHERE id = $1`, [
    id
  ]);
  const issue = issueResult.rows[0];
  if (!issue) return null;
  const userResult = await pool.query(
    `SELECT id, name, role FROM users WHERE id = $1`,
    [issue.reporter_id]
  );
  const user = userResult.rows[0];
  return {
    id: issue.id,
    title: issue.title,
    description: issue.description,
    type: issue.type,
    status: issue.status,
    reporter: user ? {
      id: user.id,
      name: user.name,
      role: user.role
    } : null,
    created_at: issue.created_at,
    updated_at: issue.updated_at
  };
};
var getAllIssueFromDb = async (queryList) => {
  const { sort = "newest", type, status } = queryList;
  let issueResult;
  if (type && status) {
    issueResult = await pool.query(
      `
            SELECT * FROM issues 
            WHERE type = $1 AND status = $2
        `,
      [type, status]
    );
  } else if (type) {
    issueResult = await pool.query(
      `
            SELECT * FROM issues 
            WHERE type = $1
        `,
      [type]
    );
  } else if (status) {
    issueResult = await pool.query(
      `
            SELECT * FROM issues 
            WHERE status = $1
        `,
      [status]
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
      [issue.reporter_id]
    );
    const user = userResult.rows[0];
    finalIssues.push({
      id: issue.id,
      title: issue.title,
      description: issue.description,
      type: issue.type,
      status: issue.status,
      reporter: user ? {
        id: user.id,
        name: user.name,
        role: user.role
      } : null,
      created_at: issue.created_at,
      updated_at: issue.updated_at
    });
  }
  return finalIssues;
};
var issueService = {
  createIssueIntoDb,
  deleteIssueFromDb,
  updateIssueFromDb,
  getSingleIssueFromDb,
  getAllIssueFromDb
};

// src/modules/issue/issue.controller.ts
var createIssue = async (req, res) => {
  try {
    const user = req.user;
    const result = await issueService.createIssueIntoDb(req.body, user);
    sendResponse_default(res, {
      statusCode: 200,
      success: true,
      message: "Issue created successfully",
      data: result
    });
  } catch (error) {
    sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: error.message,
      error
    });
  }
};
var deleteIssue = async (req, res) => {
  const { id } = req.params;
  console.log("from deleted-", req.user);
  try {
    const result = await issueService.deleteIssueFromDb(id);
    if (result.rowCount === 0) {
      sendResponse_default(res, {
        statusCode: 404,
        success: false,
        message: "issue not found"
      });
    }
    sendResponse_default(res, {
      statusCode: 200,
      success: true,
      message: "Issue deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      error
    });
  }
};
var updateIssue = async (req, res) => {
  const { id } = req.params;
  try {
    const issueResult = await issueService.getSingleIssueFromDb(id);
    if (!issueResult) {
      return sendResponse_default(res, {
        statusCode: 404,
        success: false,
        message: "Issue not found"
      });
    }
    if (req.user.role === "contributor") {
      if (issueResult.reporter?.id !== req.user.id) {
        return sendResponse_default(res, {
          statusCode: 403,
          success: false,
          message: "You are not authorized"
        });
      }
      if (issueResult.status !== "open") {
        return sendResponse_default(res, {
          statusCode: 403,
          success: false,
          message: "You can only update open issues"
        });
      }
    }
    const updatedResult = await issueService.updateIssueFromDb(
      req.body,
      id
    );
    return sendResponse_default(res, {
      statusCode: 200,
      success: true,
      message: "Issue updated successfully",
      data: updatedResult.rows[0]
    });
  } catch (error) {
    return sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: error.message
    });
  }
};
var getSingleIssue = async (req, res) => {
  const { id } = req.params;
  try {
    const issue = await issueService.getSingleIssueFromDb(id);
    if (!issue) {
      return res.status(404).json({
        success: false,
        message: "Issue not found",
        data: {}
      });
    }
    res.status(200).json({
      success: true,
      message: "Issue retrieved successfully",
      data: issue
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      error
    });
  }
};
var getAllIssue = async (req, res) => {
  try {
    const result = await issueService.getAllIssueFromDb(req.query);
    if (result.length === 0) {
      sendResponse_default(res, {
        statusCode: 404,
        success: false,
        message: "No issue found"
      });
    }
    res.status(200).json({
      success: true,
      message: "Issues retrieved successfully",
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      error
    });
  }
};
var issueController = {
  createIssue,
  deleteIssue,
  updateIssue,
  getSingleIssue,
  getAllIssue
};

// src/middleware/auth.ts
import jwt2 from "jsonwebtoken";
var auth = (...roles) => {
  return async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      if (!token) {
        return res.status(401).json({
          success: false,
          massage: "Unauthorized Access!!"
        });
      }
      const decoded = jwt2.verify(
        token,
        config_default.secret
      );
      const userData = await pool.query(
        `SELECT * FROM users WHERE email=$1`,
        [decoded.email]
      );
      const user = userData.rows[0];
      if (userData.rows.length === 0) {
        return res.status(404).json({
          success: false,
          massage: "User not found!!"
        });
      }
      if (roles.length && !roles.includes(user.role)) {
        return res.status(403).json({
          success: false,
          massage: "user does not have permission"
        });
      }
      req.user = decoded;
      next();
    } catch (error) {
      next(error);
    }
  };
};
var auth_default = auth;

// src/types/index.ts
var USER_ROLE = {
  contributor: "contributor",
  maintainer: "maintainer"
};

// src/modules/issue/issue.route.ts
var router3 = Router3();
router3.post("/", auth_default(USER_ROLE.contributor, USER_ROLE.maintainer), issueController.createIssue);
router3.get("/", issueController.getAllIssue);
router3.get("/:id", issueController.getSingleIssue);
router3.patch("/:id", auth_default(USER_ROLE.contributor, USER_ROLE.maintainer), issueController.updateIssue);
router3.delete("/:id", auth_default(USER_ROLE.maintainer), issueController.deleteIssue);
var issueRoute = router3;

// src/middleware/globalErrorHandler.ts
var globalErrorHandler = (err, req, res, next) => {
  res.status(500).json({
    success: false,
    message: err instanceof Error ? err.message : "Internal Server Error",
    stack: config_default.node_env === "development" && err instanceof Error ? err.stack : void 0
  });
};
var globalErrorHandler_default = globalErrorHandler;

// src/app.ts
var app = express();
app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));
app.get("/", (req, res) => {
  res.status(200).json({
    massage: "Express Server",
    author: "DevPluse"
  });
});
app.use("/api/auth/signup", userRoute);
app.use("/api/auth/login", authRoute);
app.use("/api/issues", issueRoute);
app.use(globalErrorHandler_default);
var app_default = app;

// src/server.ts
var main = async () => {
  await initDB();
  app_default.listen(config_default.port, () => {
    console.log(`Server listening on port ${config_default.port}`);
  });
};
main();
//# sourceMappingURL=server.js.map