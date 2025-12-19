export default function Menu({ onStart }) {
  return (
    <div className="game-container text-center">
      <h1 className="text-4xl font-bold mb-6">Trigger Finger Battle</h1>
      <button
        className="game-button start-button"
        onClick={onStart}
      >
        START GAME
      </button>
    </div>
  );
}
