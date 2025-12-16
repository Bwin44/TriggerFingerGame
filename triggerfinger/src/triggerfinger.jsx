import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import './triggerfinger.css';


// ================= CONFIG =================
const ROWS = 10;
const COLS = 5;
const WORDS_PER_ATTACK = 5;
const WORDS_PER_CLEAR = 7;
const ROUNDS = 2;
const COUNTDOWN = 3;

const WORD_BANK = [
    "THE", "BE", "TO", "OF", "AND", "A", "IN", "THAT", "HAVE", "I", "IT", "FOR", "NOT", "ON", "WITH", "HE", "AS", "YOU", "DO", "AT",
    "THIS", "BUT", "HIS", "BY", "FROM", "THEY", "WE", "SAY", "HER", "SHE", "OR", "AN", "WILL", "MY", "ONE", "ALL", "WOULD", "THERE", "THEIR", "IS",
    "ARE", "WAS", "WERE", "SO", "IF", "OUT", "UP", "WHAT", "ABOUT", "WHO", "GET", "WHICH", "GO", "ME", "WHEN", "MAKE", "CAN", "LIKE", "TIME", "NO",
    "JUST", "HIM", "KNOW", "TAKE", "PEOPLE", "INTO", "YEAR", "YOUR", "GOOD", "SOME", "COULD", "THEM", "SEE", "OTHER", "THAN", "THEN", "NOW", "LOOK", "ONLY", "COME",
    "ITS", "OVER", "THINK", "ALSO", "BACK", "AFTER", "USE", "TWO", "HOW", "OUR", "WORK", "FIRST", "WELL", "WAY", "EVEN", "NEW", "WANT", "BECAUSE", "ANY", "THESE",
    "GIVE", "DAY", "MOST", "US", "REACT", "KEYBOARD", "SPEED", "BATTLE", "LOGIC", "STATE", "EFFECT", "COMPONENT", "RENDER", "HOOK", "TYPING", "ACCURACY",
];

// ================= HELPERS =================
const emptyBoard = () => Array.from({ length: ROWS }, () => Array(COLS).fill(0));
const randomWord = () => WORD_BANK[Math.floor(Math.random() * WORD_BANK.length)];

function addLine(board) {
    const newLine = Array(COLS).fill(1);
    return [...board.slice(1), newLine];
}

function removeLine(board) {
    return [Array(COLS).fill(0), ...board.slice(0, -1)];
}

