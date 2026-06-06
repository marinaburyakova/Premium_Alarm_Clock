import { useState, useEffect, useRef, useCallback } from "react";
import { Settings, User, Sun, Moon, Plus } from "lucide-react";
import Navigation from "./components/Navigation";
import AnalogDial from "./components/AnalogDial";
import DigitalClock from "./components/DigitalClock";
import AlarmList from "./components/AlarmList";
import Timer from "./components/Timer";
import Dormir from "./components/Dormir";
import AddAlarmModal from "./components/AddAlarmModal";
import gsap from "gsap";
import "./App.css";

function App() {
  // ШАГ 1 ИСПРАВЛЕН: Используем единый строковый идентификатор "alarm"
  const [activeTab, setActiveTab] = useState("alarm"); 
  const [alarms, setAlarms] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState(() => {
    const saved = localStorage.getItem("theme");
    return saved === "dark";
  });
  const containerRef = useRef(null);

  // Флаг для предотвращения перезаписи дефолтных настроек при первой загрузке
  const isInitialMount = useRef(true);

  // Load alarms from localStorage
  useEffect(() => {
    const savedAlarms = localStorage.getItem("alarms_data");
    if (savedAlarms) {
      setAlarms(JSON.parse(savedAlarms));
    } else {
      const defaultAlarms = [
        { id: 1, time: "06:30", label: "в спортзал", days: ["пн", "вт", "ср", "чт", "пт"], enabled: true, repeat: true },
        { id: 2, time: "08:00", label: "Онлайн-встреча", days: ["пн", "вт", "чт", "пт", "сб"], enabled: true, repeat: true },
        { id: 3, time: "09:45", label: "Запись к врачу", days: ["ср"], enabled: true, repeat: false },
      ];
      setAlarms(defaultAlarms);
    }
  }, []);

  // ШАГ 2 ИСПРАВЛЕН: Сохраняем состояние ВСЕГДА (даже пустой массив), пропуская только первый рендер
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    localStorage.setItem("alarms_data", JSON.stringify(alarms));
  }, [alarms]);

  // Apply theme
  useEffect(() => {
    if (isDarkTheme) {
      document.body.classList.add("dark-theme");
      document.body.classList.remove("light-theme");
    } else {
      document.body.classList.add("light-theme");
      document.body.classList.remove("dark-theme");
    }
    localStorage.setItem("theme", isDarkTheme ? "dark" : "light");
  }, [isDarkTheme]);

  // GSAP animation при смене табов
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".bento-grid > *",
        { opacity: 0, y: 30, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.08, ease: "back.out(0.4)" }
      );
    }, containerRef);

    return () => ctx.revert();
  }, [activeTab]);

  const addAlarm = useCallback((time, label, days, repeat) => {
    const newAlarm = {
      id: Date.now(),
      time,
      label: label || "Будильник",
      days: days || ["пн", "вт", "ср", "чт", "пт"],
      enabled: true,
      repeat: repeat || false,
    };

    setAlarms((prevAlarms) => [...prevAlarms, newAlarm]);

    // ШАГ 3 ИСПРАВЛЕН: Запускаем анимацию в следующем макротаске через setTimeout, чтобы React успел отрендерить элемент в DOM
    setTimeout(() => {
      gsap.fromTo(
        ".alarm-card:last-child",
        { scale: 0.9, opacity: 0, y: 20 },
        { scale: 1, opacity: 1, y: 0, duration: 0.4, ease: "back.out(0.5)" }
      );
    }, 0);
  }, []);

  const toggleAlarm = useCallback((id) => {
    setAlarms((prevAlarms) =>
      prevAlarms.map((alarm) => (alarm.id === id ? { ...alarm, enabled: !alarm.enabled } : alarm))
    );

    gsap.to(`[data-alarm-id="${id}"]`, {
      scale: 1.02,
      duration: 0.15,
      yoyo: true,
      repeat: 1,
    });
  }, []);

  const deleteAlarm = useCallback((id) => {
    const element = document.querySelector(`[data-alarm-id="${id}"]`);
    if (element) {
      gsap.to(element, {
        scale: 0.8,
        opacity: 0,
        x: -100,
        duration: 0.3,
        onComplete: () => {
          setAlarms((prevAlarms) => prevAlarms.filter((alarm) => alarm.id !== id));
        },
      });
    } else {
      setAlarms((prevAlarms) => prevAlarms.filter((alarm) => alarm.id !== id));
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setIsDarkTheme((prev) => !prev);
    // ШАГ 4 ИСПРАВЛЕН: Используем "+=360" вместо "360", чтобы кнопка крутилась при каждом клике
    gsap.to(".theme-toggle", {
      rotation: "+=360",
      duration: 0.5,
      ease: "back.out(0.5)",
    });
  }, []);

  return (
    <>
      <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
        {isDarkTheme ? <Sun size={24} color="#FFD700" /> : <Moon size={24} color="#161A25" />}
      </button>

      <div className="app-container" ref={containerRef}>
        <div className="phone-frame">
          <div className="bento-grid">
            <div className="header-actions">
              <button className="icon-button" aria-label="Settings">
                <Settings size={22} color={isDarkTheme ? "#e0e5ec" : "#161A25"} opacity={0.6} />
              </button>
              <button className="icon-button right" aria-label="Profile">
                <User size={22} color={isDarkTheme ? "#e0e5ec" : "#161A25"} opacity={0.6} />
              </button>
            </div>

            <div className="navigation-wrapper">
              <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
            </div>

            <div className="dial-section">
              <AnalogDial isDarkTheme={isDarkTheme} />
            </div>

            <div className="digital-clock-section">
              <DigitalClock isDarkTheme={isDarkTheme} />
            </div>

            <div className="content-cards">
              {/* ШАГ 1 ИСПРАВЛЕН ТУТ: Теперь вкладки совпадают */}
              {activeTab === "alarm" && (
                <AlarmList alarms={alarms} onToggle={toggleAlarm} onDelete={deleteAlarm} isDarkTheme={isDarkTheme} />
              )}
              {activeTab === "timer" && <Timer isDarkTheme={isDarkTheme} />}
              {activeTab === "dormir" && <Dormir isDarkTheme={isDarkTheme} />}
            </div>

            {activeTab === "alarm" && (
              <button className="add-button" onClick={() => setIsModalOpen(true)} aria-label="Добавить будильник">
                <Plus size={28} color="#F2F4F8" strokeWidth={2.5} />
              </button>
            )}
          </div>
        </div>

        <AddAlarmModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={addAlarm}
          isDarkTheme={isDarkTheme}
        />
      </div>
    </>
  );
}

export default App;
