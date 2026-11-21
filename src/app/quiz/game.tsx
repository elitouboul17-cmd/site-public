"use client";
import { useMemo, useState } from "react";
import { CheckCircle2, XCircle, ExternalLink, RotateCcw } from "lucide-react";
import type { QuizCategory, QuizLevel, QuizQuestion } from "@/lib/types";

const LEVELS: Record<QuizLevel, string> = { debutant: "Débutant", intermediaire: "Intermédiaire", expert: "Expert" };
const CATS: Record<QuizCategory, string> = { mcu: "MCU", personnages: "Personnages", chronologie: "Chronologie", "films-series": "Films et séries", coulisses: "Coulisses", comics: "Comics", multivers: "Multivers" };
const BEST_KEY = "marvelhq:quiz:best";

function shuffle<T>(a: T[]): T[] {
  const r = [...a];
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
}

export function QuizGame({ questions }: { questions: QuizQuestion[] }) {
  const [level, setLevel] = useState<QuizLevel | "tous">("tous");
  const [cat, setCat] = useState<QuizCategory | "toutes">("toutes");
  const [deck, setDeck] = useState<QuizQuestion[] | null>(null);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);

  const pool = useMemo(() => questions.filter((q) => (level === "tous" || q.level === level) && (cat === "toutes" || q.category === cat)), [questions, level, cat]);

  const start = () => {
    setDeck(shuffle(pool).slice(0, 10));
    setI(0);
    setPicked(null);
    setScore(0);
  };

  if (!deck) {
    return (
      <div className="panel space-y-5 p-5">
        <div>
          <p className="eyebrow mb-2">Niveau</p>
          <div className="flex flex-wrap gap-1.5">
            <button className={`chip ${level === "tous" ? "chip-active" : ""}`} onClick={() => setLevel("tous")}>Tous</button>
            {(Object.keys(LEVELS) as QuizLevel[]).map((l) => <button key={l} className={`chip ${level === l ? "chip-active" : ""}`} onClick={() => setLevel(l)}>{LEVELS[l]}</button>)}
          </div>
        </div>
        <div>
          <p className="eyebrow mb-2">Catégorie</p>
          <div className="flex flex-wrap gap-1.5">
            <button className={`chip ${cat === "toutes" ? "chip-active" : ""}`} onClick={() => setCat("toutes")}>Toutes</button>
            {(Object.keys(CATS) as QuizCategory[]).map((c) => <button key={c} className={`chip ${cat === c ? "chip-active" : ""}`} onClick={() => setCat(c)}>{CATS[c]}</button>)}
          </div>
        </div>
        <button className="btn btn-primary w-full sm:w-auto" disabled={!pool.length} onClick={start}>
          {pool.length ? `Commencer (${Math.min(10, pool.length)} questions)` : "Aucune question pour cette sélection"}
        </button>
      </div>
    );
  }

  if (i >= deck.length) {
    let best = 0;
    try { best = Math.max(Number(localStorage.getItem(BEST_KEY)) || 0, Math.round((score / deck.length) * 100)); localStorage.setItem(BEST_KEY, String(best)); } catch { /* ignoré */ }
    return (
      <div className="panel hud-corners p-6 text-center">
        <p className="eyebrow">Résultat</p>
        <p className="display mt-2 text-5xl text-white">{score} / {deck.length}</p>
        <p className="mt-2 text-sm text-steel-300">{score === deck.length ? "Score parfait : digne d'un Gardien." : score >= deck.length / 2 ? "Bien joué, agent." : "Le multivers a encore des secrets pour vous."}</p>
        {best > 0 && <p className="mt-1 text-xs text-steel-500">Meilleur score sur cet appareil : {best} %</p>}
        <div className="mt-5 flex justify-center gap-2">
          <button className="btn btn-primary" onClick={start}><RotateCcw className="h-4 w-4" /> Rejouer</button>
          <button className="btn" onClick={() => setDeck(null)}>Changer de niveau</button>
        </div>
      </div>
    );
  }

  const q = deck[i];
  return (
    <div className="panel p-5">
      <div className="mb-3 flex items-center justify-between text-xs text-steel-400">
        <span>Question {i + 1} / {deck.length} · {LEVELS[q.level]} · {CATS[q.category]}</span>
        <span>Score : {score}</span>
      </div>
      <div className="mb-4 h-1 overflow-hidden rounded-full bg-white/10"><div className="h-full bg-hq-red transition-all" style={{ width: `${(i / deck.length) * 100}%` }} /></div>
      <h2 className="text-lg font-semibold text-white">{q.question}</h2>
      <div className="mt-4 grid gap-2">
        {q.choices.map((c, idx) => {
          const state = picked == null ? "" : idx === q.answer ? "border-officiel/60 bg-officiel/10" : idx === picked ? "border-hq-red/60 bg-hq-red/10" : "opacity-60";
          return (
            <button
              key={idx}
              disabled={picked != null}
              onClick={() => { setPicked(idx); if (idx === q.answer) setScore((s) => s + 1); }}
              className={`flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-left text-sm text-white transition hover:border-white/25 ${state}`}
            >
              {c}
              {picked != null && idx === q.answer && <CheckCircle2 className="h-4 w-4 text-officiel" />}
              {picked === idx && idx !== q.answer && <XCircle className="h-4 w-4 text-hq-red" />}
            </button>
          );
        })}
      </div>
      {picked != null && (
        <div className="mt-4 rounded-lg border border-white/10 bg-white/[0.02] p-3 text-sm" role="status">
          <p className="text-steel-200">{q.explanation}</p>
          <a href={q.source.url} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex items-center gap-1 text-xs text-steel-400 underline hover:text-white">Source : {q.source.label} <ExternalLink className="h-3 w-3" /></a>
          <div className="mt-3"><button className="btn btn-primary" onClick={() => { setI((n) => n + 1); setPicked(null); }}>{i + 1 < deck.length ? "Question suivante" : "Voir le résultat"}</button></div>
        </div>
      )}
    </div>
  );
}
