"use client";
import React from "react";
import { MdOutlineFileDownload } from "react-icons/md";
import useDownloader from "react-use-downloader";
import { MdDownloadForOffline } from "react-icons/md";

const Downloader = ({ activeSong, icon }) => {
  const { size, elapsed, percentage, download, error, isInProgress } = useDownloader();

  // Extract the song URL and prepare the filename
  const songUrl = activeSong?.downloadUrl?.[4]?.url;
  const filename = `${activeSong?.name
    ?.replace("&#039;", "'")
    ?.replace("&amp;", "&")}.mp3`;

  // Extract artist, album, and other details from activeSong
  const title = activeSong?.name || "Unknown Title";
  const artistName = activeSong?.primaryArtists || "Unknown Artist";
  const albumName = activeSong?.album || "Unknown Album";
  const releaseDate = activeSong?.releaseDate || "Unknown Release Date"; // Adjust if key differs
  const duration = activeSong?.duration || 0; // Default to 0 if duration is not available
  const genre = activeSong?.genre || "Unknown Genre"; // Adjust if key differs

  // Format the duration into minutes and seconds
  const formattedDuration = duration
    ? `${Math.floor(duration / 60)}:${String(duration % 60).padStart(2, "0")}`
    : "Unknown Duration";

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        download(songUrl, filename);
      }}
      className={`flex mb-1 cursor-pointer w-7`}
    >
      <div
        title={isInProgress ? "Downloading" : "Download"}
        className={
          isInProgress ? "download-button flex justify-center items-center" : ""
        }
      >
        {isInProgress ? (
          <div className="text-white font-extrabold text-xs">{percentage}%</div>
        ) : icon === 2 ? (
          <MdDownloadForOffline size={25} color={"#ffff"} />
        ) : (
          <MdOutlineFileDownload size={25} color={"#ffff"} />
        )}
      </div>

      {/* Display artist, album, and other song details */}
      <div className="ml-2 text-sm text-white">
        <p>Title: {title}</p>
        <p>Artist: {artistName}</p>
        <p>Album: {albumName}</p>
        <p>Release Date: {releaseDate}</p>
        <p>Duration: {formattedDuration}</p>
        <p>Genre: {genre}</p>
      </div>
    </div>
  );
};

export default Downloader;
