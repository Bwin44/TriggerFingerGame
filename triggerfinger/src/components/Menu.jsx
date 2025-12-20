export default function Menu({ onStart }) {
  return (
    <div className="menu-container">
      <h1 className="menu-title">Trigger Finger Battle</h1>
      <button
        className="menu-button-start"
        onClick={onStart}
      >
        START GAME
      </button>
    </div>
  );
}
