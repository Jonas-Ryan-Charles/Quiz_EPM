'use client';

import { useEffect, useMemo, useState } from 'react';
import { questions } from '../data/questions';

const TOTAL_SECONDS = 30 * 60;
const letters = ['A', 'B', 'C', 'D'];

function formatTime(seconds) {
  const safe = Math.max(0, seconds);
  const m = Math.floor(safe / 60).toString().padStart(2, '0');
  const s = Math.floor(safe % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function percentage(score, total) {
  return Math.round((score / total) * 100);
}

function gradeBand(percent) {
  if (percent >= 85) return 'Excellent — HD level revision';
  if (percent >= 75) return 'Strong — D/HD range';
  if (percent >= 65) return 'Good — credit range';
  if (percent >= 50) return 'Pass — but revise weak topics';
  return 'Not ready yet — revise the basics again';
}

export default function Home() {
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [flagged, setFlagged] = useState({});
  const [timeLeft, setTimeLeft] = useState(TOTAL_SECONDS);
  const [reviewFilter, setReviewFilter] = useState('all');

  const topics = useMemo(() => [...new Set(questions.map((q) => q.topic))], []);

  useEffect(() => {
    if (!started || finished) return;
    if (timeLeft <= 0) {
      setFinished(true);
      return;
    }
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [started, finished, timeLeft]);

  const answeredCount = Object.keys(answers).length;
  const q = questions[current];
  const score = questions.reduce((total, item, index) => {
    return total + (answers[index] === item.answer ? 1 : 0);
  }, 0);
  const percent = percentage(score, questions.length);

  const topicStats = useMemo(() => {
    const stats = {};
    questions.forEach((item, index) => {
      if (!stats[item.topic]) stats[item.topic] = { total: 0, correct: 0 };
      stats[item.topic].total += 1;
      if (answers[index] === item.answer) stats[item.topic].correct += 1;
    });
    return Object.entries(stats).sort((a, b) => a[0].localeCompare(b[0]));
  }, [answers]);

  const filteredQuestions = questions
    .map((item, index) => ({ ...item, originalIndex: index }))
    .filter((item) => {
      if (reviewFilter === 'wrong') return answers[item.originalIndex] !== item.answer;
      if (reviewFilter === 'flagged') return flagged[item.originalIndex];
      if (reviewFilter === 'unanswered') return answers[item.originalIndex] === undefined;
      return true;
    });

  function choose(choiceIndex) {
    setAnswers((prev) => ({ ...prev, [current]: choiceIndex }));
  }

  function startQuiz() {
    setStarted(true);
    setFinished(false);
    setCurrent(0);
    setAnswers({});
    setFlagged({});
    setTimeLeft(TOTAL_SECONDS);
    setReviewFilter('all');
  }

  function finishQuiz() {
    const ok = window.confirm('Submit the quiz now? You can review all answers after submission.');
    if (ok) setFinished(true);
  }

  if (!started) {
    return (
      <main className="shell">
        <section className="hero">
          <div className="badge">ENGI 2003 • Engineering Project Management</div>
          <h1>Project Management MCQ Trainer</h1>
          <p className="lede">
            150 multiple-choice questions built from your lecture slides and sample test questions. You get 30 minutes, instant progress tracking, and a detailed result breakdown at the end.
          </p>
          <div className="heroGrid">
            <div className="heroCard"><strong>150</strong><span>Questions</span></div>
            <div className="heroCard"><strong>30:00</strong><span>Timer</span></div>
            <div className="heroCard"><strong>4</strong><span>Choices each</span></div>
            <div className="heroCard"><strong>{topics.length}</strong><span>Topics</span></div>
          </div>
          <button className="primary" onClick={startQuiz}>Start quiz</button>
          <p className="smallNote">No login. No database. Works free on Vercel.</p>
        </section>

        <section className="topicPanel">
          <h2>Topics covered</h2>
          <div className="chips">
            {topics.map((topic) => <span key={topic}>{topic}</span>)}
          </div>
        </section>
      </main>
    );
  }

  if (finished) {
    return (
      <main className="shell">
        <section className="resultHero">
          <div>
            <div className="badge">Quiz submitted</div>
            <h1>{score} / {questions.length}</h1>
            <p className="lede">{percent}% — {gradeBand(percent)}</p>
            <p className="muted">Answered {answeredCount} of {questions.length}. Time remaining: {formatTime(timeLeft)}.</p>
          </div>
          <div className="scoreRing" style={{ '--score': `${percent * 3.6}deg` }}>
            <span>{percent}%</span>
          </div>
        </section>

        <section className="statsGrid">
          {topicStats.map(([topic, stat]) => {
            const p = percentage(stat.correct, stat.total);
            return (
              <div className="statCard" key={topic}>
                <div className="statTop"><strong>{topic}</strong><span>{stat.correct}/{stat.total}</span></div>
                <div className="bar"><i style={{ width: `${p}%` }} /></div>
              </div>
            );
          })}
        </section>

        <section className="reviewControls">
          <h2>Review answers</h2>
          <div className="filterButtons">
            {['all', 'wrong', 'flagged', 'unanswered'].map((f) => (
              <button key={f} className={reviewFilter === f ? 'active' : ''} onClick={() => setReviewFilter(f)}>{f}</button>
            ))}
          </div>
        </section>

        <section className="reviewList">
          {filteredQuestions.map((item) => {
            const selected = answers[item.originalIndex];
            const isCorrect = selected === item.answer;
            return (
              <article className="reviewCard" key={item.id}>
                <div className="reviewHead">
                  <span className="topicTag">{item.topic}</span>
                  <span className={isCorrect ? 'correctTag' : 'wrongTag'}>{isCorrect ? 'Correct' : selected === undefined ? 'Unanswered' : 'Wrong'}</span>
                </div>
                <h3>Q{item.id}. {item.question}</h3>
                <div className="reviewChoices">
                  {item.choices.map((choice, idx) => (
                    <div key={choice} className={`reviewChoice ${idx === item.answer ? 'right' : ''} ${idx === selected && idx !== item.answer ? 'pickedWrong' : ''}`}>
                      <strong>{letters[idx]}.</strong> {choice}
                    </div>
                  ))}
                </div>
                <p className="explain"><strong>Explanation:</strong> {item.explanation}</p>
              </article>
            );
          })}
        </section>

        <div className="bottomActions">
          <button className="secondary" onClick={startQuiz}>Restart quiz</button>
        </div>
      </main>
    );
  }

  const selected = answers[current];
  const progress = Math.round((answeredCount / questions.length) * 100);

  return (
    <main className="quizShell">
      <aside className="sidebar">
        <div className="timerBox">
          <span>Time left</span>
          <strong className={timeLeft < 180 ? 'danger' : ''}>{formatTime(timeLeft)}</strong>
        </div>
        <div className="progressBox">
          <div><strong>{answeredCount}</strong><span> answered</span></div>
          <div className="bar"><i style={{ width: `${progress}%` }} /></div>
          <small>{progress}% complete</small>
        </div>
        <div className="questionNav">
          {questions.map((item, index) => (
            <button
              key={item.id}
              className={`${index === current ? 'current' : ''} ${answers[index] !== undefined ? 'answered' : ''} ${flagged[index] ? 'flagged' : ''}`}
              onClick={() => setCurrent(index)}
              title={`Question ${item.id}`}
            >
              {item.id}
            </button>
          ))}
        </div>
      </aside>

      <section className="quizCard">
        <div className="quizTop">
          <span className="topicTag">{q.topic}</span>
          <span>Question {current + 1} of {questions.length}</span>
        </div>
        <h1>{q.question}</h1>
        <div className="choices">
          {q.choices.map((choice, idx) => (
            <button key={choice} className={selected === idx ? 'selected' : ''} onClick={() => choose(idx)}>
              <strong>{letters[idx]}</strong>
              <span>{choice}</span>
            </button>
          ))}
        </div>
        <div className="quizActions">
          <button className="secondary" disabled={current === 0} onClick={() => setCurrent((c) => c - 1)}>Previous</button>
          <button className="ghost" onClick={() => setFlagged((prev) => ({ ...prev, [current]: !prev[current] }))}>
            {flagged[current] ? 'Unflag' : 'Flag for review'}
          </button>
          {current < questions.length - 1 ? (
            <button className="primary" onClick={() => setCurrent((c) => c + 1)}>Next</button>
          ) : (
            <button className="primary" onClick={finishQuiz}>Submit</button>
          )}
        </div>
      </section>

      <button className="floatingSubmit" onClick={finishQuiz}>Submit quiz</button>
    </main>
  );
}
