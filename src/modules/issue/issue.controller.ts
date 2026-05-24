import type { Request, Response } from "express";
import { issueService } from "./issue.service";
import sendResponse from "../../utils/sendResponse";

const createIssue = async (req: Request, res: Response) => {
  try {
    // console.log("from create issue",req.user)
    const user = req.user;
    const result = await issueService.createIssueIntoDb(req.body, user);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Issue created successfully",
      data: result,
    });
  } catch (error: any) {
    sendResponse(res, {
      statusCode: 500,
      success: false,
      message: error.message,
      error: error,
    });
  }
};
const deleteIssue = async (req: Request, res: Response) => {
  const { id } = req.params;
  console.log("from deleted-", req.user);
  try {
    const result = await issueService.deleteIssueFromDb(id as string);
    if (result.rowCount === 0) {
      sendResponse(res, {
        statusCode: 404,
        success: false,
        message: "issue not found",
      });
    }
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Issue deleted successfully",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
      error: error,
    });
  }
};
const updateIssue = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const issueResult = await issueService.getSingleIssueFromDb(id as string);
    if (!issueResult) {
      return sendResponse(res, {
        statusCode: 404,
        success: false,
        message: "Issue not found",
      });
    }
    if (req.user.role === "contributor") {
      if (issueResult.reporter?.id !== req.user.id) {
        return sendResponse(res, {
          statusCode: 403,
          success: false,
          message: "You are not authorized",
        });
      }
      if (issueResult.status !== "open") {
        return sendResponse(res, {
          statusCode: 403,
          success: false,
          message: "You can only update open issues",
        });
      }
    }
    const updatedResult = await issueService.updateIssueFromDb(
      req.body,
      id as string
    );

    return sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Issue updated successfully",
      data: updatedResult.rows[0],
    });
  } catch (error: any) {
    return sendResponse(res, {
      statusCode: 500,
      success: false,
      message: error.message,
    });
  }
};

const getSingleIssue = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const issue = await issueService.getSingleIssueFromDb(id as string);

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: "Issue not found",
        data: {},
      });
    }

    res.status(200).json({
      success: true,
      message: "Issue retrieved successfully",
      data: issue,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
      error,
    });
  }
};
const getAllIssue = async (req: Request, res: Response) => {
  try {
    const result = await issueService.getAllIssueFromDb(req.query);

    res.status(200).json({
      success: true,
      message: "Issues retrieved successfully",
      data: result.rows,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
      error,
    });
  }
};
export const issueController = {
  createIssue,
  deleteIssue,
  updateIssue,
  getSingleIssue,
  getAllIssue,
};
