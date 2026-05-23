import { pool } from "../../db";
// import type { IUser } from "./user.interface";
import bcrypt from "bcryptjs";

const createUserIntoDb = async (payLoad: any) => {
    const {name, email, password, role} =payLoad;
    const hashPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `
    INSERT INTO users(name, email, password, role)
    VALUES($1,$2,$3,COALESCE($4,'contributor'))
    RETURNING *
    `,
      [name, email, hashPassword, role],
    );
    delete result.rows[0].password
    return result;
};
// const getAllUsersFromDb= async()=>{
//       const result = await pool.query(`
//             SELECT * FROM users
//             `);
//       return result;
// }
// const getSingleUserFromDb= async(id:string)=>{
//   const result = await pool.query(
//       `
//             SELECT * FROM users
//             WHERE id=$1
//             `,
//       [id],
//     );
//     return result
// }
// const updateSingleUserFromDb =async(payLoad: IUser, id:string)=>{
//   const {name, is_active, age, password} =payLoad;
//   const result = await pool.query(
//       `
//             UPDATE users
//             SET name = COALESCE($1,name),
//             password = COALESCE($2,password),
//             age = COALESCE($3,age),
//             is_active = COALESCE($4,is_active)
//             WHERE id = $5 RETURNING *
//             `,
//       [name, password, age, is_active, id],
//     );
//     return result;
// }
// const deleteSingleUserFromDb=async(id:string)=>{
//   const result = await pool.query(
//       `DELETE FROM users WHERE id = $1`,[id],
//     );
//     return result;
// }
export const userService ={
    createUserIntoDb
}