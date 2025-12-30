export default function Menu({ onStart }) {
  return (
    <div className="flex flex-col items-center justify-center w-full min-h-screen bg-transparent overflow-x-hidden -mt-16">
      
      {/* Title */}
      <h1
        className="w-[700px] p-3 text-5xl font-bold italic underline flex justify-center text-gray-900 bg-cyan-500 rounded-[20px] 
                   shadow-[0_0_8px_rgba(79,195,220,0.6),0_0_20px_rgba(79,195,220,1)] transition-transform duration-500
                   hover:scale-105 hover:bg-[#8ee0f0] hover:text-white hover:shadow-[0_0_8px_rgba(79,195,220,0.6),0_0_20px_white]"
        style={{
          fontFamily: '"Lucida Console", "Courier New", monospace',
          animation: 'titleAnimation 1.5s forwards',
        }}
      >
        Trigger Finger Battle
      </h1>

      {/* Start Button */}
      <button
        className="w-[250px] py-3 px-6 mt-8 text-3xl font-bold flex justify-center rounded-lg bg-pink-500 text-black 
                   shadow-[0_0_8px_rgba(255,45,117,0.6),0_0_20px_rgba(255,45,117,1)] transition-transform duration-220
                   hover:scale-115 hover:text-white hover:shadow-[0_0_8px_rgba(255,45,117,0.6),0_0_20px_white] cursor-pointer"
        style={{
          fontFamily: '"Lucida Console", "Courier New", monospace',
          animation: 'startButton 2s forwards',
        }}
        onClick={onStart}
      >
        START GAME
      </button>

      {/* Keyframe Animations */}
      <style jsx>{`
        @keyframes titleAnimation {
          0% { left: -100%; }
          100% { left: 26%; }
        }
        @keyframes startButton {
          0% { left: -100%; }
          100% { left: 43%; }
        }
      `}</style>
    </div>
  );
}
