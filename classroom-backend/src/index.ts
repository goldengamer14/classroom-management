import express from 'express';
import { db, schema } from './db/index';

const app = express();
const PORT = 8000;

const router = express.Router();

app.use(express.json());
console.log('Database and schema imported:', db, schema);

// Middleware to log requests
app.use((req, res, next) => {
    console.log(`${new Date().toUTCString()} | ${req.method} from ${req.url}`);
    next();
})

router.get('/', (req, res) => {
    res.send('Hello, World!');
});

app.use('/', router);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

export default router;