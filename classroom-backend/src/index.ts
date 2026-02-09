import express from 'express';
import cors from "cors";
import { resolve } from "path";
import * as dotenv from "dotenv";
import { db, schema } from './db/index';
import subjectsRouter from "./routes/subjects";

const app = express();
const PORT = 8000;

dotenv.config({ path: resolve(process.cwd(), "src", ".env") });

if (!process.env.FRONTEND_URL)
    console.error("Couldn't find FRONTEND_URL in .env");

console.log("FRONTEND_URL fetched successfully!");

if (/^https?:\/\/([a-zA-Z0-9.-]+)(:[0-9]+)?$/.test(process.env.FRONTEND_URL as string))
    app.use(cors({
        origin: process.env.FRONTEND_URL,
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true
    }));
else console.warn("FRONTEND_URL doesn't satisfy the condition");

app.use(express.json());
// console.log('Database and schema imported:', db, schema);

// Middleware to log requests
app.use((req, res, next) => {
    console.log(`${new Date().toUTCString()} | ${req.method} from ${req.url}`);
    next();
})

app.get('/', (req, res) => {
    res.status(201).send('Hello, World!');
});

app.use('/api/subjects', subjectsRouter);

app.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
});