// ================= BOARD =================
function Board({ board, title, overlay }) {
    return (
        <div className="relative">
            {title && <div className="text-center mb-2">{title}</div>}
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

// ================= GAME =================
export default function TypingBattleGame() {
    const [round, setRound] = useState(1);
    const [playerBoard, setPlayerBoard] = useState(emptyBoard());
    const [enemyBoard, setEnemyBoard] = useState(emptyBoard());
    const [words, setWords] = useState(() => Array.from({ length: 5 }, randomWord));      // word bank length
    const [input, setInput] = useState("");
    const [typedWords, setTypedWords] = useState(0);
    const [correctChars, setCorrectChars] = useState(0);
    const [totalChars, setTotalChars] = useState(0);
    const [totalWords, setTotalWords] = useState(0);
    const [correctWords, setCorrectWords] = useState(0);
    const [aiCorrectWords, setAICorrectWords] = useState(0);
    const [startTime, setStartTime] = useState(null);
    const [result, setResult] = useState(null);
    const [roundResults, setRoundResults] = useState([]);
    const [gameStarted, setGameStarted] = useState(false);
    const [countdown, setCountdown] = useState(COUNTDOWN);
    const [wordStatuses, setWordStatuses] = useState(() => Array(7).fill("current"));
    const [wpmHistory, setWpmHistory] = useState([]);
    const [accuracyHistory, setAccuracyHistory] = useState([]);
    const inputRef = useRef(null);

    useEffect(() => {
        if (gameStarted && inputRef.current) {
            inputRef.current.focus();
        }
    }, [gameStarted, round, result]);

    const currentWord = words[0];

    const elapsedMin = startTime ? (Date.now() - startTime) / 60000 : 0;
    const wpm = elapsedMin > 0 ? Math.round((correctChars / 5) / elapsedMin) : 0;
    const accuracy = totalChars ? ((correctChars / totalChars) * 100) : 100;

    // ================= HANDLE SPACE SUBMISSION =================
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
            const newStatus = [...prev];
            newStatus[0] = isCorrect ? "correct" : "incorrect"; // mark first word
            return [...newStatus.slice(1), "current"]; // advance words, new current at end
        });

        setTotalChars((c) => c + value.length);
        if (isCorrect) setCorrectChars((c) => c + value.length);

        if (isCorrect) {
            setCorrectWords((c) => {
                const newCorrect = c + 1;
                if (newCorrect % WORDS_PER_ATTACK === 0)
                    setEnemyBoard((b) => addLine(b));
                if (newCorrect % WORDS_PER_CLEAR === 0)
                    setPlayerBoard((b) => removeLine(b));
                return newCorrect;
            });
            setTotalWords((t) => t + 1);
        }

        // advance word queue
        setWords((w) => [...w.slice(1), randomWord()]);
        setInput("");
    }

    // ================= AI OPPONENT =================
    useEffect(() => {
        if (!gameStarted || result) return;

        const interval = setInterval(() => {
            // AI adds a line to player's board as pressure
            setPlayerBoard((b) => addLine(b));

            // AI "types words" automatically
            setAICorrectWords((c) => {
                const newCount = c + 1;

                // Remove a line every WORDS_PER_CLEAR
                if (newCount % WORDS_PER_CLEAR === 0) {
                    setEnemyBoard((b) => removeLine(b));
                }

                return newCount;
            });
        }, 1200);

        return () => clearInterval(interval);
    }, [gameStarted, result]);


    // ================= WIN / LOSE =================
    useEffect(() => {
        if (!gameStarted) return;
        if (enemyBoard[0].some(Boolean)) finishRound("win");
        if (playerBoard[0].some(Boolean)) finishRound("lose");
    }, [playerBoard, enemyBoard, gameStarted]);

    function finishRound(outcome) {
        if (result) return; // Prevent double finish

        setResult(outcome); // Show win/lose overlay
        setRoundResults((r) => [...r, outcome]); // Save round result

        setWpmHistory((prev) => [...prev, wpm]);
        setAccuracyHistory((prev) => [...prev, accuracy]);


        // After 2 seconds, decide what to do next
        setTimeout(() => {
            if (round < ROUNDS) {
                // Only start next round if there are rounds remaining
                startNextRound();
            } else {
                // All rounds finished, stop game and wait for REPLAY
                setGameStarted(false);
            }
        }, 2000);
    }

    // ================= START / NEXT ROUND =================
    function startNextRound() {
        // Safety check: don't start a new round if all rounds completed
        if (round >= ROUNDS) return;

        // Reset countdown and game state for the next round
        setCountdown(COUNTDOWN);
        setResult(null);
        setPlayerBoard(emptyBoard());
        setEnemyBoard(emptyBoard());
        setTypedWords(0);
        setCorrectChars(0);
        setTotalChars(0);
        setInput("");
        setWords(Array.from({ length: 5 }, randomWord));

        // Countdown timer for the next round
        const countdownInterval = setInterval(() => {
            setCountdown((c) => {
                if (c === 1) {
                    clearInterval(countdownInterval);
                    setGameStarted(true);      // Start next round
                    setStartTime(Date.now());  // Reset timer
                }
                return c - 1;
            });
        }, 1000);

        // Increment round number safely (only if not last round)
        setRound((r) => r + 1);
    }

    // ================= START GAME =================
    function startGame() {
        // Only allow starting the game if it's the first round
        if (round > ROUNDS) return;

        setCountdown(COUNTDOWN);

        const countdownInterval = setInterval(() => {
            setCountdown((c) => {
                if (c === 1) {
                    clearInterval(countdownInterval);
                    setGameStarted(true);      // Start the game
                    setStartTime(Date.now());  // Record start time
                }
                return c - 1;
            });
        }, 1000);
    }

    function replayGame() {
        setRound(1);
        setRoundResults([]);
        setResult(null);
        setPlayerBoard(emptyBoard());
        setEnemyBoard(emptyBoard());
        setAICorrectWords(0);
        setTypedWords(0);
        setCorrectChars(0);
        setTotalChars(0);
        setTotalWords(0);
        setCorrectWords(0);
        setInput("");
        setCountdown(COUNTDOWN);
        setGameStarted(false);
        setWords(Array.from({ length: 5 }, randomWord));
    }

    function average(arr) {
        if (!arr.length) return 0;
        return Math.round(arr.reduce((sum, val) => sum + val, 0) / arr.length);
    }

    const avgWpm = average(wpmHistory);
    const avgAccuracy = average(accuracyHistory);

    const wins = roundResults.filter((r) => r === "win").length;

    return (
        <div className="game-container">
            <h1 className="text-3xl font-bold">Trigger Finger Battle</h1>
            <p>Round {round} / {ROUNDS}</p>

            {/* START BUTTON */}
            {!gameStarted && countdown === COUNTDOWN && round === 1 && (
                <button className="game-button start-button" onClick={startGame}>START</button>
            )}

            {/* COUNTDOWN */}
            {countdown < COUNTDOWN && countdown > 0 && (
                <div className="text-4xl font-bold">{countdown}</div>
            )}

            {/* BOARDS */}
            {(countdown > 0 || gameStarted) && (
                <div className="flex gap-6">
                    <Board board={playerBoard} title="YOU" overlay={result === "lose" ? "YOU LOSE" : null} />
                    <Board board={enemyBoard} title="OPPONENT" overlay={result === "win" ? "YOU WIN" : null} />
                </div>
            )}

            {/* WORD QUEUE */}
            {(gameStarted || countdown > 0) && (
                <div className="word-queue">
                    {words.map((w, i) => {
                        const status = wordStatuses[i]; // "current" | "correct" | "incorrect"
                        return (
                            <span key={i} className={`word-${status}`}>
                                {w}
                            </span>
                        );
                    })}
                </div>

            )}

            {/* INPUT */}
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

            {/* STATS */}
            {gameStarted && (
                <div className="flex text-lg">
                    <div>WPM: {wpm}</div>
                    <div> ACCURACY: {accuracy.toFixed(1)}%</div>
                </div>
            )}

            {/* REPLAY BUTTON */}
            {roundResults.length === ROUNDS && (
                <button
                    className="game-button replay-button"
                    onClick={replayGame}
                >
                    REPLAY
                </button>
            )}

            <AnimatePresence>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-10 text-center">
                    <h2 className="text-4xl font-bold mb-4">
                        {wins > ROUNDS / 2 ? "CONGRATULATIONS!" : "BETTER LUCK NEXT TIME!"}
                    </h2>
                    <p>ROUNDS WON: {wins} / {ROUNDS}</p>
                    <p>AVG WPM: {avgWpm}</p>
                    <p>AVG ACCURACY: {avgAccuracy.toFixed(1)}%</p>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
