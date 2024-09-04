"use client";
import React from "react";
import { MdOutlineFileDownload } from "react-icons/md";
import useDownloader from "react-use-downloader";
import { MdDownloadForOffline } from "react-icons/md";

const Downloader = ({ activeSong, icon }) => {
  const { size, elapsed, percentage, download, error, isInProgress } =
    useDownloader();

  // Extract song URL for download
  const songUrl = activeSong?.downloadUrl?.[4]?.url;

  // Format the song filename
  const filename = `${activeSong?.name
    ?.replace("&#039;", "'")
    ?.replace("&amp;", "&")}.mp3`;

  // Extract song details
  const title = activeSong?.name || "Unknown Title";
  const artistName = activeSong?.primaryArtists || "Unknown Artist"; // Adjust if key differs
  const albumName = activeSong?.album || "Unknown Album"; // Adjust if key differs
  const releaseDate = activeSong?.releaseDate || "Unknown Release Date"; // Assuming release date is present
  const duration = activeSong?.duration || "Unknown Duration"; // Assuming duration is present in seconds
  const genre = activeSong?.genre || "Unknown Genre"; // Assuming genre is available

  // Format duration from seconds to minutes:seconds
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
          <div className="text-white font-extrabold text-xs m-">
            {percentage}%
          </div>
        ) : icon === 2 ? (
          <MdDownloadForOffline size={25} color={"#ffff"} />
        ) : (
          <MdOutlineFileDownload size={25} color={"#ffff"} />
        )}
      </div>

      {/* Display additional song information */}
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
