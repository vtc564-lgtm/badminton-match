import './App.css';
import { useState } from 'react';
import { useStorage } from './hooks/useStorage';
import { PlayerRegistration } from './components/PlayerRegistration';
import { GameMatching } from './components/GameMatching';

type Tab = 'register' | 'match';

function App() {
  const { state, setState, exportData, importData } = useStorage();
  const [tab, setTab] = useState<Tab>('register');
  const [importMessage, setImportMessage] = useState<string | null>(null);

  const handleImport = async (file: File) => {
    try {
      await importData(file);
      setImportMessage('데이터를 불러왔습니다.');
    } catch (error) {
      setImportMessage(error instanceof Error ? error.message : '가져오기 실패');
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-brand">
          <span className="header-icon" aria-hidden="true">
            🏸
          </span>
          <div>
            <p className="header-kicker">Badminton Matcher</p>
            <h1>배드민턴 게임 매칭</h1>
          </div>
        </div>
        <nav className="tab-nav" aria-label="메인 메뉴">
          <button
            type="button"
            className={tab === 'register' ? 'tab active' : 'tab'}
            onClick={() => setTab('register')}
          >
            선수 등록
          </button>
          <button
            type="button"
            className={tab === 'match' ? 'tab active' : 'tab'}
            onClick={() => setTab('match')}
          >
            게임 매칭
          </button>
        </nav>
      </header>

      <section className="sync-bar">
        <p>PC·모바일 브라우저에 자동 저장됩니다. 기기 간 동기화는 JSON 내보내기/가져오기를 사용하세요.</p>
        <div className="sync-actions">
          <button type="button" className="ghost-button" onClick={exportData}>
            JSON 내보내기
          </button>
          <label className="ghost-button file-label">
            JSON 가져오기
            <input
              type="file"
              accept="application/json,.json"
              hidden
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void handleImport(file);
                event.target.value = '';
              }}
            />
          </label>
        </div>
        {importMessage && <p className="import-message">{importMessage}</p>}
      </section>

      <main className="app-main">
        {tab === 'register' ? (
          <PlayerRegistration state={state} setState={setState} />
        ) : (
          <GameMatching state={state} setState={setState} />
        )}
      </main>
    </div>
  );
}

export default App;
