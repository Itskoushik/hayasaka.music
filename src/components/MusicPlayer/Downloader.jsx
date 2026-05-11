"use client";
import React, { useState } from "react";
import { MdOutlineFileDownload, MdDownloadForOffline } from "react-icons/md";

const clean = (str) =>
  str?.replace(/&#039;/g, "'")?.replace(/&amp;/g, "&")?.trim() || "";

const Downloader = ({ activeSong, icon }) => {
  const [progress, setProgress] = useState(0);
  const [isInProgress, setIsInProgress] = useState(false);

  const handleDownload = async (e) => {
    e.stopPropagation();
    if (isInProgress) return;

    const songUrl = activeSong?.downloadUrl?.[4]?.url;
    if (!songUrl) return;

    const songName = clean(activeSong?.name) || "Song";
    const artistName =
      activeSong?.artists?.primary?.map((a) => a.name).join(", ") ||
      clean(activeSong?.primaryArtists) ||
      "";
    const albumName = clean(activeSong?.album?.name) || "";
    const year = activeSong?.year ? parseInt(activeSong.year) : 0;
    const language = clean(activeSong?.language) || "";
    const copyright = clean(activeSong?.copyright) || "";

    // Composers — artists with role containing "music" or "composer"
    const composers =
      activeSong?.artists?.all
        ?.filter((a) =>
          a?.role?.toLowerCase().includes("music") ||
          a?.role?.toLowerCase().includes("composer")
        )
        ?.map((a) => a.name)
        ?.join(", ") || "";

    // Lyricists
    const lyricists =
      activeSong?.artists?.all
        ?.filter((a) => a?.role?.toLowerCase().includes("lyric"))
        ?.map((a) => a.name)
        ?.join(", ") || "";

    const filename = artistName
      ? `${songName} - ${artistName}.mp3`
      : `${songName}.mp3`;

    const coverUrl =
      activeSong?.image?.[2]?.url ||
      activeSong?.image?.[1]?.url ||
      activeSong?.image?.[0]?.url;

    try {
      setIsInProgress(true);
      setProgress(1);

      // 1. Stream-fetch the MP3 with real progress
      const audioRes = await fetch(songUrl);
      const reader = audioRes.body.getReader();
      const contentLength = +audioRes.headers.get("Content-Length") || 0;
      let received = 0;
      const chunks = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        received += value.length;
        if (contentLength) {
          setProgress(Math.min(90, Math.floor((received / contentLength) * 90)));
        }
      }

      const audioBuffer = await new Blob(chunks).arrayBuffer();

      // 2. Fetch cover art (used as thumbnail in media players)
      let coverArrayBuffer = null;
      if (coverUrl) {
        try {
          const imgRes = await fetch(coverUrl);
          coverArrayBuffer = await imgRes.arrayBuffer();
        } catch {
          // cover failed — MP3 still downloads without art
        }
      }

      setProgress(95);

      // 3. Write ID3v2 tags — dynamic import keeps it client-only (no SSR issues)
      const { default: ID3Writer } = await import("browser-id3-writer");
      const writer = new ID3Writer(audioBuffer);

      writer
        .setFrame("TIT2", songName)                                    // Title
        .setFrame("TPE1", artistName ? artistName.split(", ") : [])   // Artists
        .setFrame("TALB", albumName)                                   // Album
        .setFrame("TCON", [language])                                  // Genre
        .setFrame("TCOP", copyright)                                   // Copyright
        .setFrame("TPUB", copyright);                                  // Publisher

      if (year) writer.setFrame("TYER", year);                        // Year
      if (composers) writer.setFrame("TCOM", composers.split(", "));  // Composers
      if (lyricists) writer.setFrame("TEXT", lyricists.split(", "));  // Lyricists

      // Embedded album art — shows as thumbnail in Windows Media Player, VLC, etc.
      if (coverArrayBuffer) {
        writer.setFrame("APIC", {
          type: 3,                      // 3 = Front cover
          data: coverArrayBuffer,
          description: "Cover",
          useUnicodeEncoding: false,
        });
      }

      writer.addTag();
      setProgress(100);

      // 4. Trigger browser download
      const taggedBlob = writer.getBlob();
      const blobUrl = URL.createObjectURL(taggedBlob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);

      setTimeout(() => {
        setIsInProgress(false);
        setProgress(0);
      }, 1500);
    } catch (err) {
      console.error("Download failed:", err);
      setIsInProgress(false);
      setProgress(0);
    }
  };

  const label =
    progress < 95 ? `${progress}%` :
    progress === 95 ? "Tag…" :
    "Done!";

  return (
    <div
      onClick={handleDownload}
      className="flex mb-1 cursor-pointer w-7"
      title={isInProgress ? label : `Download: ${clean(activeSong?.name) || "Song"}`}
    >
      {isInProgress ? (
        <div className="text-white font-extrabold text-[10px] flex items-center justify-center w-7">
          {label}
        </div>
      ) : icon === 2 ? (
        <MdDownloadForOffline size={25} color="#ffff" />
      ) : (
        <MdOutlineFileDownload size={25} color="#ffff" />
      )}
    </div>
  );
};

export default Downloader;
