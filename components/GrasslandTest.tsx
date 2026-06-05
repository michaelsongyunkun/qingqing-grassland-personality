"use client";

import { type CSSProperties, useMemo, useState } from "react";

import {
  answerOptions,
  dimensions,
  getQuestionsForMode,
  testModes,
  type AnswerValue,
  type DimensionId,
  type TestModeId
} from "@/data/personality-test";
import {
  calculateScores,
  findClosestPersonality,
  getDimensionPositionLabel,
  type AnswerMap
} from "@/lib/scoring";
import { buildModeHelperLine } from "@/lib/test-mode-copy";
import {
  buildShareText,
  getDimensionMarkerPosition,
  getDimensionNeedleRotation,
  getPersonalityVisualProfile
} from "@/lib/result-presentation";

type Phase = "home" | "test" | "result";

const dimensionOrder: DimensionId[] = ["SE", "AC", "RB", "RV", "EE"];

const completionMessages = [
  "草尖刚刚动了一下",
  "风向开始清楚",
  "小路已经走过一半",
  "远处的轮廓亮起来了",
  "马上抵达你的草原意象"
];

export function GrasslandTest() {
  const [phase, setPhase] = useState<Phase>("home");
  const [selectedModeId, setSelectedModeId] = useState<TestModeId>("professional");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [copied, setCopied] = useState(false);

  const activeMode = testModes.find((mode) => mode.id === selectedModeId) ?? testModes[0]!;
  const activeQuestions = useMemo(() => getQuestionsForMode(selectedModeId), [selectedModeId]);
  const currentQuestion = activeQuestions[currentIndex];
  const answeredCount = activeQuestions.filter((question) => answers[question.id]).length;
  const selectedAnswer = currentQuestion ? answers[currentQuestion.id] : undefined;
  const progress = Math.round((answeredCount / activeQuestions.length) * 100);
  const scores = useMemo(() => calculateScores(answers, activeQuestions), [answers, activeQuestions]);
  const match = useMemo(() => findClosestPersonality(scores.normalized), [scores.normalized]);
  const visualProfile = useMemo(() => getPersonalityVisualProfile(match.id), [match.id]);
  const canSeeResult = answeredCount === activeQuestions.length;
  const shareText = useMemo(() => buildShareText(match), [match]);
  const modeHelperLine = useMemo(() => buildModeHelperLine(activeMode), [activeMode]);

  function selectMode(modeId: TestModeId) {
    setSelectedModeId(modeId);
    setAnswers({});
    setCurrentIndex(0);
    setCopied(false);
  }

  function startTest() {
    setAnswers({});
    setPhase("test");
    setCurrentIndex(0);
    setCopied(false);
  }

  function selectAnswer(value: AnswerValue) {
    if (!currentQuestion) {
      return;
    }

    setAnswers((previous) => ({
      ...previous,
      [currentQuestion.id]: value
    }));
    setCopied(false);
  }

  function goNext() {
    if (!selectedAnswer) {
      return;
    }

    if (currentIndex === activeQuestions.length - 1) {
      setPhase("result");
      return;
    }

    setCurrentIndex((index) => index + 1);
  }

  function goBack() {
    setCurrentIndex((index) => Math.max(0, index - 1));
  }

  function retake() {
    setAnswers({});
    setCurrentIndex(0);
    setCopied(false);
    setPhase("home");
  }

  async function copyShareText() {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <main className="grassland-shell px-4 py-5 sm:px-6 sm:py-8">
      <div className="mx-auto flex min-h-[calc(100dvh-40px)] w-full max-w-5xl items-center justify-center">
        {phase === "home" && (
          <section className="paper-panel intro-panel w-full">
            <div className="mb-8 flex items-start justify-between gap-4">
              <div>
                <p className="eyebrow">轻松娱乐型测试</p>
                <h1 className="hero-title display-serif">
                  青青草原型
                  <span>人格测试器</span>
                </h1>
              </div>
              <div className="brand-stamp" aria-hidden="true">
                <span>风向</span>
                <small>meadow</small>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-[1.08fr_0.92fr]">
              <div className="story-card">
                <p className="lead-copy">
                  先选择完整的专业版，或更快的体验版。系统都会从社交能量、行动方式、关系策略、风险偏好和情绪表达五个维度，匹配一张属于你的草原意象。
                </p>
                <p className="support-copy">
                  它不是心理诊断，只是一面比较温柔、比较有梗的小镜子。认真答，也允许自己被逗笑一下。
                </p>
                <div className="terrain-strip" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                </div>
              </div>

              <div className="grid gap-3">
                {dimensions.map((dimension) => (
                  <div key={dimension.id} className="dimension-card">
                    <div className="dimension-card-head">
                      <span>{dimension.name}</span>
                      <span>{dimension.id}</span>
                    </div>
                    <div className="dimension-card-labels">
                      <span>{dimension.negativeLabel}</span>
                      <span>{dimension.positiveLabel}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mode-picker" role="group" aria-label="选择测试版本">
              {testModes.map((mode) => (
                <button
                  key={mode.id}
                  type="button"
                  className="mode-card"
                  data-selected={selectedModeId === mode.id}
                  aria-pressed={selectedModeId === mode.id}
                  onClick={() => selectMode(mode.id)}
                >
                  <span className="mode-card-topline">
                    <strong>{mode.name}</strong>
                    <em>{mode.badge}</em>
                  </span>
                  <span>{mode.description}</span>
                  <small>{mode.estimatedTime}</small>
                </button>
              ))}
            </div>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                className="meadow-button primary-action"
                onClick={startTest}
              >
                进入{activeMode.name}
              </button>
              <p className="helper-line">
                {modeHelperLine}
              </p>
            </div>
          </section>
        )}

        {phase === "test" && currentQuestion && (
          <section className="paper-panel test-panel w-full" aria-labelledby="current-question">
            <div className="mb-6">
              <div className="progress-meta" aria-live="polite">
                <span>
                  第 {currentIndex + 1} 题 / {activeQuestions.length}
                </span>
                <span className="mode-inline">{activeMode.name}</span>
                <span>{progress}%</span>
              </div>
              <div className="progress-track" aria-hidden="true">
                <div
                  className="progress-fill"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="progress-note">
                {completionMessages[Math.min(completionMessages.length - 1, Math.floor(progress / 22))]}
              </p>
            </div>

            <article className="question-card">
              <p className="eyebrow accent">请选择最贴近当下自己的答案</p>
              <h2 id="current-question" className="question-title">
                {currentQuestion.text}
              </h2>

              <fieldset className="likert-fieldset">
                <legend className="sr-only">五档同意程度</legend>
                <div className="likert-range-labels" aria-hidden="true">
                  <span>不同意</span>
                  <span>中间</span>
                  <span>同意</span>
                </div>
                <div className="likert-grid">
                  {answerOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      className="answer-button"
                      data-selected={selectedAnswer === option.value}
                      aria-pressed={selectedAnswer === option.value}
                      aria-label={`${option.label}：${currentQuestion.text}`}
                      onClick={() => selectAnswer(option.value)}
                    >
                      <span className="scale-dot" aria-hidden="true" />
                      <span>{option.label}</span>
                    </button>
                  ))}
                </div>
              </fieldset>
            </article>

            <div className="test-actions">
              <button
                type="button"
                className="quiet-button secondary-action"
                disabled={currentIndex === 0}
                onClick={goBack}
              >
                上一题
              </button>

              <div className="flex flex-col gap-3 sm:flex-row">
                {canSeeResult && (
                  <button
                    type="button"
                    className="quiet-button secondary-action"
                    onClick={() => setPhase("result")}
                  >
                    查看结果
                  </button>
                )}
                <button
                  type="button"
                  className="meadow-button secondary-action"
                  disabled={!selectedAnswer}
                  onClick={goNext}
                >
                  {currentIndex === activeQuestions.length - 1 ? "生成结果" : "下一题"}
                </button>
              </div>
            </div>
          </section>
        )}

        {phase === "result" && (
          <section className="paper-panel result-panel w-full" aria-labelledby="result-title">
            <div className="result-hero">
              <div className={`personality-card ${visualProfile.toneClass}`}>
                <div className="personality-card-top">
                  <p className="eyebrow">你的草原意象是</p>
                  <span className="mode-pill">{activeMode.name} · {activeMode.badge}</span>
                  <div className="result-stamp" aria-hidden="true">
                    {visualProfile.stampText}
                  </div>
                </div>
                <h2 id="result-title" className="result-title display-serif">
                  {match.name}
                </h2>
                <p className="motif-label">{visualProfile.motifLabel}</p>
                <p className="terrain-line">{visualProfile.terrainLine}</p>
                <div className="keyword-row">
                  {match.keywords.map((keyword) => (
                    <span key={keyword}>{keyword}</span>
                  ))}
                </div>
                <p className="result-summary">{match.summary}</p>
                <div className="daily-advice">今日草原提醒：{match.dailyAdvice}</div>
              </div>

              <div className="wind-card" aria-label="五维风向仪">
                <div className="wind-card-head">
                  <p className="eyebrow accent">五维风向仪</p>
                  <p>越偏向一侧，说明该维度倾向越明显。</p>
                </div>
                <div className="wind-dial" aria-hidden="true">
                  <span className="dial-ring" />
                  {dimensionOrder.map((dimensionId) => (
                    <span
                      key={dimensionId}
                      className="dial-needle"
                      style={
                        {
                          "--needle-angle": getDimensionNeedleRotation(scores.normalized[dimensionId])
                        } as CSSProperties
                      }
                    />
                  ))}
                  <span className="dial-core">{visualProfile.stampText}</span>
                </div>
              </div>
            </div>

            <div className="result-block-grid">
              <ResultBlock title="优势" body={match.strength} />
              <ResultBlock title="盲点" body={match.blindSpot} />
              <ResultBlock title="相处建议" body={match.relationshipTip} />
            </div>

            <div className="score-panel">
              <div className="score-panel-head">
                <div>
                  <p className="eyebrow accent">五维风向</p>
                  <h3>分数落点</h3>
                </div>
                <p>-100 到 +100，越靠近一端代表倾向越明显。</p>
              </div>

              <div className="grid gap-4">
                {dimensionOrder.map((dimensionId) => {
                  const dimension = dimensions.find((item) => item.id === dimensionId);
                  const value = scores.normalized[dimensionId];
                  const markerPosition = getDimensionMarkerPosition(value);

                  if (!dimension) {
                    return null;
                  }

                  return (
                    <div key={dimensionId} className="score-row">
                      <div className="score-row-head">
                        <div>
                          <p>{dimension.name}</p>
                          <span>{dimension.shortDescription}</span>
                        </div>
                        <strong>
                          {getDimensionPositionLabel(dimensionId, value)} {value > 0 ? `+${value}` : value}
                        </strong>
                      </div>
                      <div className="dimension-track">
                        <span className="dimension-marker" style={{ left: markerPosition }} />
                      </div>
                      <div className="score-labels">
                        <span>{dimension.negativeLabel}</span>
                        <span>{dimension.positiveLabel}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="share-panel">
              <div className="share-panel-head">
                <div>
                  <p className="eyebrow">可复制分享文案</p>
                  <p>分享给朋友时，记得说这只是娱乐自测。</p>
                </div>
                <button
                  type="button"
                  className="quiet-button compact-action"
                  onClick={copyShareText}
                  aria-live="polite"
                >
                  {copied ? "已复制" : "复制文案"}
                </button>
              </div>
              <textarea
                className="share-textarea"
                readOnly
                value={shareText}
              />
            </div>

            <div className="result-actions">
              <p>
                本测试仅用于娱乐和轻量自我理解，不构成心理诊断或专业建议。
              </p>
              <button
                type="button"
                className="meadow-button secondary-action"
                onClick={retake}
              >
                重新测试
              </button>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

function ResultBlock({ title, body }: { title: string; body: string }) {
  return (
    <article className="result-block">
      <h3>{title}</h3>
      <p>{body}</p>
    </article>
  );
}
