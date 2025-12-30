export default function Stats({ results, wpmHistory, accuracyHistory, onReplay }) {
  const average = (arr) =>
    arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0;

  const wins = results.filter((r) => r === "win").length;

  return (
    <div className="game-container text-center">
      <h2 className="mt-35 mb-7 text-4xl font-bold text-cyan-300">
        {wins > results.length / 2 ? "CONGRATULATIONS!" : "BETTER LUCK NEXT TIME!"}
      </h2>

      <p className="mb-7 text-4xl font-bold text-[#ff2d75]">ROUNDS WON: {wins}</p>
      <p className="mb-7 text-4xl font-bold text-[#ff2d75]">AVG WPM: {average(wpmHistory)}</p>
      <p className="mb-7 text-4xl font-bold text-[#ff2d75]">AVG ACCURACY: {average(accuracyHistory).toFixed(1)}%</p>

      <button
        className="mb-7 w-[200px] mx-auto flex justify-center py-3 px-6 mt-8 text-3xl font-bold rounded-lg bg-green-500 text-black 
                   shadow-[0_0_8px_rgba(72, 187, 120, 0.6),0_0_20px_rgba(72, 187, 120, 1)] transition-transform duration-220
                   hover:scale-115 hover:text-white hover:shadow-[0_0_8px_rgba(34,197,94,0.6),0_0_20px_white] cursor-pointer"
        onClick={onReplay}
      >
        REPLAY
      </button>
    </div>
  );
}
