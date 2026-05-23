import express, {
  type Application,
  type Request,
  type Response,
} from "express";
import { userRoute } from "./modules/user/user.route";
import { authRoute } from "./modules/auth/auth.route";
import { issueRoute } from "./modules/issue/issue.route";
import globalErrorHandler from "./middleware/globalErrorHandler";

const app: Application = express();
app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({ 
    massage: "Express Server",
    author: "DevPluse",
  });
});
app.use('/api/auth/signup', userRoute)
app.use('/api/auth/login', authRoute)
app.use('/api/issues', issueRoute)

app.use(globalErrorHandler);
export default app