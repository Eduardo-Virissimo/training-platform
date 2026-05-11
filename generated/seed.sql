
CREATE DATABASE IF NOT EXISTS training_platform;
USE training_platform;

-- =====================================
-- USERS
-- =====================================
INSERT INTO `User` (
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
  'cb21d84d-63d0-466d-a005-2fd4844b5678',
  'System Admin',
  'admin@training.com',
  '$2b$10$qHfwBwSqkt/eYlE5cPN82epU5xnKaZZjENEUkNRCDaS/FoYjeWaSC',
  'ADMIN',
  '2026-05-11 12:19:05',
  false
),
(
  '3260dab7-3e12-43b7-8f29-76a3e8a05322',
  'John Instructor',
  'instructor@training.com',
  '$2b$10$WWXkhXwlf0kFDkfI1ifj3eFd4xADf8CA5dDOquctCpHT1IEWC9j0O',
  'INSTRUCTOR',
  '2026-05-11 12:19:05',
  false
),
(
  'a7892aa7-7ec0-4fe8-af3a-ef5a88fd1eb8',
  'Jane Student',
  'student@training.com',
  '$2b$10$cApoF4whXBmbKNvyQAy3me1IQlgdS8JE4zuXpGqhn9okQ.22faD0C',
  'USER',
  '2026-05-11 12:19:05',
  false
);

-- =====================================
-- TRACK
-- =====================================
INSERT INTO `Track` (
  id,
  title,
  description,
  createdAt
)
VALUES
(
  '4d7c8f46-8f92-4c10-ac86-2b7fb596c742',
  'Node.js Backend Formation',
  'Complete backend learning track using Node.js, Prisma and MySQL.',
  '2026-05-11 12:19:05'
);

-- =====================================
-- MODULES
-- =====================================
INSERT INTO `Module` (
  id,
  trackId,
  title,
  description,
  position,
  createdAt
)
VALUES
(
  '5d0c5dc7-fad9-4e5a-9876-048bebccbdeb',
  '4d7c8f46-8f92-4c10-ac86-2b7fb596c742',
  'Introduction',
  'Introduction module',
  1,
  '2026-05-11 12:19:05'
),
(
  'dd894254-536a-49cd-874b-e8586d6a50e5',
  '4d7c8f46-8f92-4c10-ac86-2b7fb596c742',
  'Advanced Backend',
  'Advanced backend concepts',
  2,
  '2026-05-11 12:19:05'
);

-- =====================================
-- TRAININGS
-- =====================================
INSERT INTO `Training` (
  id,
  title,
  description,
  content,
  createdAt,
  updatedAt
)
VALUES
(
  'abcd2b7a-515b-4139-8d00-055a5499aaf4',
  'What is Node.js?',
  'Introduction to Node.js',
  '<h1>Node.js</h1><p>Node.js is a JavaScript runtime.</p>',
  '2026-05-11 12:19:05',
  '2026-05-11 12:19:05'
),
(
  '0a141c2c-b47d-4c9d-9419-82445d363917',
  'Prisma ORM',
  'Learning Prisma ORM',
  '<h1>Prisma</h1><p>Prisma is a modern ORM.</p>',
  '2026-05-11 12:19:05',
  '2026-05-11 12:19:05'
),
(
  '7ee2fda6-4b75-4a7b-8676-937010855304',
  'Authentication with JWT',
  'JWT authentication training',
  '<h1>JWT</h1><p>Authentication using JWT.</p>',
  '2026-05-11 12:19:05',
  '2026-05-11 12:19:05'
);

-- =====================================
-- MODULE TRAININGS
-- =====================================
INSERT INTO `ModuleTraining` (
  moduleId,
  trainingId,
  position
)
VALUES
(
  '5d0c5dc7-fad9-4e5a-9876-048bebccbdeb',
  'abcd2b7a-515b-4139-8d00-055a5499aaf4',
  1
),
(
  '5d0c5dc7-fad9-4e5a-9876-048bebccbdeb',
  '0a141c2c-b47d-4c9d-9419-82445d363917',
  2
),
(
  'dd894254-536a-49cd-874b-e8586d6a50e5',
  '7ee2fda6-4b75-4a7b-8676-937010855304',
  1
);

