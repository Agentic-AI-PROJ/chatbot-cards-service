import dotenv from "dotenv";
dotenv.config();

import express, { type Request, type Response } from "express";
import connectDB from "./config/db.js";
import chatbotCardsRoutes from "./routes/chatbot-cards.routes.js";
import logger from "./utils/logger.js";
import { loggingMiddleware } from "./middleware/loggingMiddleware.js";
import conversationCardsRoutes from "./routes/conversation-cards.routes.js";

connectDB();

const app = express();
const PORT = process.env.PORT || 3004;

app.use(loggingMiddleware);
app.use(express.json());

app.get("/health", (req: Request, res: Response) => {
    res.send("RUNNING");
});
app.get("/db-health", async (req: Request, res: Response) => {
    try {
        await connectDB();
        res.send("RUNNING");
    } catch (error) {
        console.error(error);
        res.status(500).send("Database connection failed");
    }
});

// User routes
app.use("/", chatbotCardsRoutes);
app.use("/conversation", conversationCardsRoutes);

app.listen(PORT, () => {
    logger.info(`chatbot-cards-service server running at http://localhost:${PORT}`);
    logger.info(`Environment: ${process.env.NODE_ENV}`);
});