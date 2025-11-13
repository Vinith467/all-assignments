import React, { useState, useEffect } from "react";

function Stopwatch() {
  const [time, setTime] = useState(0); // elapsed time in seconds
  const [isRunning, setIsRunning] = useState(false); // whether stopwatch is active
  const [isPaused, setIsPaused] = useState(false); // whether stopwatch is paused

  useEffect(() => {
    let interval;

    // run timer only when stopwatch is running and not paused
    if (isRunning && !isPaused) {
      interval = setInterval(() => {
        setTime((prevTime) => prevTime + 1);
      }, 1000);
    }

    // cleanup (important to stop multiple timers)
    return () => clearInterval(interval);
  }, [isRunning, isPaused]);

  // Start the stopwatch from 0
  const handleStart = () => {
    setTime(0);
    setIsRunning(true);
    setIsPaused(false);
  };

  // Stop and reset stopwatch
  const handleStop = () => {
    setIsRunning(false);
    setIsPaused(false);
    setTime(0);
  };

  // Pause stopwatch
  const handlePause = () => {
    setIsPaused(true);
  };

  // Resume stopwatch
  const handleResume = () => {
    setIsPaused(false);
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>⏱️ Stopwatch</h1>
      <h2>{time} seconds</h2>

      <div style={{ marginTop: "20px" }}>
        <button onClick={handleStart}>Start</button>
        <button onClick={handleStop}>Stop</button>
        <button onClick={handlePause} disabled={!isRunning || isPaused}>
          Pause
        </button>
        <button onClick={handleResume} disabled={!isPaused}>
          Resume
        </button>
      </div>
    </div>
  );
}

export default Stopwatch;
