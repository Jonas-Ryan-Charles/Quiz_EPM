# ENGI 2003 Engineering Project Management Quiz Website

A free Vercel-ready Next.js quiz website.

## Features

- 150 MCQ questions
- 4 choices per question
- 30-minute countdown timer
- One-question-at-a-time quiz mode
- Review mode after submission
- Final score, percentage, grade band and topic breakdown
- Mobile-friendly UI
- Question flagging and question navigation
- Questions stored in `data/questions.js` for easy editing

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Deploy for free on Vercel

1. Upload this folder to GitHub.
2. Go to Vercel.
3. Click **New Project**.
4. Import your GitHub repository.
5. Leave the defaults.
6. Click **Deploy**.

## Edit questions

Open:

```bash
data/questions.js
```

Each question uses this format:

```js
{
  id: 1,
  topic: 'WBS',
  question: 'What is the primary purpose of a WBS?',
  choices: ['A', 'B', 'C', 'D'],
  answer: 2,
  explanation: 'Explanation here.'
}
```

The `answer` value is zero-based, so `0 = A`, `1 = B`, `2 = C`, `3 = D`.
