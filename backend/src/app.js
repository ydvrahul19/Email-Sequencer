import cors from "cors";
import path from "path";
import express from "express";
import sequenceRouter from "./routes/sequence.route.js";
import emailRouter from "./routes/emailRoutes.js";

const app = express();

app.use(
  cors({
    origin: process.env.ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);

app.set("trust proxy", 1);
app.use(express.static("public"));
app.use(express.json({ limit: "16kb" }));

// API Routes
app.use("/api/sequence", sequenceRouter);
app.use("/api/email", emailRouter);

const __dirname = path.resolve();

// Serve frontend static files in production
app.use(express.static(path.join(__dirname, "../frontend/dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
});

export { app };
