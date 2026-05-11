"use client";
import { useState, useEffect } from "react";
import SpotlightTutorial from "./SpotlightTutorial";
import { DASHBOARD_TUTORIAL_STEPS } from "./tutorialSteps";

const TUTORIAL_KEY = "perceiva_tutorial_done";

export default function TutorialProvider() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Small delay to let the page fully render
    const timer = setTimeout(() => {
      const done = localStorage.getItem(TUTORIAL_KEY);
      if (!done) setShow(true);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  function dismiss() {
    localStorage.setItem(TUTORIAL_KEY, "1");
    setShow(false);
  }

  if (!show) return null;

  return (
    <SpotlightTutorial
      steps={DASHBOARD_TUTORIAL_STEPS}
      onComplete={dismiss}
      onSkip={dismiss}
    />
  );
}
