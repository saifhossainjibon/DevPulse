import { Router } from "express";
import { issueController } from "./issue.controller";
import auth from "../../middleware/auth";


const router = Router();
router.post("/",auth(),issueController.createIssue) //done
router.get("/",issueController.getAllIssue) //done
router.get("/:id",issueController.getSingleIssue) // done
router.patch("/:id",issueController.updateIssue) //done
router.delete("/:id",issueController.deleteIssue) // done
// router.post("/refresh-token",authController.refreshToken)
export const issueRoute = router;