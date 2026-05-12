import fs from 'fs';
import path from 'path';
import { v4 as uuid } from 'uuid';
import bcrypt from 'bcrypt';

async function main() {
  const now = () => new Date().toISOString().slice(0, 19).replace('T', ' ');

  const adminPassword = bcrypt.hashSync('Admin@123', 10);
  const instructorPassword = bcrypt.hashSync('Instructor@123', 10);
  const studentPassword = bcrypt.hashSync('Student@123', 10);

  // =========================
  // USERS
  // =========================
  const adminId = uuid();
  const instructorId = uuid();
  const studentId = uuid();

  // =========================
  // TRACK
  // =========================
  const trackId = uuid();

  // =========================
  // MODULES
  // =========================
  const module1Id = uuid();
  const module2Id = uuid();

  // =========================
  // TRAININGS
  // =========================
  const training1Id = uuid();
  const training2Id = uuid();
  const training3Id = uuid();

  // =========================
  // QUIZ
  // =========================
  const quizId = uuid();

  // =========================
  // QUESTIONS
  // =========================
  const question1Id = uuid();
  const question2Id = uuid();

  // =========================
  // OPTIONS
  // =========================
  const option1Id = uuid();
  const option2Id = uuid();
  const option3Id = uuid();
  const option4Id = uuid();

  const sql = `
CREATE DATABASE IF NOT EXISTS training_platform;
USE training_platform;

-- =====================================
-- USERS
-- =====================================
INSERT INTO \`User\` (
  id,
  name,
  email,
  password,
  role,
  createdAt,
  isBlocked
)
VALUES
(
  '${adminId}',
  'System Admin',
  'admin@training.com',
  '${adminPassword}',
  'ADMIN',
  '${now()}',
  false
),
(
  '${instructorId}',
  'John Instructor',
  'instructor@training.com',
  '${instructorPassword}',
  'INSTRUCTOR',
  '${now()}',
  false
),
(
  '${studentId}',
  'Jane Student',
  'student@training.com',
  '${studentPassword}',
  'USER',
  '${now()}',
  false
);

-- =====================================
-- TRACK
-- =====================================
INSERT INTO \`Track\` (
  id,
  title,
  description,
  createdAt
)
VALUES
(
  '${trackId}',
  'Node.js Backend Formation',
  'Complete backend learning track using Node.js, Prisma and MySQL.',
  '${now()}'
);

-- =====================================
-- MODULES
-- =====================================
INSERT INTO \`Module\` (
  id,
  trackId,
  title,
  description,
  position,
  createdAt
)
VALUES
(
  '${module1Id}',
  '${trackId}',
  'Introduction',
  'Introduction module',
  1,
  '${now()}'
),
(
  '${module2Id}',
  '${trackId}',
  'Advanced Backend',
  'Advanced backend concepts',
  2,
  '${now()}'
);

-- =====================================
-- TRAININGS
-- =====================================
INSERT INTO \`Training\` (
  id,
  title,
  description,
  content,
  createdAt,
  updatedAt
)
VALUES
(
  '${training1Id}',
  'What is Node.js?',
  'Introduction to Node.js',
  '<h1>Node.js</h1><p>Node.js is a JavaScript runtime.</p>',
  '${now()}',
  '${now()}'
),
(
  '${training2Id}',
  'Prisma ORM',
  'Learning Prisma ORM',
  '<h1>Prisma</h1><p>Prisma is a modern ORM.</p>',
  '${now()}',
  '${now()}'
),
(
  '${training3Id}',
  'Authentication with JWT',
  'JWT authentication training',
  '<h1>JWT</h1><p>Authentication using JWT.</p>',
  '${now()}',
  '${now()}'
);

-- =====================================
-- MODULE TRAININGS
-- =====================================
INSERT INTO \`ModuleTraining\` (
  moduleId,
  trainingId,
  position
)
VALUES
(
  '${module1Id}',
  '${training1Id}',
  1
),
(
  '${module1Id}',
  '${training2Id}',
  2
),
(
  '${module2Id}',
  '${training3Id}',
  1
);

-- =====================================
-- QUIZ
-- =====================================
INSERT INTO \`Quiz\` (
  id,
  title,
  description,
  createdAt
)
VALUES
(
  '${quizId}',
  'Node.js Quiz',
  'Basic Node.js quiz',
  '${now()}'
);

-- =====================================
-- MODULE QUIZ
-- =====================================
INSERT INTO \`ModuleQuiz\` (
  moduleId,
  quizId,
  position
)
VALUES
(
  '${module1Id}',
  '${quizId}',
  1
);

-- =====================================
-- QUESTIONS
-- =====================================
INSERT INTO \`Question\` (
  id,
  quizId,
  content,
  type
)
VALUES
(
  '${question1Id}',
  '${quizId}',
  'What is Node.js?',
  'SINGLE_CHOICE'
),
(
  '${question2Id}',
  '${quizId}',
  'Prisma is an ORM?',
  'TRUE_FALSE'
);

-- =====================================
-- OPTIONS
-- =====================================
INSERT INTO \`Option\` (
  id,
  questionId,
  content,
  isCorrect
)
VALUES
(
  '${option1Id}',
  '${question1Id}',
  'JavaScript Runtime',
  true
),
(
  '${option2Id}',
  '${question1Id}',
  'Database Engine',
  false
),
(
  '${option3Id}',
  '${question2Id}',
  'True',
  true
),
(
  '${option4Id}',
  '${question2Id}',
  'False',
  false
);

-- =====================================
-- USER TRACK
-- =====================================
INSERT INTO \`UserTrack\` (
  id,
  userId,
  trackId,
  role,
  status
)
VALUES
(
  '${uuid()}',
  '${studentId}',
  '${trackId}',
  'STUDENT',
  'IN_PROGRESS'
),
(
  '${uuid()}',
  '${instructorId}',
  '${trackId}',
  'INSTRUCTOR',
  'COMPLETED'
);

-- =====================================
-- USER TRAINING
-- =====================================
INSERT INTO \`UserTraining\` (
  id,
  userId,
  trainingId,
  role,
  status,
  startedAt,
  completedAt
)
VALUES
(
  '${uuid()}',
  '${studentId}',
  '${training1Id}',
  'STUDENT',
  'IN_PROGRESS',
  '${now()}',
  NULL
);

-- =====================================
-- QUIZ ATTEMPT
-- =====================================
INSERT INTO \`QuizAttempt\` (
  id,
  userId,
  quizId,
  score,
  passed,
  completedAt,
  createdAt
)
VALUES
(
  '${uuid()}',
  '${studentId}',
  '${quizId}',
  85,
  true,
  '${now()}',
  '${now()}'
);
`;

  const outputDir = path.resolve(__dirname, '../generated');

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, 'seed.sql');

  fs.writeFileSync(outputPath, sql);

  console.log('=====================================');
  console.log('SQL seed generated successfully');
  console.log(outputPath);
  console.log('=====================================');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
