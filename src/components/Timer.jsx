import {useReducer, useEffect, useRef} from "react";
import {Play, Pause, RotateCcw} from "lucide-react";
import gsap from "gsap";

const timerReducer = (state, action) => {
  switch (action.type) {
    case "TICK":
      return {...state, seconds: Math.max(0, state.seconds - 1)};
    case "SET_TIMER":
      return {
        ...state,
        seconds: action.minutes * 60,
        inputMinutes: action.minutes,
        isActive: false,
        isCompleted: false,
      };
    case "TOGGLE":
      if (state.seconds === 0) {
        return {...state, seconds: state.inputMinutes * 60, isActive: !state.isActive, isCompleted: false};
      }
      return {...state, isActive: !state.isActive};
    case "RESET":
      return {
        ...state,
        seconds: state.inputMinutes * 60,
        isActive: false,
        isCompleted: false,
      };
    case "COMPLETE":
      return {...state, isActive: false, isCompleted: true};
    default:
      return state;
  }
};

function Timer() {
  const [state, dispatch] = useReducer(timerReducer, {
    seconds: 1500,
    isActive: false,
    inputMinutes: 25,
    isCompleted: false,
  });

  const timerRef = useRef(null);
  const notificationSentRef = useRef(false);

  // Эффект для управления интервалом
  useEffect(() => {
    if (state.isActive && state.seconds > 0) {
      timerRef.current = setInterval(() => {
        dispatch({type: "TICK"});
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [state.isActive, state.seconds]); // ✅ Добавлена зависимость state.seconds

  // Эффект для отслеживания завершения таймера
  useEffect(() => {
    if (state.seconds === 0 && state.isActive && !notificationSentRef.current) {
      notificationSentRef.current = true;

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      dispatch({type: "COMPLETE"});

      // Анимация завершения
      gsap.to(".timer-time", {
        scale: 1.1,
        repeat: 3,
        yoyo: true,
        duration: 0.2,
        ease: "power2.inOut",
      });

      // Уведомление
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("Таймер завершен!", {
          body: `Время ${state.inputMinutes} минут истекло`,
          icon: "/timer-icon.png",
        });
      }
    } else if (state.seconds > 0) {
      notificationSentRef.current = false;
    }
  }, [state.seconds, state.isActive, state.inputMinutes]); // ✅ Все зависимости включены

  // Запрос разрешения на уведомления
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="timer-card" style={{flexDirection: "column", padding: "30px 20px"}}>
      <div className="timer-display">
        <div className="timer-time">{formatTime(state.seconds)}</div>
        <div style={{display: "flex", gap: "12px", justifyContent: "center", marginBottom: "20px", flexWrap: "wrap"}}>
          {[5, 10, 15, 25, 30, 45, 60].map((min) => (
            <button
              key={min}
              className="timer-btn"
              onClick={() => {
                if (timerRef.current) {
                  clearInterval(timerRef.current);
                  timerRef.current = null;
                }
                dispatch({type: "SET_TIMER", minutes: min});
              }}
              style={{
                padding: "8px 16px",
                fontSize: "14px",
                background:
                  state.inputMinutes === min && !state.isActive
                    ? "linear-gradient(135deg, #0D8AFC 32.14%, #33F0B0 145.63%)"
                    : undefined,
                color: state.inputMinutes === min && !state.isActive ? "white" : undefined,
              }}
            >
              {min}min
            </button>
          ))}
        </div>
        <div className="timer-controls">
          <button
            className="timer-btn"
            onClick={() => dispatch({type: "TOGGLE"})}
            aria-label={state.isActive ? "Пауза" : "Старт"}
          >
            {state.isActive ? <Pause size={20} /> : <Play size={20} />}
          </button>
          <button
            className="timer-btn"
            onClick={() => {
              if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
              }
              dispatch({type: "RESET"});
            }}
            aria-label="Сброс"
          >
            <RotateCcw size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default Timer;
