import { useState, type Dispatch, type SetStateAction } from 'react';
import type { AppState } from '../types';
import { createMatchRound } from '../utils/matching';
import { calculateSkillScore } from '../utils/skillScore';

interface Props {
  state: AppState;
  setState: Dispatch<SetStateAction<AppState>>;
}

function formatPlayerLine(player: { name: string; gender: string; age: number; grade: string }) {
  const gender = player.gender === 'male' ? '남' : '여';
  return `${player.name} (${gender}, ${player.age}세, ${player.grade})`;
}

export function GameMatching({ state, setState }: Props) {
  const [courtCount, setCourtCount] = useState(2);
  const [error, setError] = useState<string | null>(null);

  const activePlayers = state.players.filter((player) => player.playingToday);
  const latestRound = state.matchHistory[0] ?? null;
  const maxCourts = Math.max(1, Math.floor(activePlayers.length / 4));

  const runMatching = () => {
    setError(null);
    const result = createMatchRound(state.players, courtCount);

    if (!result || result.round.matches.length === 0) {
      setError('매칭하려면 오늘 출전 선수가 최소 4명 이상 필요합니다.');
      return;
    }

    setState((prev) => ({
      players: result.updatedPlayers,
      matchHistory: [result.round, ...prev.matchHistory].slice(0, 20),
    }));
  };

  const clearHistory = () => {
    setState((prev) => ({ ...prev, matchHistory: [] }));
  };

  return (
    <div className="match-layout">
      <section className="panel control-panel">
        <div className="panel-head">
          <h2>게임 매칭</h2>
          <p>코트 수만큼 4인 더블 경기를 구성합니다. 팀은 실력 점수 합이 비슷하도록 자동 배치됩니다.</p>
        </div>

        <div className="match-stats">
          <div className="stat-card">
            <span>오늘 출전</span>
            <strong>{activePlayers.length}명</strong>
          </div>
          <div className="stat-card">
            <span>최대 코트</span>
            <strong>{maxCourts}코트</strong>
          </div>
          <div className="stat-card">
            <span>휴식 우선</span>
            <strong>{activePlayers.filter((player) => player.restedLastRound).length}명</strong>
          </div>
        </div>

        <div className="court-control">
          <label>
            코트 수
            <input
              type="number"
              min={1}
              max={Math.max(1, maxCourts)}
              value={courtCount}
              onChange={(event) => setCourtCount(Math.max(1, Number(event.target.value) || 1))}
            />
          </label>
          <button type="button" className="primary-button large" onClick={runMatching}>
            매칭 시작
          </button>
        </div>

        {error && <p className="error-message">{error}</p>}

        <div className="score-guide">
          <h3>실력 점수 기준</h3>
          <ul>
            <li>기준: 20~30대 남성 A조 = 100점</li>
            <li>급수: S 110 · A 100 · B 85 · C 70 · D 55 · 초심 40</li>
            <li>나이: 40대 -5 · 45세 -8 · 50대 -15 · 60대+ -25</li>
            <li>성별: 여성 -20</li>
          </ul>
        </div>
      </section>

      <section className="panel results-panel">
        <div className="panel-head row-head">
          <div>
            <h2>매칭 결과</h2>
            <p>이전 라운드에 쉰 선수를 우선 배치합니다.</p>
          </div>
          {state.matchHistory.length > 0 && (
            <button type="button" className="ghost-button" onClick={clearHistory}>
              기록 초기화
            </button>
          )}
        </div>

        {!latestRound ? (
          <div className="empty-state">코트 수를 입력하고 매칭을 시작하세요.</div>
        ) : (
          <div className="round-stack">
            {state.matchHistory.map((round) => (
              <article key={round.id} className="round-card">
                <header className="round-header">
                  <h3>
                    {new Date(round.createdAt).toLocaleString('ko-KR')} · {round.matches.length}코트
                  </h3>
                </header>

                <div className="court-grid">
                  {round.matches.map((match) => (
                    <div key={`${round.id}-${match.courtNumber}`} className="court-card">
                      <div className="court-label">코트 {match.courtNumber}</div>
                      <div className="teams">
                        <div className="team team-a">
                          <span className="team-title">A팀 · {match.teamA.totalSkill}점</span>
                          {match.teamA.players.map((player) => (
                            <p key={player.id}>
                              {formatPlayerLine(player)} · {calculateSkillScore(player)}점
                            </p>
                          ))}
                        </div>
                        <div className="vs-badge">VS</div>
                        <div className="team team-b">
                          <span className="team-title">B팀 · {match.teamB.totalSkill}점</span>
                          {match.teamB.players.map((player) => (
                            <p key={player.id}>
                              {formatPlayerLine(player)} · {calculateSkillScore(player)}점
                            </p>
                          ))}
                        </div>
                      </div>
                      <p className="gap-note">팀 실력 차이 {match.skillGap}점</p>
                    </div>
                  ))}
                </div>

                {round.restingPlayers.length > 0 && (
                  <div className="rest-box">
                    <h4>휴식 ({round.restingPlayers.length}명)</h4>
                    <p>{round.restingPlayers.map((player) => player.name).join(', ')}</p>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
