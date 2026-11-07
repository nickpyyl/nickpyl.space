export const pageTransitionTiming = { exit: 220, enter: 360 };

export function createPageTransition(initialView, onChange, { schedule = setTimeout, cancel = clearTimeout } = {}) {
  let state = { view: initialView, target: initialView, phase: "idle" };
  let timer = null;
  let version = 0;
  let disposed = false;

  function publish(patch) {
    state = { ...state, ...patch };
    onChange(state);
  }

  function cancelPending() {
    version += 1;
    if (timer !== null) cancel(timer);
    timer = null;
  }

  function after(duration, callback) {
    const current = version;
    timer = schedule(() => {
      if (disposed || current !== version) return;
      timer = null;
      callback();
    }, duration);
  }

  function enter() {
    publish({ view: state.target, phase: "entering" });
    after(pageTransitionTiming.enter, () => publish({ phase: "idle" }));
  }

  function completeExit(view = state.view) {
    if (disposed || state.phase !== "exiting" || view !== state.view) return;
    cancelPending();
    enter();
  }

  function navigate(target, { instant = false } = {}) {
    if (disposed || target === state.target && (state.phase === "idle" || !instant)) return;
    if (instant) {
      cancelPending();
      publish({ view: target, target, phase: "idle" });
      return;
    }
    if (state.phase === "exiting" && target !== state.view) {
      publish({ target });
      return;
    }
    cancelPending();
    if (target === state.view) {
      publish({ target });
      enter();
      return;
    }
    publish({ target, phase: "exiting" });
    // The rendered transition finishes first; the timer covers suspended tabs.
    after(pageTransitionTiming.exit + 80, completeExit);
  }

  return {
    navigate,
    completeExit,
    finish: () => navigate(state.target, { instant: true }),
    dispose() {
      disposed = true;
      cancelPending();
    },
  };
}
