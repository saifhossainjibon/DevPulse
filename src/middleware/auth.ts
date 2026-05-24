import type { NextFunction, Request, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import config from "../config";
import { pool } from "../db";
import type { ROLES } from "../types/index";
const auth = (...roles: ROLES[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {
    try {
    const token = req.headers.authorization;
    if (!token) {
      return res.status(401).json({
        success: false,
        massage: "Unauthorized Access!!",
      });
    }
    const decoded = jwt.verify(
      token as string,
      config.secret as string,
    ) as JwtPayload;
    const userData = await pool.query(
      `SELECT * FROM users WHERE email=$1`,
      [decoded.email],
    );
    const user = userData.rows[0];
    if (userData.rows.length === 0) {
      return res.status(404).json({
        success: false,
        massage: "User not found!!",
      });
    }
    if(roles.length && !roles.includes(user.role)){
        return res.status(403).json({
        success: false,
        massage: "user does not have permission",
      });
    }
    req.user=decoded
    next();
    } catch (error) {
        next(error)
    }
  };
};
export default auth;