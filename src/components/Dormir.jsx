import { useState, useRef, useEffect } from 'react'
import { Moon, Volume2, VolumeX } from 'lucide-react'
import gsap from 'gsap'

// Выносим массив за компонент, чтобы он не пересоздавался при каждом рендере
const SOUNDS = [
  {
    id: 'white-noise',
    label: 'Ритмика',
    icon: '🎧',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  },
  {
    id: 'rain',
    label: 'Энергия ',
    icon: '🎶',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
  },
  {
    id: 'waves',
    label: 'Бодрость',
    icon: '🎵',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
  },
  {
    id: 'fireplace',
    label: 'Огонь',
    icon: '🔥',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-17.mp3',
  },
]

function Dormir({ isDarkTheme }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [soundType, setSoundType] = useState('white-noise')
  const [volume, setVolume] = useState(0.5)

  // Храним сам объект Audio в ref
  const audioInstanceRef = useRef(null)

  // Синхронизация воспроизведения, смены трека и очистки при размонтировании
  useEffect(() => {
    if (audioInstanceRef.current) {
      audioInstanceRef.current.pause()
      audioInstanceRef.current = null
    }

    if (isPlaying) {
      const selectedSound = SOUNDS.find((s) => s.id === soundType)
      if (selectedSound) {
        const audio = new Audio(selectedSound.url)
        audio.loop = true
        audio.volume = volume
        audio
          .play()
          .catch((err) =>
            console.log('Автовоспроизведение заблокировано браузером:', err),
          )
        audioInstanceRef.current = audio
      }
    }

    // Функция очистки: выключит звук, если компонент удалится с экрана
    return () => {
      if (audioInstanceRef.current) {
        audioInstanceRef.current.pause()
      }
    }
  }, [isPlaying, soundType]) // Реагирует строго на изменение этих стейтов

  // Синхронизация громкости без перезапуска аудио
  useEffect(() => {
    if (audioInstanceRef.current) {
      audioInstanceRef.current.volume = volume
    }
  }, [volume])

  const togglePlay = () => {
    setIsPlaying(!isPlaying)

    gsap.fromTo(
      '.dormir-card',
      { scale: 0.98, opacity: 0.9 },
      { scale: 1, opacity: 1, duration: 0.3, ease: 'power2.out' },
    )
  }

  const changeSound = (id) => {
    setSoundType(id)
  }

  const changeVolume = (e) => {
    setVolume(parseFloat(e.target.value))
  }

  return (
    <div
      className="dormir-card"
      style={{ flexDirection: 'column', padding: '25px' }}
    >
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <Moon
          size={48}
          color="#0D8AFC"
          opacity={0.8}
        />
        <h3
          style={{
            marginTop: '12px',
            color: isDarkTheme ? '#e0e5ec' : '#161A25',
            opacity: 0.7,
          }}
        >
          Звуки
        </h3>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '12px',
          marginBottom: '24px',
        }}
      >
        {SOUNDS.map((sound) => (
          <button
            key={sound.id}
            className={`timer-btn ${soundType === sound.id ? 'active' : ''}`}
            onClick={() => changeSound(sound.id)}
            style={{
              padding: '12px',
              background:
                soundType === sound.id
                  ? 'linear-gradient(135deg, #0D8AFC 32.14%, #33F0B0 145.63%)'
                  : undefined,
              color:
                soundType === sound.id
                  ? 'white'
                  : isDarkTheme
                    ? '#e0e5ec'
                    : '#161A25',
            }}
          >
            <span style={{ fontSize: '24px', display: 'block' }}>
              {sound.icon}
            </span>
            <span style={{ fontSize: '12px', marginTop: '4px' }}>
              {sound.label}
            </span>
          </button>
        ))}
      </div>

      <div style={{ marginBottom: '20px' }}>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={changeVolume}
          style={{ width: '100%' }}
        />
        <div
          style={{
            fontSize: '12px',
            textAlign: 'center',
            marginTop: '5px',
            opacity: 0.6,
          }}
        >
          Громкость: {Math.round(volume * 100)}%
        </div>
      </div>

      <button
        className="timer-btn"
        onClick={togglePlay}
        style={{ width: '100%', padding: '14px' }}
      >
        {isPlaying ? <VolumeX size={20} /> : <Volume2 size={20} />}
        <span style={{ marginLeft: '8px' }}>
          {isPlaying ? 'Стоп' : 'Старт'}
        </span>
      </button>

      <div
        style={{
          marginTop: '16px',
          fontSize: '13px',
          textAlign: 'center',
          opacity: 0.4,
        }}
      >
         Энергия пробуждения. Добавь импульс в свой день!
      </div>
    </div>
  )
}

export default Dormir
