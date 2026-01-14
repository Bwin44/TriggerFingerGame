import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "../assets/game.css";

/* ================= CONFIG ================= */
const ROWS = 10;
const COLS = 1;
const WORDS_PER_ATTACK = 5;
const WORDS_PER_CLEAR = 7;
const ROUNDS = 3;
const COUNTDOWN = 3;
const ACTIVE_WORD = 2;

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
function Board({ board, title, overlay, shake, titleColor }) {
  return (
    <motion.div
      className="relative flex flex-col items-center"
      animate={shake ? "shake" : "idle"}
      variants={{
        idle: { x: 0 },
        shake: {
          x: [0, -8, 8, -6, 6, -3, 3, 0],
          transition: { duration: 0.25 },
        }
      }}
    >
      {/* .board */}
      <div className="mb-3 text-2xl font-bold text-center text-white" style={{ color: titleColor }}>{title}</div>  {/* .board-title */}

      <div
        className="board-grid relative"
        style={{
          gridTemplateColumns: `repeat(${COLS}, 1fr)`,
          gridTemplateRows: `repeat(${ROWS}, 1fr)`
        }}
      >
        <AnimatePresence>
          {shake && (
            <motion.div
              className="bg-red-500/40 pointer-events-none rounded-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            />
          )}
        </AnimatePresence>
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
    </motion.div>
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
  const [enemyCorrectChars, enemySetCorrectChars] = useState(0);
  const [enemyTotalChars, enemySetTotalChars] = useState(0);
  const [enemyCorrectWords, setEnemyCorrectWords] = useState(0);

  const [result, setResult] = useState(null);
  const [roundResults, setRoundResults] = useState([]);
  const [wpmHistory, setWpmHistory] = useState([]);
  const [accuracyHistory, setAccuracyHistory] = useState([]);

  const [countdown, setCountdown] = useState(COUNTDOWN);
  const [gameStarted, setGameStarted] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [enemyStartTime, setEnemyStartTime] = useState(null);

  const inputRef = useRef(null);

  const [playerHit, setPlayerHit] = useState(false);
  const [enemyHit, setEnemyHit] = useState(false);

  const TYPE_SOUND_POOL_SIZE = 3;

  const typeSounds = useRef(
    Array.from({ length: TYPE_SOUND_POOL_SIZE }, () => {
      const audio = new Audio("/sounds/typingShort2.mp3");
      audio.volume = 0.4;
      return audio;
    })
  );

  const typeSoundIndex = useRef(0);


  /* ================= METRICS ================= */
  const elapsedMin = startTime ? (Date.now() - startTime) / 60000 : 0;
  const wpm =
    elapsedMin > 0 ? Math.round((correctChars / 5) / elapsedMin) : 0;
  const accuracy =
    totalChars > 0 ? (correctChars / totalChars) * 100 : 100;

  const enemyElapsedMin = enemyStartTime
    ? (Date.now() - enemyStartTime) / 60000
    : 0;

  const enemyWPM =
    enemyElapsedMin > 0
      ? Math.round((enemyCorrectWords / enemyElapsedMin))
      : 0;

  const enemyAccuracy =
    totalChars > 0 ? (enemyCorrectChars / enemyTotalChars) * 100 : 100;

  /* ================= AUTO FOCUS ================= */
  useEffect(() => {
    if (gameStarted && inputRef.current) inputRef.current.focus();
  }, [gameStarted, round]);

  /* ================= ROUND CONTROL ================= */
  function startRound() {
    setCurrentWordIndex(0);
    setWords(Array.from({ length: WORD_QUEUE_SIZE }, randomWord));
    setWordStatuses(Array(WORD_QUEUE_SIZE).fill(null));
    setCountdown(COUNTDOWN);
    setGameStarted(false);

    const timer = setInterval(() => {
      setCountdown((c) => {
        if (c === 1) {
          clearInterval(timer);
          setGameStarted(true);
          setStartTime(Date.now());
          setEnemyStartTime(Date.now());
        }
        return c - 1;
      });
    }, 1000);
  }

  /* start FIRST round only after Menu → Game */
  useEffect(() => {
    startRound();
  }, []);

  /* ================= SOUND ================= */
  function playTypeSound() {
    const sounds = typeSounds.current;
    const i = typeSoundIndex.current;

    const sound = sounds[i];
    sound.currentTime = 0;
    sound.play().catch(() => { });

    typeSoundIndex.current = (i + 1) % sounds.length;
  }

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

    // ✅ SNAPSHOT current word at time of submission
    const activeWord = words[currentWordIndex];
    const isCorrect = value === activeWord;

    // Mark word status
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

        if (n % WORDS_PER_ATTACK === 0) {
          setEnemyBoard((b) => addLine(b));
          setEnemyHit(true);
          setTimeout(() => setEnemyHit(false), 200);
        }

        if (n % WORDS_PER_CLEAR === 0) {
          setPlayerBoard((b) => removeLine(b));
        }

        return n;
      });
    }

    // 🔁 Sliding logic
    if (currentWordIndex < ACTIVE_WORD) {
      setCurrentWordIndex((i) => i + 1);
    } else {
      setWords((prev) => [...prev.slice(1), randomWord()]);
      setWordStatuses((prev) => [...prev.slice(1), null]);
      setCurrentWordIndex(ACTIVE_WORD);
    }

    // ✅ ALWAYS clear input
    setInput("");
  }



  /* ================= AI ================= */
  useEffect(() => {
    if (!gameStarted || result) return;

    const interval = setInterval(() => {
      setEnemyCorrectWords((c) => {
        const n = c + 1;

        // AI attacks player every 5 words
        if (n % WORDS_PER_ATTACK === 0) {
          setPlayerBoard((b) => addLine(b));
          setPlayerHit(true);
          setTimeout(() => setPlayerHit(false), 200);
        }

        // AI clears its own board every 7 words
        if (n % WORDS_PER_CLEAR === 0) {
          setEnemyBoard((b) => removeLine(b));
        }

        return n;
      });
    }, 1200); // AI "typing speed"

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
    setEnemyCorrectWords(0);
    setCurrentWordIndex(0);
    setWords(Array.from({ length: WORD_QUEUE_SIZE }, randomWord));
    setWordStatuses(Array(WORD_QUEUE_SIZE).fill(null));
    setCorrectChars(0);
    setTotalChars(0);
    setInput("");
    startRound();
  }

  /* ================= RENDER ================= */
  return (
    <div className="min-h-screen flex flex-col items-center gap-6 bg-transparent relative z-10">   {/* .game-container */}
      <p className={`flex flex-col gap-6 p-4 text-2xl font-extrabold text-white text-center border-2 border-cyan-400 rounded-lg tracking-wide transition-opacity duration-300 ${gameStarted ? "opacity-100" : "opacity-40"
        }`}>Round {round} / {ROUNDS}</p>

      {!gameStarted && countdown > 0 && ( /* countdown */
        <div className="px-6 py-2 text-4xl font-bold mb-4 text-center text-white border-2 border-cyan-400 rounded-lg">{countdown}</div>
      )}

      <div className="grid grid-cols-[1fr_10px_1fr] w-full max-w-[1000px] mx-auto items-start gap-6">     {/* .board-container */}
        <Board
          board={playerBoard}
          title="YOU"
          titleColor="#4ade80"
          overlay={result === "lose" ? "YOU LOSE" : null}
          shake={playerHit}
        />

        <div
          className={`flex flex-col items-stretch justify-center gap-10
    text-2xl font-extrabold text-white transition-opacity duration-300
    ${gameStarted ? "opacity-100" : "opacity-40"}`}
        >
          {/* Player .stats */}
          <div className="flex flex-col gap-2 text-left self-start translate-x-[-80px]">
            <div className="text-xs font-extrabold tracking-widest text-cyan-300">WPM</div>
            <div className="px-4 py-1 text-2xl border border-cyan-400 rounded-lg bg-black">{wpm}</div>
            <div className="text-xs font-extrabold tracking-widest text-cyan-300">ACCURACY</div>
            <div className="px-4 py-1 text-2xl border border-cyan-400 rounded-lg bg-black">{accuracy.toFixed(1)}%</div>
          </div>

          {/* Opponent .stats */}
          <div className="flex flex-col gap-2 text-right self-end translate-x-[80px]">
            <div className="text-xs font-extrabold tracking-widest text-cyan-300">WPM</div>
            <div className="px-4 py-1 text-2xl border border-cyan-400 rounded-lg bg-black">{enemyWPM}</div>
            <div className="text-xs font-extrabold tracking-widest text-cyan-300">ACCURACY</div>
            <div className="px-4 py-1 text-2xl border border-cyan-400 rounded-lg bg-black">{enemyAccuracy.toFixed(1)}%</div>
          </div>
        </div>

        <Board
          board={enemyBoard}
          title="OPPONENT"
          titleColor="#e96262ff" // red-500
          overlay={result === "win" ? "YOU WIN" : null}
          shake={enemyHit}
        />
      </div>

      {/* Word Queue + Input centered under YOU */}
      <div className="grid grid-cols-[1fr_1fr_1fr] w-full max-w-[1600px] ml-auto">
        <div /> {/* empty stats column */}

        <div className="flex flex-col items-center gap-4">
          {/* WORD QUEUE */}
          <div className="relative h-24 flex flex-col items-center justify-end overflow-hidden">

            {/* CURRENT WORD QUEUE */}
            <motion.div
              key="current"
              className="relative w-[520px] h-14 px-6 overflow-hidden rounded-lg bg-[#374151] flex items-center justify-center"
              layout
              transition={{ duration: 1.2, type: "spring", stiffness: 200, damping: 20 }}
            >
              {words.map((w, i) => {
                const status = wordStatuses[i];
                const isActive = i === currentWordIndex;

                const offset = i - ACTIVE_WORD;

                return (
                  <motion.span
                    key={w + i}
                    initial={false}
                    animate={{
                      x: offset * 105,
                      scale: isActive ? 1.3 : 1,
                      opacity: Math.abs(offset) > 2 ? 0 : 1

                    }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 22
                    }}
                    className={`absolute min-w-[100px] max-w-[160px] text-center font-bold whitespace-nowrap
        ${status === "correct"
                        ? "text-green-400"
                        : status === "incorrect"
                          ? "text-red-400"
                          : isActive
                            ? "text-cyan-300"
                            : "text-white/60"
                      }`}
                  >
                    {w}
                  </motion.span>
                );
              })}

            </motion.div>

          </div>


          {/* INPUT */}
          {gameStarted && (
            <input
              ref={inputRef}
              className="w-80 p-3 text-lg rounded-xl outline-none uppercase tracking-wide
                   bg-cyan-500 text-black placeholder-black/60
                   focus:ring-4 focus:ring-cyan-300 transition"
              value={input}
              onChange={(e) => {
                const next = e.target.value.toUpperCase();

                // play sound only when a character is added
                if (next.length > input.length) {
                  playTypeSound();
                }

                setInput(next);
              }}

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