type Counters = Record<string, number>;

export type PhaseKind = "mount" | "typing" | "submit";

type Phase = {
  name: string;
  kind: PhaseKind;
  /** Wall clock between phase boundaries. */
  wallMs: number;
  /** First to last render inside the phase — excludes idle waiting. */
  activeMs: number;
  keystrokes: number;
  deltas: Counters;
};

const SCHEMA_KEY = "schema";
const ROOT_KEY = "root";
const FIELD_PREFIX = "field:";

let label = "";
let phaseStartedAt = 0;
let phaseBaseline: Counters = {};
let firstEventAt = 0;
let lastEventAt = 0;

const totals: Counters = {};

let mountPhase: Phase | undefined;
let currentRun: Phase[] = [];
const runs: Phase[][] = [];

/**
 * Counts one render (or one schema run). Writes to module state on purpose:
 * nothing here may trigger a render, otherwise the harness measures itself.
 */
export const count = (key: string) => {
  totals[key] = (totals[key] ?? 0) + 1;

  lastEventAt = Date.now();

  if (!firstEventAt) {
    firstEventAt = lastEventAt;
  }
};

const openPhase = () => {
  phaseBaseline = { ...totals };
  phaseStartedAt = Date.now();
  firstEventAt = 0;
  lastEventAt = 0;
};

const closePhase = (name: string, kind: PhaseKind, keystrokes: number): Phase => {
  const now = Date.now();
  const deltas: Counters = {};

  for (const key of Object.keys(totals)) {
    const delta = totals[key] - (phaseBaseline[key] ?? 0);

    if (delta > 0) {
      deltas[key] = delta;
    }
  }

  const closed: Phase = {
    name,
    kind,
    wallMs: now - phaseStartedAt,
    activeMs: firstEventAt ? lastEventAt - firstEventAt : 0,
    keystrokes,
    deltas,
  };

  openPhase();

  return closed;
};

/**
 * Starts a fresh benchmark. Returns null so it can be used as a `useState`
 * initializer, which runs once per mount before anything else renders.
 */
export const reset = (runLabel: string) => {
  label = runLabel;
  mountPhase = undefined;
  currentRun = [];
  runs.length = 0;

  for (const key of Object.keys(totals)) {
    delete totals[key];
  }

  openPhase();

  return null;
};

/** Closes everything rendered since mount. Mount happens once, not once per run. */
export const closeMount = () => {
  mountPhase = closePhase("opening the screen", "mount", 0);
};

/** Renders caused by resetting the form between runs land outside any phase. */
export const startRun = () => {
  currentRun = [];
  openPhase();
};

export const endRun = () => {
  runs.push(currentRun);
};

/** Closes the current phase and records what happened during it. */
export const phase = (name: string, kind: PhaseKind, keystrokes = 0) => {
  currentRun.push(closePhase(name, kind, keystrokes));
};

/**
 * Driver-paced phases are timed by wall clock — the pacing between keystrokes
 * is part of what they cost. Phases nobody drives are timed by actual work.
 */
const timeOf = ({ wallMs, activeMs, keystrokes }: Phase) => (keystrokes ? wallMs : activeMs);

const rendersOf = ({ deltas }: Phase) =>
  Object.entries(deltas).reduce((sum, [key, value]) => (key === SCHEMA_KEY ? sum : sum + value), 0);

const median = (values: number[]) => {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);

  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
};

/** "root ×2 · 30 fields ×2" — collapses fields that behaved identically. */
const describeRenders = (deltas: Counters) => {
  const groups = new Map<number, string[]>();
  const parts: string[] = [];

  for (const [key, value] of Object.entries(deltas)) {
    if (key === SCHEMA_KEY) {
      continue;
    }

    if (key === ROOT_KEY) {
      parts.push(`root ×${value}`);
      continue;
    }

    groups.set(value, [...(groups.get(value) ?? []), key.replace(FIELD_PREFIX, "")]);
  }

  const fieldParts = [...groups.entries()]
    .sort(([a], [b]) => b - a)
    .map(([value, names]) =>
      names.length === 1 ? `${names[0]} ×${value}` : `${names.length} fields ×${value}`,
    );

  return [...parts, ...fieldParts].join(" · ") || "—";
};

const pad = (value: string | number, width: number, left = false) => {
  const text = String(value);

  return left ? text.padEnd(width) : text.padStart(width);
};

const NAME_WIDTH = 31;
const RULE_WIDTH = NAME_WIDTH + 42;

const row = (
  name: string,
  time: string | number,
  renders: string | number,
  validations: string | number,
  spread: string,
) =>
  `  ${pad(name.slice(0, NAME_WIDTH), NAME_WIDTH, true)}${pad(time, 9)}${pad(renders, 9)}${pad(validations, 13)}${pad(spread, 11)}`;

/** Every sample of one phase, across runs. */
const samplesOf = (index: number) => runs.map((run) => run[index]).filter(Boolean);

