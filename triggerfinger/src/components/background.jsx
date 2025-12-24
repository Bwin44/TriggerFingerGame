import { useEffect, useState } from "react";
import "../assets/background.css";

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
  "PEOPLE","DOES","HERE","YOUR","WHERE","WHEN","US","ALL","HOW","HAS","MORE","THAN",
  "HEAR","ASK","SEE","SAY","DO","WHOLE","YET","EACH","THROUGH","TOGETHER","MAY",
  "NEED","SOME","WILL","CAN","UP","DOWN","AWAY","BELOW","ABOVE","ALWAYS","NEVER",
  "HERE","LITTLE","LESS","GREAT","WALK","RUN","FIND","LOOK","SIT","STAY","MOVE",
  "LEAVE","ENTER","FEEL","USE","TAKE","GIVE","RECEIVE","BEGIN","END","CHOOSE","MAKE",
  "HAVE","REMAIN","CREATE","BUILD","START","FINISH","MOVE","SLOW","FAST","ACT","FEEL",
  "THINK","IMAGINE","REMEMBER","SHOW","PROVE","ANSWER","TURN","HOLD","AGAIN","EXPLAIN",
  "HELP","WAIT","SING","DANCE","SLEEP","WAKE","CLOSE","OPEN","NEED","WAIT","ENJOY","CREATE"
];

const randomBetween = (min, max) =>
  Math.random() * (max - min) + min;

export default function Background({
  activePlayer = 1,
  visible = true
}) {
  const [words, setWords] = useState([]);

  /* Spawn words continuously */
  useEffect(() => {
    if (!visible) return;

    const interval = setInterval(() => {
      setWords(prev => [
        ...prev,
        {
          id: crypto.randomUUID(),
          text: WORD_BANK[Math.floor(Math.random() * WORD_BANK.length)],
          x: randomBetween(0, 95),
          speed: randomBetween(8, 22),
          size: randomBetween(0.9, 1.4)
        }
      ]);
    }, 750);

    return () => clearInterval(interval);
  }, [visible]);

  /* Remove words after animation completes */
  const handleAnimationEnd = (id) => {
    setWords(prev => prev.filter(w => w.id !== id));
  };

  return (
    <div className={`background ${visible ? "visible" : "hidden"}`}>
      <div className="background-container">
        {words.map(word => (
          <span
            key={word.id}
            className={`floating-word player-${activePlayer}`}
            style={{
              "--x": word.x,
              "--speed": word.speed,
              "--scale": word.size
            }}
            onAnimationEnd={() => handleAnimationEnd(word.id)}
          >
            {word.text}
          </span>
        ))}
      </div>
    </div>
  );
}
