import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "../assets/game.css";

/* ================= CONFIG ================= */
const ROWS = 10;
const COLS = 1;
const WORDS_PER_ATTACK = 5;
const WORDS_PER_CLEAR = 7;
const ROUNDS = 2;
const COUNTDOWN = 3;

const WORD_BANK = [
  "THE", "BE", "TO", "OF", "AND", "A", "IN", "THAT", "HAVE", "I", "IT", "FOR", "NOT", "ON", "WITH",
  "HE", "AS", "YOU", "DO", "AT", "THIS", "BUT", "HIS", "BY", "FROM", "THEY", "WE", "SAY", "HER",
  "SHE", "OR", "AN", "WILL", "MY", "ONE", "ALL", "WOULD", "THERE", "THEIR", "IS", "ARE", "WAS",
  "WERE", "SO", "IF", "OUT", "UP", "WHAT", "ABOUT", "WHO", "GET", "WHICH", "GO", "ME", "WHEN",
  "MAKE", "CAN", "LIKE", "TIME", "NO", "JUST", "HIM", "KNOW", "TAKE", "PEOPLE", "INTO", "YEAR",
  "YOUR", "GOOD", "SOME", "COULD", "THEM", "SEE", "OTHER", "THAN", "THEN", "NOW", "LOOK", "ONLY",
  "COME", "ITS", "OVER", "THINK", "ALSO", "BACK", "AFTER", "USE", "TWO", "HOW", "OUR", "WORK",
  "FIRST", "WELL", "WAY", "EVEN", "NEW", "WANT", "BECAUSE", "ANY", "THESE", "GIVE", "DAY", "MOST",
  "US", "REACT", "KEYBOARD", "SPEED", "BATTLE", "LOGIC", "STATE", "EFFECT", "COMPONENT",
  "RENDER", "HOOK", "TYPING", "ACCURACY",
  "PEOPLE", "DOES", "HERE", "YOUR", "WHERE", "WHEN", "US", "ALL", "HOW", "HAS", "MORE", "THAN",
  "HEAR", "ASK", "SEE", "SAY", "DO", "WHOLE", "YET", "EACH", "THROUGH", "TOGETHER", "MAY",
  "NEED", "SOME", "WILL", "CAN", "UP", "DOWN", "AWAY", "BELOW", "ABOVE", "ALWAYS", "NEVER",
  "HERE", "LITTLE", "LESS", "GREAT", "WALK", "RUN", "FIND", "LOOK", "WALK", "SIT", "STAY", "MOVE",
  "LEAVE", "ENTER", "FEEL", "USE", "TAKE", "GIVE", "RECEIVE", "BEGIN", "END", "CHOOSE", "MAKE",
  "HAVE", "REMAIN", "CREATE", "BUILD", "START", "FINISH", "MOVE", "SLOW", "FAST", "ACT", "FEEL",
  "THINK", "IMAGINE", "REMEMBER", "SHOW", "PROVE", "ANSWER", "TURN", "HOLD", "AGAIN", "EXPLAIN",
  "HELP", "WAIT", "SING", "DANCE", "SLEEP", "WAKE", "CLOSE", "OPEN", "NEED", "WAIT", "ENJOY", "CREATE"
];

/* ================= HELPERS ================= */
const emptyBoard = () =>
  Array.from({ length: ROWS }, () => Array(COLS).fill(0));

const randomWord = () =>
  WORD_BANK[Math.floor(Math.random() * WORD_BANK.length)];

const addLine = (board) => [...board.slice(1), Array(COLS).fill(1)];
const removeLine = (board) => [Array(COLS).fill(0), ...board.slice(0, -1)];

/* ================= BOARD ================= */
function Board({ board, title, overlay }) {
  return (
    <div className="relative flex flex-col items-center">   {/* .board */}
      <div className="mb-3 text-2xl font-bold text-center text-white">{title}</div>  {/* .board-title */}

      <div
        className="board-grid"
        style={{
          gridTemplateColumns: `repeat(${COLS}, 1fr)`,
          gridTemplateRows: `repeat(${ROWS}, 1fr)`
        }}
      >
        {board.flat().map((cell, i) => (
          <div
            key={i}
            className={`board-cell ${cell ? "filled" : ""}`}
          />
        ))}
      </div>

      {overlay && (
        <div className="board-overlay">
          {overlay}
        </div>
      )}
    </div>
  );
}

