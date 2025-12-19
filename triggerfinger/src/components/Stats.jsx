export default function Stats({ results, wpmHistory, accuracyHistory, onReplay }) {
  const average = (arr) =>
    arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0;

  const wins = results.filter((r) => r === "win").length;

  return (
    <div className="game-container text-center">
      <h2 className="text-4xl font-bold mb-4">
        {wins > results.length / 2 ? "CONGRATULATIONS!" : "BETTER LUCK NEXT TIME!"}
      </h2>

      <p>ROUNDS WON: {wins} / {results.length}</p>
      <p>AVG WPM: {average(wpmHistory)}</p>
      <p>AVG ACCURACY: {average(accuracyHistory).toFixed(1)}%</p>

      <button
        className="game-button replay-button mt-6"
        onClick={onReplay}
      >
        REPLAY
      </button>
    </div>
  );
}
