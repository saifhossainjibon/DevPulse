import type { Request, Response } from "express";
import { issueService } from "./issue.service";
import sendResponse from "../../utils/sendResponse";

const createIssue = async (req: Request, res: Response) => {
  try {
    // console.log("from controller",req.body)
    // const userId = (req as any).user.id; 
    const result = await issueService.createIssueIntoDb(req.body);
    sendResponse(res,{
      statusCode:200,
      success:true,
      message:"Issue created successfully",
      data:result,
    })
  } catch (error: any) {
    sendResponse(res,{
      statusCode:500,
      success:false,
      message:error.message,
      error: error,
    })
  }
};
const deleteIssue=async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await issueService.deleteIssueFromDb(id as string)
    if (result.rowCount === 0) {
      sendResponse(res,{
      statusCode:404,
      success:false,
      message:"issue not found",
    })
    }
        sendResponse(res,{
      statusCode:200,
      success:true,
      message:"Issue deleted successfully",
      data:result,
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
      error: error,
    });
  }
}
const updateIssue= async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await issueService.updateIssueFromDb(req.body, id as string)
    console.log(result);
    if (result.rows.length === 0) {
      sendResponse(res,{
      statusCode:404,
      success:false,
      message:"issue not found",
    })
    }
      sendResponse(res,{
      statusCode:200,
      success:true,
      message:"Issue retrived successfully",
      data:result.rows[0],
    })
  } catch (error: any) {
      sendResponse(res,{
      statusCode:500,
      success:false,
      message:"issue not found",
    })
  }
}
const getSingleIssue = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await issueService.getSingleIssueFromDb(id as string)
    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        massage: "issues not found",
        data: {},
      });
    }
    res.status(200).json({
      success: true,
      massage: "Single issue retrived successfully",
      data: result.rows[0],
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
      error: error,
    });
  }
}
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
  createIssue,deleteIssue,updateIssue,getSingleIssue,getAllIssue
};