/* ================= GAME ================= */
export default function Game({ onGameOver }) {
  const [round, setRound] = useState(1);

  const [playerBoard, setPlayerBoard] = useState(emptyBoard());
  const [enemyBoard, setEnemyBoard] = useState(emptyBoard());

  const WORD_QUEUE_SIZE = 5;

  const [currentWordIndex, setCurrentWordIndex] = useState(0);

  const [words, setWords] = useState(() =>
    Array.from({ length: WORD_QUEUE_SIZE }, randomWord)
  );

  const [wordStatuses, setWordStatuses] = useState(
    () => Array(WORD_QUEUE_SIZE).fill("current")
  );


  const [input, setInput] = useState("");
  const [correctChars, setCorrectChars] = useState(0);
  const [totalChars, setTotalChars] = useState(0);
  const [correctWords, setCorrectWords] = useState(0);

  const [result, setResult] = useState(null);
  const [roundResults, setRoundResults] = useState([]);
  const [wpmHistory, setWpmHistory] = useState([]);
  const [accuracyHistory, setAccuracyHistory] = useState([]);

  const [countdown, setCountdown] = useState(COUNTDOWN);
  const [gameStarted, setGameStarted] = useState(false);
  const [startTime, setStartTime] = useState(null);

  const inputRef = useRef(null);
  const currentWord = words[currentWordIndex];

  /* ================= METRICS ================= */
  const elapsedMin = startTime ? (Date.now() - startTime) / 60000 : 0;
  const wpm =
    elapsedMin > 0 ? Math.round((correctChars / 5) / elapsedMin) : 0;
  const accuracy =
    totalChars > 0 ? (correctChars / totalChars) * 100 : 100;

  /* ================= AUTO FOCUS ================= */
  useEffect(() => {
    if (gameStarted && inputRef.current) inputRef.current.focus();
  }, [gameStarted, round]);

  /* ================= ROUND CONTROL ================= */
  function startRound() {
    setCountdown(COUNTDOWN);
    setGameStarted(false);

    const timer = setInterval(() => {
      setCountdown((c) => {
        if (c === 1) {
          clearInterval(timer);
          setGameStarted(true);
          setStartTime(Date.now());
        }
        return c - 1;
      });
    }, 1000);
  }

  /* start FIRST round only after Menu → Game */
  useEffect(() => {
    startRound();
  }, []);

  /* ================= INPUT ================= */
  function handleKeyDown(e) {
    if (e.key === " ") {
      e.preventDefault();
      submitWord();
    }
  }

  function submitWord() {
    const value = input.toUpperCase().trim();
    if (!value) return;

    const isCorrect = value === currentWord;

    // Mark the CURRENT word green/red
    setWordStatuses((prev) => {
      const updated = [...prev];
      updated[currentWordIndex] = isCorrect ? "correct" : "incorrect";
      return updated;
    });

    setTotalChars((c) => c + value.length);
    if (isCorrect) setCorrectChars((c) => c + value.length);

    if (isCorrect) {
      setCorrectWords((c) => {
        const n = c + 1;
        if (n % WORDS_PER_ATTACK === 0)
          setEnemyBoard((b) => addLine(b));
        if (n % WORDS_PER_CLEAR === 0)
          setPlayerBoard((b) => removeLine(b));
        return n;
      });
    }

    // 🧠 If this was NOT the last word → move cursor
    if (currentWordIndex < WORD_QUEUE_SIZE - 1) {
      setCurrentWordIndex((i) => i + 1);
    }
    // 🧠 If this WAS the 5th word → shift entire queue
    else {
      setWords(Array.from({ length: WORD_QUEUE_SIZE }, randomWord));
      setWordStatuses(Array(WORD_QUEUE_SIZE).fill("current"));
      setCurrentWordIndex(0);
    }

    setInput("");
  }


  /* ================= AI ================= */
  useEffect(() => {
    if (!gameStarted || result) return;

    const interval = setInterval(() => {
      setPlayerBoard((b) => addLine(b));
    }, 1200);

    return () => clearInterval(interval);
  }, [gameStarted, result]);

  /* ================= WIN / LOSE ================= */
  useEffect(() => {
    if (!gameStarted || result) return;

    if (enemyBoard[0].some(Boolean)) finishRound("win");
    if (playerBoard[0].some(Boolean)) finishRound("lose");
  }, [playerBoard, enemyBoard, gameStarted, result]);

  function finishRound(outcome) {
    setResult(outcome);
    setRoundResults((r) => [...r, outcome]);
    setWpmHistory((w) => [...w, wpm]);
    setAccuracyHistory((a) => [...a, accuracy]);

    setTimeout(() => {
      if (round < ROUNDS) {
        startNextRound();
      } else {
        onGameOver({
          results: [...roundResults, outcome],
          wpmHistory: [...wpmHistory, wpm],
          accuracyHistory: [...accuracyHistory, accuracy],
        });
      }
    }, 2000);
  }

  function startNextRound() {
    setRound((r) => r + 1);
    setResult(null);
    setPlayerBoard(emptyBoard());
    setEnemyBoard(emptyBoard());
    setWords(Array.from({ length: 5 }, randomWord));
    setWordStatuses(Array(7).fill("current"));
    setCorrectChars(0);
    setTotalChars(0);
    setInput("");
    startRound();
  }

  /* ================= RENDER ================= */
  return (
    <div className="min-h-screen flex flex-col items-stretch p-6 gap-6 bg-transparent relative z-10">   {/* .game-container */}
      <p className="mb-4 text-center text-white">Round {round} / {ROUNDS}</p>

      {!gameStarted && countdown > 0 && ( /* countdown */
        <div className="text-4xl font-bold mb-4 text-center text-white">{countdown}</div>
      )}

      <div className="grid grid-cols-[240px_1fr_1fr] w-full max-w-[1600px] ml-auto items-center">     {/* .board-container */}
        {/* .stats */}<div className="flex items-center justify-center self-stretch">
          <div
            className={`flex flex-col gap-6 text-2xl font-extrabold text-white text-center tracking-wide transition-opacity duration-300 ${gameStarted ? "opacity-100" : "opacity-40"
              }`}
          >
            <div>WPM: {wpm}</div>
            <div>ACCURACY: {accuracy.toFixed(1)}%</div>
          </div>
        </div>

        <Board
          board={playerBoard}
          title="YOU"
          overlay={result === "lose" ? "YOU LOSE" : null}
        />
        <Board
          board={enemyBoard}
          title="OPPONENT"
          overlay={result === "win" ? "YOU WIN" : null}
        />
      </div>

      {/* Word Queue + Input centered under YOU */}
      <div className="grid grid-cols-[240px_1fr_1fr] w-full max-w-[1600px] ml-auto">
        <div /> {/* empty stats column */}

        <div className="flex flex-col items-center gap-4">
          {/* WORD QUEUE */}
          <div className="flex flex-wrap justify-center gap-3 text-xl font-bold rounded-lg tracking-wide bg-[#374151]">
            {words.map((w, i) => {
              const status = wordStatuses[i];
              const isActive = i === currentWordIndex;

              return (
                <span
                  key={i}
                  className={`px-3 py-1 rounded-lg transition-all duration-200
        ${status === "correct"
                      ? "text-green-400"
                      : status === "incorrect"
                        ? "text-red-400"
                        : isActive
                          ? "text-cyan-300 scale-110"
                          : "text-white/60"
                    }`}
                >
                  {w}
                </span>
              );
            })}

          </div>

          {/* INPUT */}
          {gameStarted && (
            <input
              ref={inputRef}
              className="w-80 p-3 text-lg rounded-xl outline-none uppercase tracking-wide
                   bg-cyan-500 text-black placeholder-black/60
                   focus:ring-4 focus:ring-cyan-300 transition"
              value={input}
              onChange={(e) => setInput(e.target.value.toUpperCase())}
              onKeyDown={handleKeyDown}
              disabled={!!result}
              placeholder="TYPE HERE..."
            />
          )}
        </div>

        <div /> {/* empty opponent column */}
      </div>

    </div>
  );
}
