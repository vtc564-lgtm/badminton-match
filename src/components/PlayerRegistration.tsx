import { useState, type Dispatch, type FormEvent, type SetStateAction } from 'react';
import type { AppState, Gender, Grade, Player } from '../types';
import { AGE_OPTIONS, GRADE_OPTIONS } from '../types';
import { calculateSkillScore } from '../utils/skillScore';

interface Props {
  state: AppState;
  setState: Dispatch<SetStateAction<AppState>>;
}

const emptyForm = {
  name: '',
  gender: 'male' as Gender,
  age: 40,
  grade: 'C조' as Grade,
  playingToday: true,
};

export function PlayerRegistration({ state, setState }: Props) {
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const upsertPlayer = (event: FormEvent) => {
    event.preventDefault();
    if (!form.name.trim()) return;

    setState((prev) => {
      const existing = editingId ? prev.players.find((item) => item.id === editingId) : undefined;
      const player: Player = {
        id: editingId ?? crypto.randomUUID(),
        name: form.name.trim(),
        gender: form.gender,
        age: form.age,
        grade: form.grade,
        playingToday: form.playingToday,
        restedLastRound: existing?.restedLastRound ?? false,
      };
      const exists = prev.players.some((item) => item.id === player.id);
      const players = exists
        ? prev.players.map((item) => (item.id === player.id ? { ...item, ...player } : item))
        : [...prev.players, player];
      return { ...prev, players };
    });
    resetForm();
  };

  const editPlayer = (player: Player) => {
    setEditingId(player.id);
    setForm({
      name: player.name,
      gender: player.gender,
      age: player.age,
      grade: player.grade,
      playingToday: player.playingToday,
    });
  };

  const removePlayer = (id: string) => {
    setState((prev) => ({
      ...prev,
      players: prev.players.filter((player) => player.id !== id),
    }));
    if (editingId === id) resetForm();
  };

  const togglePlayingToday = (id: string) => {
    setState((prev) => ({
      ...prev,
      players: prev.players.map((player) =>
        player.id === id ? { ...player, playingToday: !player.playingToday } : player,
      ),
    }));
  };

  const activeCount = state.players.filter((player) => player.playingToday).length;

  return (
    <div className="panel-grid">
      <section className="panel">
        <div className="panel-head">
          <h2>{editingId ? '선수 수정' : '선수 등록'}</h2>
          <p>오늘 출전 체크된 선수만 게임 매칭에 포함됩니다.</p>
        </div>

        <form className="player-form" onSubmit={upsertPlayer}>
          <label>
            이름
            <input
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              placeholder="홍길동"
              required
            />
          </label>

          <label>
            성별
            <select
              value={form.gender}
              onChange={(event) => setForm({ ...form, gender: event.target.value as Gender })}
            >
              <option value="male">남</option>
              <option value="female">여</option>
            </select>
          </label>

          <label>
            나이대
            <select
              value={form.age}
              onChange={(event) => setForm({ ...form, age: Number(event.target.value) })}
            >
              {AGE_OPTIONS.map((age) => (
                <option key={age} value={age}>
                  {age}세
                </option>
              ))}
            </select>
          </label>

          <label>
            급수
            <select
              value={form.grade}
              onChange={(event) => setForm({ ...form, grade: event.target.value as Grade })}
            >
              {GRADE_OPTIONS.map((grade) => (
                <option key={grade} value={grade}>
                  {grade}
                </option>
              ))}
            </select>
          </label>

          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={form.playingToday}
              onChange={(event) => setForm({ ...form, playingToday: event.target.checked })}
            />
            오늘 출전
          </label>

          <div className="form-actions">
            <button type="submit" className="primary-button">
              {editingId ? '수정 저장' : '선수 추가'}
            </button>
            {editingId && (
              <button type="button" className="ghost-button" onClick={resetForm}>
                취소
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="panel">
        <div className="panel-head">
          <h2>등록 선수 ({state.players.length}명)</h2>
          <p>오늘 출전 {activeCount}명 · 실력 점수는 나이·성별·급수를 반영합니다.</p>
        </div>

        {state.players.length === 0 ? (
          <div className="empty-state">등록된 선수가 없습니다. 첫 선수를 추가해 보세요.</div>
        ) : (
          <div className="player-list">
            {state.players.map((player) => {
              const skill = calculateSkillScore(player);
              return (
                <article key={player.id} className="player-card">
                  <div className="player-card-top">
                    <div>
                      <h3>{player.name}</h3>
                      <p>
                        {player.gender === 'male' ? '남' : '여'} · {player.age}세 · {player.grade}
                      </p>
                    </div>
                    <span className="skill-badge">{skill}점</span>
                  </div>
                  <div className="player-card-actions">
                    <label className="checkbox-row compact">
                      <input
                        type="checkbox"
                        checked={player.playingToday}
                        onChange={() => togglePlayingToday(player.id)}
                      />
                      오늘 출전
                    </label>
                    <div className="inline-actions">
                      <button type="button" className="text-button" onClick={() => editPlayer(player)}>
                        수정
                      </button>
                      <button type="button" className="text-button danger" onClick={() => removePlayer(player.id)}>
                        삭제
                      </button>
                    </div>
                  </div>
                  {player.restedLastRound && player.playingToday && (
                    <p className="rest-tag">이전 라운드 휴식 · 다음 매칭 우선</p>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
