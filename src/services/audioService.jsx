class AudioService {
  constructor() {
    this.audioContext = null;
    this.oscillator = null;
    this.gainNode = null;
    this.isPlaying = false;
  }

  init() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.gainNode = this.audioContext.createGain();
      this.gainNode.connect(this.audioContext.destination);
      this.gainNode.gain.value = 0.3;
    }
  }

  playAlarmSound() {
    this.init();

    if (this.oscillator) {
      this.stopAlarmSound();
    }

    const now = this.audioContext.currentTime;
    this.oscillator = this.audioContext.createOscillator();
    this.oscillator.type = "sine";
    this.oscillator.frequency.value = 880;
    this.oscillator.connect(this.gainNode);
    this.oscillator.start();

    // Create beeping effect
    this.beepInterval = setInterval(() => {
      if (this.gainNode) {
        this.gainNode.gain.value = this.gainNode.gain.value === 0.3 ? 0 : 0.3;
      }
    }, 500);

    this.isPlaying = true;

    // Auto-stop after 30 seconds
    setTimeout(() => {
      if (this.isPlaying) {
        this.stopAlarmSound();
      }
    }, 30000);
  }

  stopAlarmSound() {
    if (this.oscillator) {
      this.oscillator.stop();
      this.oscillator.disconnect();
      this.oscillator = null;
    }
    if (this.beepInterval) {
      clearInterval(this.beepInterval);
      this.beepInterval = null;
    }
    if (this.gainNode) {
      this.gainNode.gain.value = 0;
    }
    this.isPlaying = false;
  }

  playTimerComplete() {
    this.init();

    const now = this.audioContext.currentTime;
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.value = 523.25; // C5
    gainNode.gain.value = 0.3;

    oscillator.start();
    gainNode.gain.exponentialRampToValueAtTime(0.00001, now + 1.5);
    oscillator.stop(now + 1.5);
  }
}

export default new AudioService();
