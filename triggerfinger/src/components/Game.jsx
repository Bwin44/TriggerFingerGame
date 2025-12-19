import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "../assets/game.css";

/* ================= CONFIG ================= */
const ROWS = 10;
const COLS = 5;
const WORDS_PER_ATTACK = 5;
const WORDS_PER_CLEAR = 7;
const ROUNDS = 2;
const COUNTDOWN = 3;

const WORD_BANK = [
  "THE","BE","TO","OF","AND","A","IN","THAT","HAVE","I","IT","FOR","NOT","ON","WITH",
  "HE","AS","YOU","DO","AT","THIS","BUT","HIS","BY","FROM","THEY","WE","SAY","HER",
  "SHE","OR","AN","WILL","MY","ONE","ALL","WOULD","THERE","THEIR","IS","ARE","WAS",
  "WERE","SO","IF","OUT","UP","WHAT","ABOUT","WHO","GET","WHICH","GO","ME","WHEN",
  "MAKE","CAN","LIKE","TIME","NO","JUST","HIM","KNOW","TAKE","PEOPLE","INTO","YEAR",
  "YOUR","GOOD","SOME","COULD","THEM","SEE","OTHER","THAN","THEN","NOW","LOOK","ONLY",
  "COME","ITS","OVER","THINK","ALSO","BACK","AFTER","USE","TWO","HOW","OUR","WORK",
  "FIRST","WELL","WAY","EVEN","NEW","WANT","BECAUSE","ANY","THESE","GIVE","DAY","MOST",
  "US","REACT","KEYBOARD","SPEED","BATTLE","LOGIC","STATE","EFFECT","COMPONENT",
  "RENDER","HOOK","TYPING","ACCURACY",
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
    <div className="relative">
      <div className="text-center mb-2 font-bold">{title}</div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${COLS}, 24px)`,
          gap: "2px",
          background: "#111",
          padding: "6px",
          border: "2px solid #555",
        }}
      >
        {board.flat().map((cell, i) => (
          <div
            key={i}
            style={{
              width: "24px",
              height: "24px",
              background: cell ? "#4ade80" : "#1f2933",
            }}
          />
        ))}
      </div>

      {overlay && (
        <div className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-red-500">
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

  const [words, setWords] = useState(() =>
    Array.from({ length: 5 }, randomWord)
  );
  const [wordStatuses, setWordStatuses] = useState(
    () => Array(7).fill("current")
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
  const currentWord = words[0];

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

    setWordStatuses((prev) => {
      const next = [...prev];
      next[0] = isCorrect ? "correct" : "incorrect";
      return [...next.slice(1), "current"];
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

    setWords((w) => [...w.slice(1), randomWord()]);
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
    <div className="game-container">
      <h1 className="text-3xl font-bold mb-2">Trigger Finger Battle</h1>
      <p className="mb-4">Round {round} / {ROUNDS}</p>

      {!gameStarted && countdown > 0 && (
        <div className="text-4xl font-bold mb-4">{countdown}</div>
      )}

      <div className="flex gap-6 mb-4">
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

      <div className="word-queue mb-4">
        {words.map((w, i) => (
          <span key={i} className={`word-${wordStatuses[i]}`}>
            {w}
          </span>
        ))}
      </div>

      {gameStarted && (
        <input
          ref={inputRef}
          className="game-input"
          value={input}
          onChange={(e) => setInput(e.target.value.toUpperCase())}
          onKeyDown={handleKeyDown}
          disabled={!!result}
          placeholder="TYPE HERE..."
        />
      )}

      {gameStarted && (
        <div className="flex gap-6 text-lg mt-4">
          <div>WPM: {wpm}</div>
          <div>ACCURACY: {accuracy.toFixed(1)}%</div>
        </div>
      )}
    </div>
  );
}
