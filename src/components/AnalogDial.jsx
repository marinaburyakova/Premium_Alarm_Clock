import React, { useEffect, useRef, useCallback } from "react";
import gsap from "gsap";

function AnalogDial({ isDarkTheme }) {
  const dialRef = useRef(null);
  const hourHandRef = useRef(null);
  const minuteHandRef = useRef(null);
  const secondHandRef = useRef(null);

  const updateClock = useCallback(() => {
    const now = new Date();
    const hours = now.getHours() % 12;
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();

    const hourDeg = hours * 30 + minutes * 0.5;
    const minuteDeg = minutes * 6;
    const secondDeg = seconds * 6;

    if (hourHandRef.current && minuteHandRef.current && secondHandRef.current) {
      // Используем set для мгновенного обновления без анимации для секунд
      gsap.set(secondHandRef.current, { rotation: secondDeg });
      gsap.to(hourHandRef.current, { rotation: hourDeg, duration: 0.3, ease: "power2.out" });
      gsap.to(minuteHandRef.current, { rotation: minuteDeg, duration: 0.3, ease: "power2.out" });
    }
  }, []);

  useEffect(() => {
    // Анимация появления циферблата
    gsap.fromTo(
      dialRef.current,
      { scale: 0.8, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.8, ease: "back.out(0.6)" }
    );

    // Инициализация позиции стрелок
    updateClock();
    
    // Запуск интервала
    const interval = setInterval(updateClock, 1000);
    
    return () => {
      clearInterval(interval);
      // Очищаем все анимации GSAP при размонтировании
      if (hourHandRef.current) gsap.killTweensOf(hourHandRef.current);
      if (minuteHandRef.current) gsap.killTweensOf(minuteHandRef.current);
      if (secondHandRef.current) gsap.killTweensOf(secondHandRef.current);
    };
  }, [updateClock]);

  return (
    <div className="circle" ref={dialRef}>
      <img
        src="/clock-face.svg"
        alt="Clock face"
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          objectFit: "contain",
          pointerEvents: "none", // Чтобы изображение не мешало кликам
        }}
      />

      {/* Часовая стрелка */}
      <div
        ref={hourHandRef}
        style={{
          position: "absolute",
          width: "8px",
          height: "76px",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -100%)",
          background: "linear-gradient(154.09deg, #0D8AFC 30.87%, #33F0B0 85.78%)",
          borderRadius: "4px",
          transformOrigin: "bottom center",
          boxShadow: "10px 4px 10px rgba(0, 0, 0, 0.14)",
          zIndex: 10,
        }}
      />

      {/* Минутная стрелка */}
      <div
        ref={minuteHandRef}
        style={{
          position: "absolute",
          width: "6px",
          height: "110px",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -100%)",
          background: "linear-gradient(154.09deg, #0D8AFC 30.87%, #33F0B0 85.78%)",
          borderRadius: "3px",
          transformOrigin: "bottom center",
          boxShadow: "10px 4px 10px rgba(0, 0, 0, 0.14)",
          zIndex: 10,
        }}
      />

      {/* Секундная стрелка */}
      <div
        ref={secondHandRef}
        style={{
          position: "absolute",
          width: "3px",
          height: "125px",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -100%) rotate(0deg)", // Явно указываем начальную позицию
          background: isDarkTheme ? "#ff2e9e" : "#FF4444",
          borderRadius: "1.5px",
          transformOrigin: "bottom center",
          boxShadow: isDarkTheme ? "0 0 10px rgba(255, 46, 158, 0.5)" : "0 0 4px rgba(255, 68, 68, 0.5)",
          zIndex: 10,
        }}
      >
        {/* Противовес секундной стрелки */}
        <div
          style={{
            position: "absolute",
            bottom: "-20px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "10px",
            height: "10px",
            background: isDarkTheme ? "#ff2e9e" : "#FF4444",
            borderRadius: "50%",
          }}
        />
      </div>

      {/* Центральная точка (внешняя) */}
      <div
        style={{
          position: "absolute",
          width: "22px",
          height: "22px",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          background: "linear-gradient(135deg, #0D8AFC 32.14%, #33F0B0 145.63%)",
          borderRadius: "50%",
          boxShadow: "4px 4px 10px rgba(0, 0, 0, 0.15)",
          zIndex: 15,
        }}
      />

      {/* Центральная точка (внутренняя) */}
      <div
        style={{
          position: "absolute",
          width: "8px",
          height: "8px",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          background: isDarkTheme ? "#1a1f2e" : "#ffffff",
          borderRadius: "50%",
          zIndex: 16,
        }}
      />
    </div>
  );
}

export default AnalogDial;