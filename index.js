require("dotenv").config({ override: true });
const cors = require("cors");
const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");

const userRouter = require("./routes/user");
const authRouter = require("./routes/auth");
const taskRouter = require("./routes/task");
const notificationRouter = require("./routes/notification");
const projectRouter = require("./routes/project");
const { checkForAuthenticationCookie } = require("./middlewares/authentication");

const app = express();
const server = createServer(app);

// ── Dynamic CORS Configuration ────────────────────────────────────────────────
const defaultDevOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
];

const envClientUrl = process.env.CLIENT_URL ? [process.env.CLIENT_URL.trim()] : [];
const envCorsOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(",").map((o) => o.trim()).filter(Boolean)
  : [];

const allowedOrigins = Array.from(
  new Set([...defaultDevOrigins, ...envClientUrl, ...envCorsOrigins])
);

const checkCorsOrigin = (origin, callback) => {
  // Allow requests with no origin (mobile apps, Postman, curl, server-to-server)
  if (!origin || allowedOrigins.includes(origin)) {
    return callback(null, true);
  }
  console.warn(`[CORS Blocked] Origin not allowed: ${origin}`);
  return callback(new Error("Not allowed by CORS"));
};

// ── Initialize Socket.IO with dynamic CORS ──────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: checkCorsOrigin,
    credentials: true,
  },
});

module.exports = { io };

// ── Database Connection ─────────────────────────────────────────────────────
const PORT = process.env.PORT || 8000;

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection error:", err));

// ── Express Middlewares ─────────────────────────────────────────────────────
app.use(
  cors({
    origin: checkCorsOrigin,
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// ── API Routes ───────────────────────────────────────────────────────────────
app.use("/auth", authRouter);
app.use(checkForAuthenticationCookie("token"));
app.use("/user", userRouter);
app.use("/project", projectRouter);
app.use("/task", taskRouter);
app.use("/notification", notificationRouter);

// ── Socket.IO Event Handlers ──────────────────────────────────────────────────
const Message = require("./models/message");
const Project = require("./models/project");
const { pushNotification } = require("./services/notify");
const { verifyToken } = require("./services/authentication");

io.use((socket, next) => {
  const authToken = socket.handshake.auth.token;
  const cookieHeader = socket.handshake.headers.cookie || "";
  const cookies = Object.fromEntries(
    cookieHeader
      .split(";")
      .map((c) => c.trim())
      .filter(Boolean)
      .map((c) => {
        const [name, ...rest] = c.split("=");
        return [name, rest.join("=")];
      })
  );

  const token = authToken || cookies.token;
  if (!token) {
    return next(new Error("Authentication error"));
  }

  try {
    const user = verifyToken(token);
    if (!user) {
      return next(new Error("Authentication error"));
    }
    socket.user = user;
    next();
  } catch (err) {
    console.error("Socket auth error:", err);
    next(new Error("Authentication error"));
  }
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.user._id);
  socket.join(`user-${socket.user._id}`);

  socket.on("join-project", (projectId) => {
    socket.join(`project-${projectId}`);
    console.log(`User ${socket.user._id} joined project ${projectId}`);
  });

  socket.on("leave-project", (projectId) => {
    socket.leave(`project-${projectId}`);
    console.log(`User ${socket.user._id} left project ${projectId}`);
  });

  socket.on("sendMessage", async ({ projectId, text }) => {
    if (!projectId || !text?.trim()) {
      return;
    }

    try {
      const message = await Message.create({
        sender: socket.user._id,
        project: projectId,
        text: text.trim(),
      });

      const payload = {
        id: message._id,
        sender: message.sender,
        senderName: socket.user.fullName || socket.user.name || "Unknown",
        text: message.text,
        timestamp: message.timestamp,
      };

      io.to(`project-${projectId}`).emit("newMessage", payload);

      // Notify other project members about new message
      const project = await Project.findById(projectId).lean();
      if (project) {
        const memberIds = [
          project.createdBy?.toString?.(),
          ...(project.members || []).map((m) => m.user?.toString?.()),
        ]
          .filter(Boolean)
          .filter((uid) => uid !== socket.user._id.toString());

        const uniqueTargets = [...new Set(memberIds)];
        await Promise.all(
          uniqueTargets.map((uid) =>
            pushNotification(uid, {
              type: "chat",
              title: project.title || "Project message",
              message: `${payload.senderName}: ${payload.text.substring(0, 120)}`,
              link: `/workspace/${projectId}`,
              meta: { projectId },
            }).catch(() => {})
          )
        );
      }
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.user._id);
  });
});

// ── Start Server ─────────────────────────────────────────────────────────────
server.listen(PORT, async () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port: ${PORT}`);
});
