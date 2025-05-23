import express, { Request, Response } from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import { createServer } from "http";
import { Server } from "socket.io";

const prisma = new PrismaClient();

const PORT = 3000;
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*",
    },
});

io.on("connection", async (socket) => {
    console.log(`NewClient Connected: ${socket.id}`);
    socket.on("disconnect", (reason) => {
        console.log(`Client Disconnected: ${socket.id}`);
    });
    const sensorData = await getSensorData();
    if (!sensorData.success) {
        socket.emit("sensorDataError", sensorData.message);
    } else {
        io.emit("prevData", sensorData.data);
    }
});

const getSensorData = async () => {
    try {
        const data = await prisma.sensorData.findMany({
            orderBy: {
                timestamp: "desc",
            },
        });
        return { success: true, data: data };
    } catch (error) {
        console.error("Error fetching IR data:", error);
        return {
            success: false,
            message: "Internal Server Error",
        };
    }
};

type ESPData = {
    flameRead: number;
    tempRead: number;
    humidity: number;
    gasRead: number;
};

app.post("/api/data", async (req: Request<{}, {}, ESPData>, res: Response) => {
    const data = req.body;
    const latestData = await prisma.sensorData.create({
        data: data,
    });
    io.emit("sensorData", latestData);
    res.status(201).json(latestData);
});

httpServer.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