const summarise = (samples: Phase[]) => {
  const times = samples.map(timeOf);

  const deltas: Counters = {};
  const keys = new Set(samples.flatMap((sample) => Object.keys(sample.deltas)));

  for (const key of keys) {
    const value = median(samples.map((sample) => sample.deltas[key] ?? 0));

    // A key seen in a minority of runs has a median of zero. Dropping it keeps
    // "who rendered" free of `×0` entries and the field counts honest.
    if (value > 0) {
      deltas[key] = value;
    }
  }

  return {
    name: samples[0].name,
    kind: samples[0].kind,
    keystrokes: samples[0].keystrokes,
    time: median(times),
    low: Math.min(...times),
    high: Math.max(...times),
    renders: median(samples.map(rendersOf)),
    validations: median(samples.map((sample) => sample.deltas[SCHEMA_KEY] ?? 0)),
    deltas,
  };
};

type Summary = ReturnType<typeof summarise>;

/** How many distinct fields rendered at least once. */
const fieldsTouched = (deltas: Counters) =>
  Object.keys(deltas).filter((key) => key.startsWith(FIELD_PREFIX)).length;

const fieldCount = () => Object.keys(totals).filter((key) => key.startsWith(FIELD_PREFIX)).length;

/** Turns the raw phases into plain sentences, so the table needs no decoding. */
const highlights = (summaries: Summary[]) => {
  const total = fieldCount();
  const lines: string[] = [];

  const typing = summaries.find((item) => item.kind === "typing");

  if (typing) {
    const touched = fieldsTouched(typing.deltas);

    lines.push(
      `  · typing one character re-renders ${touched} of ${total} fields` +
        (touched === 1 ? " — nothing wasted" : " — the other fields wake up for nothing"),
    );
  }

  const submits = summaries.filter((item) => item.kind === "submit");

  if (submits.length) {
    const touched = fieldsTouched(submits[0].deltas);

    lines.push(
      touched
        ? `  · every submit re-renders ${touched} of ${total} fields, even when nothing changed`
        : "  · a submit re-renders nothing at all",
    );
  }

  const perRun = summaries.reduce((sum, item) => sum + item.validations, 0);

  lines.push(`  · the schema is validated ${perRun} times per run`);

  return lines;
};

const HOW_TO_READ = [
  "  HOW TO READ THIS",
  "",
  "  · renders and validations are exact counts — those are the real comparison",
  "  · time on the typing steps is set by the 16.7ms timer between keystrokes,",
  "    not by the library, so it says nothing; only the counts do",
  "  · time on opening and submitting is real work, nobody paces those",
  "  · spread is min-max across runs; if it is wider than a difference you found,",
  "    that difference is noise",
];

/** Prints medians across every run, so a single slow run cannot skew the table. */
export const report = () => {
  if (!runs.length) {
    console.log("No runs recorded");

    return;
  }

  const phaseCount = Math.max(...runs.map((run) => run.length));
  const summaries = Array.from({ length: phaseCount }, (_, index) => summarise(samplesOf(index)));
  const rule = `  ${"-".repeat(RULE_WIDTH)}`;

  const numbered = summaries.map((item, index) =>
    row(
      `${index + 2}. ${item.name}`,
      `${item.time}ms`,
      item.renders || "—",
      item.validations || "—",
      item.low === item.high ? "—" : `${item.low}-${item.high}`,
    ),
  );

  const lines = [
    "",
    `  ${"=".repeat(RULE_WIDTH)}`,
    `  ${label}`,
    `  ${fieldCount()} fields · one zod schema · median of ${runs.length} runs, first run discarded`,
    `  ${"=".repeat(RULE_WIDTH)}`,
    "",
    "  WHAT HAPPENED",
    "",
    row("step", "time", "renders", "validations", "spread"),
    rule,
    ...(mountPhase
      ? [
          row(
            `1. ${mountPhase.name}`,
            `${timeOf(mountPhase)}ms`,
            rendersOf(mountPhase),
            mountPhase.deltas[SCHEMA_KEY] || "—",
            "—",
          ),
        ]
      : []),
    ...numbered,
    rule,
    row(
      "one full run",
      `${summaries.reduce((sum, item) => sum + item.time, 0)}ms`,
      summaries.reduce((sum, item) => sum + item.renders, 0),
      summaries.reduce((sum, item) => sum + item.validations, 0),
      "—",
    ),
    "",
    "  WHO RE-RENDERED",
    "",
    ...(mountPhase
      ? [`    ${pad(`1. ${mountPhase.name}`, NAME_WIDTH + 2, true)}${describeRenders(mountPhase.deltas)}`]
      : []),
    ...summaries.map(
      (item, index) =>
        `    ${pad(`${index + 2}. ${item.name}`.slice(0, NAME_WIDTH), NAME_WIDTH + 2, true)}${describeRenders(item.deltas)}`,
    ),
    "",
    "  WHAT IT SAYS",
    "",
    ...highlights(summaries),
    "",
    ...HOW_TO_READ,
    "",
  ];

  console.log(lines.join("\n"));
};
