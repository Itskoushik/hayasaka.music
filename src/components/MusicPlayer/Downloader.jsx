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

  // Extract artist and album details from activeSong
  const artistName = activeSong?.primaryArtists || "Unknown Artist";
  const albumName = activeSong?.album || "Unknown Album";

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

      {/* Display artist and album details */}
      <div className="ml-2 text-sm text-white">
        <p>Artist: {artistName}</p>
        <p>Album: {albumName}</p>
      </div>
    </div>
  );
};

export default Downloader;
