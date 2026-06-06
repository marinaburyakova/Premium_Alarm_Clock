
import { Bell, Timer as TimerIcon, Moon } from 'lucide-react';

function Navigation({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'alarm', label: 'Alarme', icon: Bell },
    { id: 'timer', label: 'Timer', icon: TimerIcon },
    { id: 'dormir', label: 'Dormir', icon: Moon }
  ];

  return (
    <div className="nav-tabs">
      {tabs.map(tab => (
        <button
          key={tab.id}
          className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => setActiveTab(tab.id)}
          aria-label={tab.label}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

export default Navigation;