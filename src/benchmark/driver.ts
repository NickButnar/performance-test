import { fieldNames } from "forms";

import { closeMount, endRun, phase, report, startRun } from "./registry";

/**
 * No pacing between keystrokes. The zero-delay timer still yields between them,
 * so every change commits on its own and the render counts stay honest — but it
 * is clamped to a frame, which is why phase times say nothing about the library.
 */
const KEYSTROKE_MS = 0;

/** Time for the submit to settle (validation + state updates) before measuring. */
const SUBMIT_SETTLE_MS = 200;

/** Time for the form reset between runs to settle, outside any phase. */
const RESTART_SETTLE_MS = 300;

/** The first run is a warm-up: the JIT is cold and it is reliably the slowest. */
const WARMUP_RUNS = 1;

const MEASURED_RUNS = 5;

/** The field the typing phase hammers, to see whether the other 29 wake up. */
const TARGET_FIELD = fieldNames[0];

const TYPED_TEXT = "a".repeat(30);

/** Just enough to make every required field valid before submitting. */
const FILL_TEXT = "abc";

const inputs = new Map<string, (value: string) => void>();

let submitForm: (() => void) | undefined;
let restartForm: (() => void) | undefined;

export const registerInput = (name: string, onChange: (value: string) => void) => {
  inputs.set(name, onChange);
};

export const unregisterInput = (name: string) => {
  inputs.delete(name);
};

export const registerSubmit = (submit: () => void) => {
  submitForm = submit;
};

/** Clears every value so each run starts from the same state. */
export const registerRestart = (restart: () => void) => {
  restartForm = restart;
};

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

const type = async (name: string, text: string) => {
  const onChange = inputs.get(name);

  if (!onChange) {
    throw new Error(`No input registered under "${name}"`);
  }

  let value = "";

  for (const char of text) {
    value += char;
    onChange(value);
    await sleep(KEYSTROKE_MS);
  }
};

const submit = async (name: string) => {
  submitForm?.();
  await sleep(SUBMIT_SETTLE_MS);
  phase(name, "submit");
};

const runOnce = async () => {
  await type(TARGET_FIELD, TYPED_TEXT);
  phase(`typing ${TYPED_TEXT.length} chars in ${TARGET_FIELD}`, "typing", TYPED_TEXT.length);

  const rest = fieldNames.slice(1);

  for (const name of rest) {
    await type(name, FILL_TEXT);
  }
  phase(
    `filling the other ${rest.length} fields`,
    "typing",
    rest.length * FILL_TEXT.length,
  );

  await submit("pressing submit");
  await submit("pressing submit again");
};

/**
 * The scripted run. Same keystrokes, same order, same pauses on both screens —
 * manual typing is not reproducible enough to compare. Repeated so the report
 * can show a median instead of one noisy sample.
 */
export const runScenario = async () => {
  closeMount();

  if (!restartForm) {
    throw new Error("No form restart registered — runs would start with stale values");
  }

  for (let index = 0; index < WARMUP_RUNS + MEASURED_RUNS; index += 1) {
    restartForm();
    await sleep(RESTART_SETTLE_MS);

    startRun();
    await runOnce();

    if (index >= WARMUP_RUNS) {
      endRun();
    }
  }

  report();
};
