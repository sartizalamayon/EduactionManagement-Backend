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
        const StudentCollection = client.db("educational").collection("students");
        const FacultyCollection = client.db("educational").collection("faculty");
        const AdminCollection = client.db("educational").collection("admin");

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

        app.get('/users/:email', async (req, res) => {
            try {
                const email = req.params.email;
                const user = await UserCollection
                    .findOne({ email: email });
            
                if (!user) {
                    return res.status(404).json({ message: "User not found" });
                }

                res.json(user);
            } catch (error) {
                res.status(500).json({ message: error.message });
            }
        }
        );

        // Students
        // Add these routes inside your run() function after declaring StudentCollection

// Get all students
app.get('/students', async (req, res) => {
    try {
        const students = await StudentCollection.find().toArray();
        res.json(students);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get student by email
app.get('/students/:email', async (req, res) => {
    try {
        const email = req.params.email;
        const student = await StudentCollection.findOne({ "personalInfo.email": email });
        
        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }
        
        res.json(student);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create a new student
app.post('/students', async (req, res) => {
    try {
        // First check if this student exists in Users collection
        const userExists = await UserCollection.findOne({ 
            email: req.body.personalInfo.email,
            role: "Student"
        });

        if (!userExists) {
            return res.status(404).json({ message: "User must first exist in Users collection with Student role" });
        }

        // Check if student already exists
        const studentExists = await StudentCollection.findOne({
            "personalInfo.email": req.body.personalInfo.email
        });

        if (studentExists) {
            return res.status(409).json({ message: "Student already exists" });
        }

        const result = await StudentCollection.insertOne(req.body);
        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// Get all faculty members
app.get('/faculty', async (req, res) => {
    try {
        const faculty = await FacultyCollection.find().toArray();
        res.json(faculty);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get faculty by email
app.get('/faculty/:email', async (req, res) => {
    try {
        const email = req.params.email;
        const faculty = await FacultyCollection.findOne({ "personalInfo.email": email });
        
        if (!faculty) {
            return res.status(404).json({ message: "Faculty member not found" });
        }
        
        res.json(faculty);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create a new faculty record
app.post('/faculty', async (req, res) => {
    try {
        // Check if user exists in Users collection with Faculty role
        const userExists = await UserCollection.findOne({ 
            email: req.body.personalInfo.email,
            role: "Faculty"
        });

        if (!userExists) {
            return res.status(404).json({ 
                message: "User must first exist in Users collection with Faculty role" 
            });
        }

        // Check if faculty record already exists
        const facultyExists = await FacultyCollection.findOne({
            "personalInfo.email": req.body.personalInfo.email
        });

        if (facultyExists) {
            return res.status(409).json({ message: "Faculty record already exists" });
        }

        const result = await FacultyCollection.insertOne(req.body);
        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get all admins
app.get('/admin', async (req, res) => {
    try {
        const admins = await AdminCollection.find().toArray();
        res.json(admins);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get admin by email
app.get('/admin/:email', async (req, res) => {
    try {
        const email = req.params.email;
        const admin = await AdminCollection.findOne({ "personalInfo.email": email });
        
        if (!admin) {
            return res.status(404).json({ message: "Admin not found" });
        }
        
        res.json(admin);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create a new admin record
app.post('/admin', async (req, res) => {
    try {
        // Check if user exists in Users collection with Admin role
        const userExists = await UserCollection.findOne({ 
            email: req.body.personalInfo.email,
            role: "Admin"
        });

        if (!userExists) {
            return res.status(404).json({ 
                message: "User must first exist in Users collection with Admin role" 
            });
        }

        // Check if admin record already exists
        const adminExists = await AdminCollection.findOne({
            "personalInfo.email": req.body.personalInfo.email
        });

        if (adminExists) {
            return res.status(409).json({ message: "Admin record already exists" });
        }

        // Add timestamp to activities
        const adminData = {
            ...req.body,
            recentActivities: req.body.recentActivities.map(activity => ({
                action: activity,
                timestamp: new Date()
            }))
        };

        const result = await AdminCollection.insertOne(adminData);
        res.status(201).json(result);
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