import { useState, useCallback, useEffect } from "react";

export const useAudio = (url) => {
  const [audio] = useState(new Audio(url));
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);

  const toggle = useCallback(() => {
    if (playing) {
      audio.pause();
    } else {
      audio.play().catch((err) => console.log("Audio play error:", err));
    }
    setPlaying(!playing);
  }, [playing, audio]);

  const toggleMute = useCallback(() => {
    audio.muted = !audio.muted;
    setMuted(!muted);
  }, [audio, muted]);

  useEffect(() => {
    audio.loop = true;
    audio.volume = 0.3;

    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, [audio]);

  return { playing, muted, toggle, toggleMute };
};

export default useAudio;
