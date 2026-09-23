import { useState } from 'react'
import { quizService } from '../services/notificationService'

function QuizRunner({ quiz, onFinish }) {
  const [answers, setAnswers] = useState({})
  const [current, setCurrent] = useState(0)
  const [submitting, setSubmitting] = useState(false)

  const question = quiz.questions[current]
  const isLast = current === quiz.questions.length - 1

  const selectOption = (optionId) => {
    setAnswers((a) => ({ ...a, [question.id]: optionId }))
  }

  const next = async () => {
    if (!isLast) {
      setCurrent((c) => c + 1)
      return
    }
    setSubmitting(true)
    try {
      const result = await quizService.submit(quiz.id, answers)
      onFinish(result, quiz)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="card" style={{ padding: 28, maxWidth: 560 }}>
      <div className="eyebrow">Question {current + 1} of {quiz.questions.length}</div>

      {question.imageUrl && (
        <img src={question.imageUrl} alt="Guess the movie" style={{ width: '100%', maxWidth: 220, borderRadius: 10, margin: '16px 0' }} />
      )}

      <h2 style={{ fontSize: 20, margin: '10px 0 20px' }}>{question.prompt}</h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {question.options.map((opt) => (
          <button
            key={opt.id}
            onClick={() => selectOption(opt.id)}
            className={answers[question.id] === opt.id ? 'btn btn-primary' : 'btn btn-outline'}
            style={{ justifyContent: 'flex-start', textAlign: 'left', padding: '12px 16px' }}
          >
            {opt.text}
          </button>
        ))}
      </div>

      <button
        className="btn btn-primary"
        style={{ marginTop: 24 }}
        disabled={!answers[question.id] || submitting}
        onClick={next}
      >
        {isLast ? (submitting ? 'Submitting…' : 'Finish') : 'Next'}
      </button>
    </div>
  )
}

function QuizResults({ result, onReplay }) {
  return (
    <div className="card" style={{ padding: 32, maxWidth: 480, textAlign: 'center' }}>
      <span className="eyebrow">Results</span>
      <h1 className="display" style={{ fontSize: 40, margin: '10px 0' }}>
        {result.correctAnswers}/{result.totalQuestions}
      </h1>
      <p className="muted">You earned {result.pointsAwarded} points{result.correctAnswers === result.totalQuestions ? ' — perfect score! 🧠' : '.'}</p>
      <button className="btn btn-primary" style={{ marginTop: 20 }} onClick={onReplay}>Play Again</button>
    </div>
  )
}

export default function Games() {
  const [mode, setMode] = useState(null)
  const [quiz, setQuiz] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const start = async (type) => {
    setLoading(true)
    setResult(null)
    try {
      const data = type === 'trivia' ? await quizService.startTrivia() : await quizService.startGuessTheMovie()
      setQuiz(data)
      setMode(type)
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setMode(null)
    setQuiz(null)
    setResult(null)
  }

  return (
    <div className="page">
      <div className="container">
        <div style={{ padding: '32px 0 8px' }}>
          <span className="eyebrow">Test Your Knowledge</span>
          <h1 className="display" style={{ fontSize: 40, margin: '8px 0 0' }}>Movie Games</h1>
          <p className="muted" style={{ marginTop: 8 }}>Earn points and badges for every correct answer.</p>
        </div>

        {!quiz && !result && (
          <div style={{ display: 'flex', gap: 16, marginTop: 32, flexWrap: 'wrap' }}>
            <button className="card" onClick={() => start('trivia')} disabled={loading} style={{ padding: 28, width: 260, textAlign: 'left', cursor: 'pointer' }}>
              <div style={{ fontSize: 28 }}>🧠</div>
              <h3 style={{ margin: '10px 0 6px' }}>Movie Trivia</h3>
              <p className="muted" style={{ fontSize: 13 }}>5 questions about release years and more.</p>
            </button>
            <button className="card" onClick={() => start('guess')} disabled={loading} style={{ padding: 28, width: 260, textAlign: 'left', cursor: 'pointer' }}>
              <div style={{ fontSize: 28 }}>🎬</div>
              <h3 style={{ margin: '10px 0 6px' }}>Guess the Movie</h3>
              <p className="muted" style={{ fontSize: 13 }}>Identify the movie from its poster.</p>
            </button>
          </div>
        )}

        {loading && <p className="muted" style={{ marginTop: 24 }}>Building your quiz…</p>}

        {quiz && !result && (
          <div style={{ marginTop: 28 }}>
            <QuizRunner quiz={quiz} onFinish={(res) => { setResult(res); setQuiz(null) }} />
          </div>
        )}

        {result && (
          <div style={{ marginTop: 28 }}>
            <QuizResults result={result} onReplay={reset} />
          </div>
        )}
      </div>
    </div>
  )
}
