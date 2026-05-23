import type { NextFunction, Request, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import config from "../config";
import { pool } from "../db";
import type { ROLES } from "../types/index";



const auth = (...roles: ROLES[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {
    // console.log(roles)
    try {
    // 1. Check if the token exists
    // 2. Verify the token
    // 3. Find the user into database
    // 4. If the user active or not?
    const token = req.headers.authorization;
    if (!token) {
      res.status(401).json({
        success: false,
        massage: "Unauthorized Access!!",
      });
    }
    const decoded = jwt.verify(
      token as string,
      config.secret as string,
    ) as JwtPayload;

    const userData = await pool.query(
      `
        SELECT * FROM users WHERE email=$1
        `,
      [decoded.email],
    );

    const user = userData.rows[0];
    if (userData.rows.length === 0) {
      res.status(404).json({
        success: false,
        massage: "User not found!!",
      });
    }
    // if (!user?.is_active) {
    //   res.status(403).json({
    //     success: false,
    //     massage: "Forbidden",
    //   });
    // }
    // console.log("Auth--",user.role);
    if(roles.length && !roles.includes(user.role)){
        res.status(403).json({
        success: false,
        massage: "user does not have permission",
      });
    }
    (req as any).user=decoded
    next();
    } catch (error) {
        next(error)
    }
  };
};
export default auth;
// ai auth func er maddhome amra getAllUser route ke protected korci jeno sobai ma deakhte pare