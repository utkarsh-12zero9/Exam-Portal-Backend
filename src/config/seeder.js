import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Course from '../models/Course.js';
import Module from '../models/Module.js';
import Question from '../models/Question.js';
import Enrollment from '../models/Enrollment.js';

dotenv.config();

const usersData = [
  { id: 1, name: 'Admin User', email: 'admin@test.com', password: 'admin123', role: 'admin', phone: '+91 9876543210', bio: 'System Administrator', createdAt: '2024-01-01T00:00:00.000Z' },
  { id: 2, name: 'Jiya Sharma', email: 'jiya@test.com', password: 'jiya123', role: 'user', phone: '+91 9876543211', bio: 'Computer Science Student', createdAt: '2024-01-15T00:00:00.000Z' },
  { id: 3, name: 'Jane Smith', email: 'jane@test.com', password: 'test123', role: 'user', phone: '+91 9876543212', bio: 'Engineering Student', createdAt: '2024-02-01T00:00:00.000Z' },
  { id: 4, name: 'Sunny Deol', email: 'sunny@test.com', password: 'test123', role: 'user', phone: '+91 9876543201', bio: 'Actor and Filmmaker', createdAt: '2025-11-12T00:00:00.000Z' },
  { id: 5, name: 'Dirrector Karan', email: 'd@test.com', password: 'd123456', role: 'admin', phone: '+91 8886543210', bio: 'Director and Producer', createdAt: '2025-10-11T00:00:00.000Z' }
];

const coursesData = [
  { id: 1, title: 'React Fundamentals', description: 'Master the basics of React including components, hooks, and state management', domain: 'Web Development', difficulty: 'easy', duration: 90, price: 0, tags: ['React', 'JavaScript', 'Frontend'], attemptLimit: 3, isProctoringEnabled: true, isActive: true },
  { id: 2, title: 'Advanced JavaScript', description: 'Deep dive into closures, prototypes, async programming, and ES6+ features', domain: 'Programming', difficulty: 'medium', duration: 120, price: 499, tags: ['JavaScript', 'ES6', 'Advanced'], attemptLimit: 2, isProctoringEnabled: true, isActive: true },
  { id: 3, title: 'Data Structures & Algorithms', description: 'Learn essential DSA concepts with practical coding problems', domain: 'Computer Science', difficulty: 'hard', duration: 150, price: 999, tags: ['DSA', 'Algorithms', 'Coding'], attemptLimit: 1, isProctoringEnabled: true, isActive: true }
];

const modulesData = [
  { id: 1, courseId: 1, title: 'Introduction to React', order: 1, description: 'Understand React basics and JSX' },
  { id: 2, courseId: 1, title: 'React Hooks', order: 2, description: 'Master useState, useEffect, and custom hooks' },
  { id: 3, courseId: 1, title: 'State Management', order: 3, description: 'Learn Redux and Context API' },
  { id: 4, courseId: 2, title: 'Closures & Scope', order: 1, description: 'Deep understanding of JavaScript closures' },
  { id: 5, courseId: 2, title: 'Async Programming', order: 2, description: 'Promises, async/await, and event loop' }
];

const questionsData = [
  { id: 1, moduleId: 1, type: 'mcq', question: 'What is JSX?', options: ['JavaScript XML', 'Java Syntax Extension', 'JavaScript Extension', 'None of the above'], correctAnswer: 'JavaScript XML', marks: 1, difficulty: 'easy' },
  { id: 2, moduleId: 1, type: 'mcq', question: 'What is the Virtual DOM?', options: ['A copy of the real DOM', 'A JavaScript representation of the DOM', 'A database', 'None of the above'], correctAnswer: 'A JavaScript representation of the DOM', marks: 1, difficulty: 'medium' },
  { id: 3, moduleId: 1, type: 'mcq', question: 'Which hook is used for side effects in React?', options: ['useState', 'useEffect', 'useContext', 'useReducer'], correctAnswer: 'useEffect', marks: 1, difficulty: 'easy' },
  { id: 4, moduleId: 2, type: 'mcq', question: 'Which hook is used for side effects in React?', options: ['useState', 'useEffect', 'useContext', 'useReducer'], correctAnswer: 'useEffect', marks: 2, difficulty: 'easy' },
  { id: 5, moduleId: 2, type: 'mcq', question: 'Which hook is used for navigation in React?', options: ['useNavigate', 'useEffect', 'useContext', 'useReducer'], correctAnswer: 'useNavigate', marks: 2, difficulty: 'easy' },
  { id: 6, moduleId: 3, type: 'mcq', question: 'Which hook is used for state management in React?', options: ['useState', 'useEffect', 'useContext', 'useReducer'], correctAnswer: 'useReducer', marks: 3, difficulty: 'easy' }
];

