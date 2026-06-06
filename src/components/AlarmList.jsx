import React, { useEffect, useCallback, useRef } from 'react'
import { Trash2 } from 'lucide-react'
import gsap from 'gsap'
import audioService from '../services/audioService'

function AlarmList({ alarms, onToggle, onDelete, isDarkTheme }) {
  const intervalRef = useRef(null)
  const checkedAlarmsRef = useRef(new Set()) // Для предотвращения повторных срабатываний

  const daysMap = {
    пн: 'Пн',
    вт: 'Вт',
    ср: 'Ср',
    чт: 'Чт',
    пт: 'Пт',
    сб: 'Сб',
    вс: 'Вс',
  }

  const daysOfWeek = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб']

  const handleMouseEnter = useCallback((e) => {
    gsap.to(e.currentTarget, {
      scale: 1.02,
      duration: 0.2,
      ease: 'power2.out',
    })
  }, [])

  const handleMouseLeave = useCallback((e) => {
    gsap.to(e.currentTarget, {
      scale: 1,
      duration: 0.2,
      ease: 'power2.out',
    })
  }, [])

  // Функция проверки будильников
  const checkAlarms = useCallback(() => {
    const now = new Date()
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
    const currentDayIndex = now.getDay() // 0 = воскресенье
    const currentDay = daysOfWeek[currentDayIndex]

    alarms.forEach((alarm) => {
      // Создаем уникальный ключ для будильника на эту минуту
      const alarmKey = `${alarm.id}_${currentTime}`

      if (alarm.enabled && alarm.time === currentTime) {
        const shouldRing = alarm.repeat
          ? alarm.days?.includes(currentDay)
          : true

        // Проверяем, не сработал ли уже этот будильник в эту минуту
        if (shouldRing && !checkedAlarmsRef.current.has(alarmKey)) {
          // Отмечаем, что будильник сработал
          checkedAlarmsRef.current.add(alarmKey)

          // Воспроизводим звук
          audioService.playAlarmSound()

          // Показываем уведомление
          if (
            'Notification' in window &&
            Notification.permission === 'granted'
          ) {
            const notificationTitle = alarm.label || 'Будильник'
            const notificationBody = alarm.repeat
              ? `Повторяющийся будильник на ${currentTime}`
              : `Будильник на ${currentTime}`

            new Notification(notificationTitle, {
              body: notificationBody,
              icon: '/alarm-icon.png',
              silent: false,
            })
          }

          // Автоматически отключаем одноразовые будильники
          if (!alarm.repeat) {
            setTimeout(() => {
              onToggle(alarm.id)
            }, 1000) // Небольшая задержка перед отключением
          }

          // Очищаем ключ через минуту, чтобы будильник мог сработать на следующий день
          setTimeout(() => {
            checkedAlarmsRef.current.delete(alarmKey)
          }, 61000) // Чуть больше минуты
        }
      } else {
        // Если время не совпадает, удаляем ключ для этого будильника
        const keysToDelete = Array.from(checkedAlarmsRef.current).filter(
          (key) => key.startsWith(`${alarm.id}_`),
        )
        keysToDelete.forEach((key) => checkedAlarmsRef.current.delete(key))
      }
    })
  }, [alarms, onToggle])

  // Запуск интервала проверки будильников
  useEffect(() => {
    // Первая проверка сразу после монтирования
    checkAlarms()

    // Запускаем интервал
    intervalRef.current = setInterval(checkAlarms, 60000)

    // Очистка интервала при размонтировании
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [checkAlarms]) // checkAlarms обновляется при изменении alarms

  // Запрос разрешения на уведомления
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  // Очистка сработавших будильников при изменении списка
  useEffect(() => {
    // Удаляем ключи для будильников, которых больше нет
    const activeAlarmIds = new Set(alarms.map((alarm) => alarm.id))
    const keysToDelete = Array.from(checkedAlarmsRef.current).filter((key) => {
      const alarmId = key.split('_')[0]
      return !activeAlarmIds.has(parseInt(alarmId))
    })
    keysToDelete.forEach((key) => checkedAlarmsRef.current.delete(key))
  }, [alarms])

  if (alarms.length === 0) {
    return (
      <div className="empty-state">
        <p style={{ textAlign: 'center', opacity: 0.6, marginTop: '40px' }}>
          Будильник не настроен
        </p>
      </div>
    )
  }

  return (
    <div className="alarm-list">
      {alarms.map((alarm) => (
        <div
          key={alarm.id}
          className="alarm-card"
          data-alarm-id={alarm.id}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className="alarm-info">
            <div className="alarm-time">{alarm.time}</div>
            {alarm.label && <div className="alarm-label">{alarm.label}</div>}
            <div className="alarm-days">
              {alarm.repeat ? (
                Object.entries(daysMap).map(([key, label]) => (
                  <span
                    key={key}
                    className={`day-badge ${alarm.days?.includes(key) ? 'active' : ''}`}
                  >
                    {label}
                  </span>
                ))
              ) : (
                <span className="day-badge single">Разовое</span>
              )}
            </div>
          </div>
          <div className="alarm-actions">
            <div
              className={`toggle-switch ${alarm.enabled ? 'active' : ''}`}
              onClick={() => onToggle(alarm.id)}
              role="switch"
              aria-checked={alarm.enabled}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onToggle(alarm.id)
                }
              }}
            >
              <div className="toggle-knob"></div>
            </div>
            <button
              className="delete-btn"
              onClick={() => onDelete(alarm.id)}
              aria-label="Delete alarm"
              onMouseEnter={(e) => {
                gsap.to(e.currentTarget, {
                  scale: 1.1,
                  duration: 0.2,
                  ease: 'power2.out',
                })
              }}
              onMouseLeave={(e) => {
                gsap.to(e.currentTarget, {
                  scale: 1,
                  duration: 0.2,
                  ease: 'power2.out',
                })
              }}
            >
              <Trash2
                size={20}
                color={isDarkTheme ? '#e0e5ec' : '#161A25'}
                opacity={0.5}
              />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

export default AlarmList
