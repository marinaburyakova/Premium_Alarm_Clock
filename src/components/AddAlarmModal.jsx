import { useState, useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import gsap from 'gsap'

function AddAlarmModal({ isOpen, onClose, onSave, isDarkTheme }) {
  const [time, setTime] = useState('07:00')
  const [label, setLabel] = useState('')
  const [selectedDays, setSelectedDays] = useState([
    'пн',
    'вт',
    'ср',
    'чт',
    'пт',
  ])
  const [repeat, setRepeat] = useState(true)
  const modalRef = useRef(null)

  const daysOfWeek = [
    { id: 'пн', label: 'Пн' },
    { id: 'вт', label: 'Вт' },
    { id: 'ср', label: 'Ср' },
    { id: 'чт', label: 'Чт' },
    { id: 'пт', label: 'Пт' },
    { id: 'сб', label: 'Сб' },
    { id: 'вс', label: 'Вс' },
  ]

  useEffect(() => {
    if (isOpen && modalRef.current) {
      gsap.fromTo(
        modalRef.current,
        { scale: 0.8, opacity: 0, y: 50 },
        { scale: 1, opacity: 1, y: 0, duration: 0.4, ease: 'back.out(0.4)' },
      )
    }
  }, [isOpen])

  // Очистка формы при закрытии
  useEffect(() => {
    if (!isOpen) {
      setTime('07:00')
      setLabel('')
      setSelectedDays(['пн', 'вт', 'ср', 'чт', 'пт'])
      setRepeat(true)
    }
  }, [isOpen])

  const toggleDay = (dayId) => {
    if (selectedDays.includes(dayId)) {
      setSelectedDays(selectedDays.filter((d) => d !== dayId))
    } else {
      setSelectedDays([...selectedDays, dayId])
    }
  }

  const handleSave = () => {
    if (time && time.trim()) {
      onSave(time, label, selectedDays, repeat)
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
    >
      <div
        className="modal-content"
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
          }}
        >
          <h3 style={{ margin: 0, fontFamily: 'Open Sans', fontWeight: 600 }}>
            Добавить будильник
          </h3>
          <button
            onClick={onClose}
            style={{ 
              background: 'none', 
              border: 'none', 
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '8px',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = isDarkTheme ? '#2a2f3a' : '#f0f2f5'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            <X
              size={24}
              color={isDarkTheme ? '#e0e5ec' : '#161A25'}
              opacity={0.6}
            />
          </button>
        </div>

        <input
          type="time"
          className="modal-input"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          step="60"
        />

        <input
          type="text"
          className="modal-input"
          placeholder="Добавить заметку"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
        />

        <div style={{ marginBottom: '20px' }}>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '15px',
              cursor: 'pointer',
            }}
          >
            <input
              type="checkbox"
              checked={repeat}
              onChange={(e) => setRepeat(e.target.checked)}
              style={{ width: '20px', height: '20px', cursor: 'pointer' }}
            />
            <span style={{ fontFamily: 'Open Sans', fontWeight: 600 }}>
              Повторять еженедельно
            </span>
          </label>

          <div className="days-selector">
            {daysOfWeek.map((day) => (
              <button
                key={day.id}
                className={`day-button ${selectedDays.includes(day.id) ? 'active' : ''}`}
                onClick={() => toggleDay(day.id)}
                disabled={!repeat}
                style={{ 
                  opacity: !repeat ? 0.5 : 1,
                  cursor: !repeat ? 'not-allowed' : 'pointer'
                }}
              >
                {day.label}
              </button>
            ))}
          </div>
        </div>

        <div className="modal-actions">
          <button
            className="modal-btn"
            onClick={onClose}
          >
            Отменить
          </button>
          <button
            className="modal-btn confirm"
            onClick={handleSave}
          >
            Сохранить
          </button>
        </div>
      </div>
    </div>
  )
}

export default AddAlarmModal