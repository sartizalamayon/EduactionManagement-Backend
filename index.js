const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({
    origin: ['*'],
    credentials: true
}));

app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.b6ckjyi.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

// Middleware for JWT
const verifyToken = (req, res, next) => {
    if (!req.headers.authorization) {
        return res.status(401).send('Access Denied');
    }
    const token = req.headers.authorization.split(' ')[1];
    if (!token) {
        return res.status(401).send('Access Denied');
    }

    jwt.verify(token, process.env.JWT_Secret, (err, decoded) => {
        if (err) {
            return res.status(401).send('Access Denied');
        }

        req.decoded = decoded;
        next();
    });
};

async function run() {
    try {
        const UserCollection = client.db("educational").collection("users");
        const SessionCollection = client.db("educational").collection("sessions");
        const CourseCollection = client.db("educational").collection("courses");
        const SectionCollection = client.db("educational").collection("sections");
        const MaterialCollection = client.db("educational").collection("materials");
        const EnrollmentCollection = client.db("educational").collection("enrollments");
        const AttendanceCollection = client.db("educational").collection("attendance");
        const GradeCollection = client.db("educational").collection("grades");
        const AnnouncementCollection = client.db("educational").collection("announcements");

        // GET Routes

        // Users
        app.get('/users', async (req, res) => {
            try {
                const users = await UserCollection.find().toArray();
                res.json(users);
            } catch (error) {
                res.status(500).json({ message: error.message });
            }
        });
        app.post('/users', async (req, res) => {
            try {
                const userData = req.body;
                
                // Add timestamps
                const user = {
                    ...userData,
                    created_at: new Date(),
                    updated_at: new Date()
                };
        
                const result = await UserCollection.insertOne(user);
                res.status(201).json(result);
            } catch (error) {
                res.status(500).json({ message: error.message });
            }
        });

        // Sessions
        app.get('/sessions', async (req, res) => {
            try {
                const sessions = await SessionCollection.find().toArray();
                res.json(sessions);
            } catch (error) {
                res.status(500).json({ message: error.message });
            }
        });

        // Courses
        app.get('/courses', async (req, res) => {
            try {
                const courses = await CourseCollection.find().toArray();
                res.json(courses);
            } catch (error) {
                res.status(500).json({ message: error.message });
            }
        });

        // Sections
        app.get('/sections', async (req, res) => {
            try {
                const sections = await SectionCollection.find().toArray();
                res.json(sections);
            } catch (error) {
                res.status(500).json({ message: error.message });
            }
        });

        app.post('/sessions', async (req, res) => {
            try {
                const session = {
                    ...req.body,
                    start_date: new Date(req.body.start_date),
                    end_date: new Date(req.body.end_date),
                    created_at: new Date()
                };
                const result = await SessionCollection.insertOne(session);
                res.json(result);
            } catch (error) {
                res.status(500).json({ message: error.message });
            }
        });

        // Materials
        app.get('/materials', async (req, res) => {
            try {
                const materials = await MaterialCollection.find().toArray();
                res.json(materials);
            } catch (error) {
                res.status(500).json({ message: error.message });
            }
        });

        // Enrollments
        app.get('/enrollments', async (req, res) => {
            try {
                const enrollments = await EnrollmentCollection.find().toArray();
                res.json(enrollments);
            } catch (error) {
                res.status(500).json({ message: error.message });
            }
        });

        // Attendance
        app.get('/attendance', async (req, res) => {
            try {
                const attendance = await AttendanceCollection.find().toArray();
                res.json(attendance);
            } catch (error) {
                res.status(500).json({ message: error.message });
            }
        });

        // Grades
        app.get('/grades', async (req, res) => {
            try {
                const grades = await GradeCollection.find().toArray();
                res.json(grades);
            } catch (error) {
                res.status(500).json({ message: error.message });
            }
        });

        // Announcements
        app.get('/announcements', async (req, res) => {
            try {
                const announcements = await AnnouncementCollection.find().toArray();
                res.json(announcements);
            } catch (error) {
                res.status(500).json({ message: error.message });
            }
        });

        console.log("Successfully connected to MongoDB!");
    } finally {
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hello from Educational Institution Management System!');
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});