const enrollmentsData = [
  {
    id: 1,
    userId: 2, // Jiya Sharma
    courseId: 1, // React Fundamentals
    enrolledAt: '2024-11-01T10:00:00.000Z',
    attempts: [
      {
        attemptId: '1001',
        startedAt: '2024-11-01T11:00:00.000Z',
        submittedAt: '2024-11-01T11:45:00.000Z',
        status: 'completed',
        score: 8,
        totalMarks: 10,
        percentage: 80,
        totalQuestions: 10,
        answeredQuestions: 10,
        answers: {},
        violationCount: 2,
        autoSubmitted: false,
        violations: [
          { type: 'tab_switch', description: 'Switched to another tab or window', timestamp: '2024-11-01T11:15:00.000Z' },
          { type: 'fullscreen_exit', description: 'Exited fullscreen mode', timestamp: '2024-11-01T11:20:00.000Z' }
        ]
      }
    ]
  },
  {
    id: 2,
    userId: 2, // Jiya Sharma
    courseId: 2, // Advanced JS
    enrolledAt: '2024-11-10T09:00:00.000Z',
    attempts: [
      {
        attemptId: '2001',
        startedAt: '2024-11-10T10:00:00.000Z',
        submittedAt: '2024-11-10T10:45:00.000Z',
        status: 'completed',
        score: 7,
        totalMarks: 10,
        percentage: 70,
        totalQuestions: 10,
        answeredQuestions: 9,
        answers: {}
      }
    ]
  },
  {
    id: 3,
    userId: 3, // Jane Smith
    courseId: 1, // React Fundamentals
    enrolledAt: '2024-11-08T12:00:00.000Z',
    attempts: [
      {
        attemptId: '3001',
        startedAt: '2024-11-08T13:00:00.000Z',
        submittedAt: '2024-11-08T13:40:00.000Z',
        status: 'completed',
        score: 6,
        totalMarks: 10,
        percentage: 60,
        totalQuestions: 10,
        answeredQuestions: 10,
        answers: {}
      }
    ]
  }
];

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI environment variable is not defined in .env');
    }

    console.log('📡 Connecting to MongoDB for seeding...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB Successfully!');

    // 1. Clear database
    console.log('🧹 Clearing existing database collections...');
    await User.deleteMany({});
    await Course.deleteMany({});
    await Module.deleteMany({});
    await Question.deleteMany({});
    await Enrollment.deleteMany({});
    console.log('✅ Collections cleared!');

    // 2. Insert Users
    console.log('👤 Seeding Users...');
    // We insert users one by one to ensure pre-save password hashing is executed
    const createdUsers = [];
    for (const u of usersData) {
      const userDoc = new User({
        name: u.name,
        email: u.email,
        password: u.password,
        role: u.role,
        phone: u.phone,
        bio: u.bio,
        createdAt: new Date(u.createdAt)
      });
      await userDoc.save();
      createdUsers.push(userDoc);
    }
    console.log(`✅ ${createdUsers.length} Users seeded successfully!`);

    // Create User mapping
    const userMap = {};
    usersData.forEach((u) => {
      const createdUser = createdUsers.find(item => item.email === u.email);
      if (createdUser) {
        userMap[u.id] = createdUser._id;
      }
    });

    // 3. Insert Courses
    console.log('📚 Seeding Courses...');
    const createdCourses = await Course.insertMany(
      coursesData.map(c => ({
        title: c.title,
        description: c.description,
        domain: c.domain,
        difficulty: c.difficulty,
        duration: c.duration,
        price: c.price,
        tags: c.tags,
        attemptLimit: c.attemptLimit,
        isProctoringEnabled: c.isProctoringEnabled,
        isActive: c.isActive
      }))
    );
    console.log(`✅ ${createdCourses.length} Courses seeded successfully!`);

    // Create Course mapping
    const courseMap = {};
    coursesData.forEach((c) => {
      const createdCourse = createdCourses.find(item => item.title === c.title);
      if (createdCourse) {
        courseMap[c.id] = createdCourse._id;
      }
    });

    // 4. Insert Modules
    console.log('⚙️ Seeding Modules...');
    const createdModules = await Module.insertMany(
      modulesData.map(m => ({
        courseId: courseMap[m.courseId],
        title: m.title,
        order: m.order,
        description: m.description
      }))
    );
    console.log(`✅ ${createdModules.length} Modules seeded successfully!`);

    // Create Module mapping
    const moduleMap = {};
    modulesData.forEach((m) => {
      const createdModule = createdModules.find(item => item.title === m.title && item.courseId.toString() === courseMap[m.courseId].toString());
      if (createdModule) {
        moduleMap[m.id] = createdModule._id;
      }
    });

    // 5. Insert Questions
    console.log('❓ Seeding Questions...');
    const createdQuestions = await Question.insertMany(
      questionsData.map(q => ({
        moduleId: moduleMap[q.moduleId],
        type: q.type,
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        marks: q.marks,
        difficulty: q.difficulty
      }))
    );
    console.log(`✅ ${createdQuestions.length} Questions seeded successfully!`);

    // Create Question mapping for references if any
    const questionMap = {};
    questionsData.forEach((q) => {
      const createdQuestion = createdQuestions.find(item => item.question === q.question && item.moduleId.toString() === moduleMap[q.moduleId].toString());
      if (createdQuestion) {
        questionMap[q.id] = createdQuestion._id;
      }
    });

    // 6. Insert Enrollments
    console.log('🎫 Seeding Enrollments & Attempts...');
    
    const formattedEnrollments = enrollmentsData.map((e) => {
      // Format attempts to resolve user/course/question IDs if necessary
      const formattedAttempts = e.attempts.map((att) => {
        // Resolve questions in answers map if they exist (they are empty in our fixtures, but good safety)
        const resolvedAnswers = {};
        if (att.answers) {
          Object.keys(att.answers).forEach((k) => {
            const mappedQKey = questionMap[k] ? questionMap[k].toString() : k;
            resolvedAnswers[mappedQKey] = att.answers[k];
          });
        }

        return {
          attemptId: att.attemptId,
          startedAt: new Date(att.startedAt),
          submittedAt: att.submittedAt ? new Date(att.submittedAt) : undefined,
          status: att.status,
          score: att.score,
          totalMarks: att.totalMarks,
          percentage: att.percentage,
          totalQuestions: att.totalQuestions,
          answeredQuestions: att.answeredQuestions,
          answers: resolvedAnswers,
          violations: att.violations || [],
          violationCount: att.violationCount || 0,
          autoSubmitted: att.autoSubmitted || false,
          submissionReason: att.submissionReason
        };
      });

      return {
        userId: userMap[e.userId],
        courseId: courseMap[e.courseId],
        enrolledAt: new Date(e.enrolledAt),
        attempts: formattedAttempts
      };
    });

    const createdEnrollments = await Enrollment.insertMany(formattedEnrollments);
    console.log(`✅ ${createdEnrollments.length} Enrollments & attempting logs seeded successfully!`);

    console.log('🎉 Seeding Completed Successfully! Database is now ready for frontend hook-up.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding Failed:', error.message);
    process.exit(1);
  }
};

seedDatabase();
