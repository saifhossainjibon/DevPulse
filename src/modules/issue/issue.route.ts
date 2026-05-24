import { Router } from "express";
import { issueController } from "./issue.controller";
import auth from "../../middleware/auth";
import { USER_ROLE } from "../../types";


const router = Router();
router.post("/",auth(USER_ROLE.contributor,USER_ROLE.maintainer),issueController.createIssue) //done
router.get("/",issueController.getAllIssue) //done
router.get("/:id",issueController.getSingleIssue) // done
router.patch("/:id",auth(USER_ROLE.contributor,USER_ROLE.maintainer),issueController.updateIssue) //done
router.delete("/:id",issueController.deleteIssue) // done
// router.post("/refresh-token",authController.refreshToken)
export const issueRoute = router;