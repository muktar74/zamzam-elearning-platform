# Zamzam Bank E-Learning Platform

![Zamzam Bank E-Learning](https://i.imgur.com/K5d9lYy.png)

An internal e-learning website for Zamzam Bank, designed to deliver short, targeted training on different issues regarding Islamic Finance Banking (IFB). The platform allows employees to take courses, complete quizzes, and generate certificates, while administrators can manage all course content and user progress. The application is enhanced with Google's Gemini AI for content generation, analysis, and a helpful AI assistant.

**This version is fully integrated with Supabase for authentication, database, and storage.**

---

## ✨ Key Features

### For Employees (Learners)
- **Personalized Dashboard**: View progress, recently viewed courses, points, and earned badges at a glance.
- **Course Catalog**: Browse, search, and filter all available courses by category and status (All, In Progress, Completed).
- **Interactive Course View**: Engage with course content module by module, including HTML-formatted lessons and embedded video content.
- **Quizzes & Assessments**: Test knowledge with final quizzes. A minimum passing score is required to complete the course.
- **Certificate Generation**: Instantly generate and download a professional Certificate of Completion in PDF, PNG, or JPG format after successfully passing a course.
- **Gamification**: Earn points for completing modules and courses. Unlock badges for achieving milestones (e.g., 'First Course', 'Quiz Master').
- **Leaderboard**: See how you rank against your peers based on points earned.
- **Discussion Forums**: Engage in discussions with colleagues on a per-course basis.
- **Course Reviews**: Rate and review courses to provide feedback.
- **AI Personal Assistant**: Get instant answers to questions about Islamic Finance or specific course content from a Gemini-powered chatbot.
- **Profile Management**: Update your name, email, and profile picture.

### For Administrators
- **Comprehensive Admin Dashboard**: A centralized hub for managing all aspects of the platform.
- **Course Management (CRUD)**: Create, read, update, and delete courses.
- **Flexible Content Creation**: Add modules as either rich text/HTML or as embedded videos.
- **Course Configuration**: Set a unique category and a minimum passing score for each course quiz.
- **AI-Powered Content Generation**: Use the Gemini API to automatically generate content in two ways:
    - **From a Title**: Provide a course title, and the AI generates a relevant description, modules, and a quiz.
    - **From a Textbook (PDF)**: Upload a PDF document, and the AI reads and analyzes it to create a complete, structured course with description, modules, and a quiz automatically.
- **User Management (CRUD)**: Manage employee accounts, approve new registrations, and edit user details.
- **Resource Library Management**: Add, edit, and delete curated external resources (articles, books, videos).
- **Platform Analytics**: View key statistics like total users, courses, and completions.
- **AI-Powered Discussion Analysis**: Use Gemini to analyze all course discussions and extract key topics and trends.
- **Report Generation**: Download platform data as CSV files for:
    - User Registrations
    - Course Completions
    - Overall Course Performance
- **Notification System**: Broadcast custom messages to all employees or send targeted notifications to individuals. Features **real-time delivery**.

---

## 🛠️ Technology Stack

- **Frontend**: React, TypeScript
- **Styling**: Tailwind CSS
- **Backend & Database**: **Supabase** (PostgreSQL, Auth, Storage)
- **AI Integration