"use client";
/* eslint-disable jsx-a11y/media-has-caption */
import React, { useRef, useEffect } from "react";

const Player = ({
  activeSong,
  isPlaying,
  volume,
  seekTime,
  onEnded,
  onTimeUpdate,
  onLoadedData,
  repeat,
  handlePlayPause,
  handlePrevSong,
  handleNextSong,
  setSeekTime,
  appTime,
}) => {
  const ref = useRef(null);

  // Safely play/pause inside a useEffect to avoid calling during render
  useEffect(() => {
    if (!ref.current) return;
    if (isPlaying) {
      ref.current.play().catch(() => {});
    } else {
      ref.current.pause();
    }
  }, [isPlaying]);

  // media session metadata:
  const mediaMetaData = activeSong?.name
    ? {
        title: activeSong?.name,
        artist: activeSong?.primaryArtists,
        album: activeSong?.album?.name,
        artwork: [
          {
            src: activeSong?.image?.[2]?.url,
            sizes: "500x500",
            type: "image/jpg",
          },
        ],
      }
    : {};

  // media session handlers (defined before useEffect so they're stable):
  const onPlay = () => { handlePlayPause(); };
  const onPause = () => { handlePlayPause(); };
  const onPreviousTrack = () => { handlePrevSong(); };
  const onNextTrack = () => { handleNextSong(); };

  useEffect(() => {
    // Check if the Media Session API is available in the browser environment
    if ("mediaSession" in navigator) {
      // Set media metadata
      navigator.mediaSession.metadata = new window.MediaMetadata(mediaMetaData);

      // Define media session event handlers
      navigator.mediaSession.setActionHandler("play", onPlay);
      navigator.mediaSession.setActionHandler("pause", onPause);
      navigator.mediaSession.setActionHandler("previoustrack", onPreviousTrack);
      navigator.mediaSession.setActionHandler("nexttrack", onNextTrack);
      navigator.mediaSession.setActionHandler("seekbackward", () => {
        setSeekTime(appTime - 5);
      });
      navigator.mediaSession.setActionHandler("seekforward", () => {
        setSeekTime(appTime + 5);
      });
    }
  }, [activeSong?.name]);

  useEffect(() => {
    if (!ref.current) return;
    ref.current.volume = volume;
  }, [volume]);

  // updates audio element only on seekTime change (and not on each rerender):
  useEffect(() => {
    if (!ref.current) return;
    ref.current.currentTime = seekTime;
  }, [seekTime]);

  return (
    <>
      <audio
        src={activeSong?.downloadUrl?.[4]?.url}
        ref={ref}
        loop={repeat}
        onEnded={onEnded}
        onTimeUpdate={onTimeUpdate}
        onLoadedData={onLoadedData}
      />
    </>
  );
};

export default Player;