-- =====================================
-- QUIZ
-- =====================================
INSERT INTO `Quiz` (
  id,
  title,
  description,
  createdAt
)
VALUES
(
  '96b41748-4bd3-4f53-bc07-951cccb65eca',
  'Node.js Quiz',
  'Basic Node.js quiz',
  '2026-05-11 12:19:05'
);

-- =====================================
-- MODULE QUIZ
-- =====================================
INSERT INTO `ModuleQuiz` (
  moduleId,
  quizId,
  position
)
VALUES
(
  '5d0c5dc7-fad9-4e5a-9876-048bebccbdeb',
  '96b41748-4bd3-4f53-bc07-951cccb65eca',
  1
);

-- =====================================
-- QUESTIONS
-- =====================================
INSERT INTO `Question` (
  id,
  quizId,
  content,
  type
)
VALUES
(
  'c49694c1-9d56-4f46-bd5e-57f3a4399369',
  '96b41748-4bd3-4f53-bc07-951cccb65eca',
  'What is Node.js?',
  'SINGLE_CHOICE'
),
(
  '41b80dc2-8f62-493e-8308-f221f42e9115',
  '96b41748-4bd3-4f53-bc07-951cccb65eca',
  'Prisma is an ORM?',
  'TRUE_FALSE'
);

-- =====================================
-- OPTIONS
-- =====================================
INSERT INTO `Option` (
  id,
  questionId,
  content,
  isCorrect
)
VALUES
(
  '9c2b6b92-28e4-479f-a813-fb6c37afe1a5',
  'c49694c1-9d56-4f46-bd5e-57f3a4399369',
  'JavaScript Runtime',
  true
),
(
  'dc319217-9140-4e0b-a04e-2c32f20aedcf',
  'c49694c1-9d56-4f46-bd5e-57f3a4399369',
  'Database Engine',
  false
),
(
  '52481d6e-2084-467f-bf10-8d8715ee41dc',
  '41b80dc2-8f62-493e-8308-f221f42e9115',
  'True',
  true
),
(
  '9c42abcc-f38a-42f7-a233-92a300297d1f',
  '41b80dc2-8f62-493e-8308-f221f42e9115',
  'False',
  false
);

-- =====================================
-- USER TRACK
-- =====================================
INSERT INTO `UserTrack` (
  id,
  userId,
  trackId,
  role,
  status
)
VALUES
(
  '9794a07e-3386-40ae-a82c-07847c1620ae',
  'a7892aa7-7ec0-4fe8-af3a-ef5a88fd1eb8',
  '4d7c8f46-8f92-4c10-ac86-2b7fb596c742',
  'STUDENT',
  'IN_PROGRESS'
),
(
  '148fe2c7-078c-4892-8c9c-c1aa31b7b700',
  '3260dab7-3e12-43b7-8f29-76a3e8a05322',
  '4d7c8f46-8f92-4c10-ac86-2b7fb596c742',
  'INSTRUCTOR',
  'COMPLETED'
);

-- =====================================
-- USER TRAINING
-- =====================================
INSERT INTO `UserTraining` (
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
  'bb958f3f-4c82-43a8-812f-af39d304710f',
  'a7892aa7-7ec0-4fe8-af3a-ef5a88fd1eb8',
  'abcd2b7a-515b-4139-8d00-055a5499aaf4',
  'STUDENT',
  'IN_PROGRESS',
  '2026-05-11 12:19:05',
  NULL
);

-- =====================================
-- QUIZ ATTEMPT
-- =====================================
INSERT INTO `QuizAttempt` (
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
  '68fbc167-3da4-4653-930d-1bed80b297d2',
  'a7892aa7-7ec0-4fe8-af3a-ef5a88fd1eb8',
  '96b41748-4bd3-4f53-bc07-951cccb65eca',
  85,
  true,
  '2026-05-11 12:19:05',
  '2026-05-11 12:19:05'
);
