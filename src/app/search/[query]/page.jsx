"use client";
import SwiperLayout from "@/components/Homepage/Swiper";
import SongCard from "@/components/Homepage/SongCard";
import { getSearchedData, getSongData } from "@/services/dataAPI";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { SwiperSlide } from "swiper/react";
import { BsPlayFill } from "react-icons/bs";
import { useDispatch } from "react-redux";
import { playPause, setActiveSong, setFullScreen } from "@/redux/features/playerSlice";
import Link from "next/link";
import SongListSkeleton from "@/components/SongListSkeleton";
import { setProgress } from "@/redux/features/loadingBarSlice";

const page = ({ params }) => {
  const dispatch = useDispatch();
  const decodedQuery = decodeURIComponent(params.query);
  const [searchedData, setSearchedData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentSongs } = useSelector((state) => state.player);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      dispatch(setProgress(70));
      try {
        const response = await getSearchedData(decodedQuery);
        if (!response) {
          setError("Could not fetch results. Check that NEXT_PUBLIC_SAAVN_API is set in your Netlify environment variables (e.g. https://saavn.dev).");
        } else {
          setSearchedData(response);
        }
      } catch (e) {
        setError("API error: " + e.message);
      }
      setLoading(false);
      dispatch(setProgress(100));
    };
    fetchData();
  }, [decodedQuery]);

  const handlePlayClick = async (song) => {
    if (song?.type === "song") {
      try {
        const Data = await getSongData(song?.id);
        const songData = Data?.[0];
        if (!songData) return;
        dispatch(setActiveSong({
          song: songData,
          data: currentSongs?.find((s) => s?.id === songData?.id)
            ? currentSongs
            : [...currentSongs, songData],
          i: currentSongs?.find((s) => s?.id === songData?.id)
            ? currentSongs?.findIndex((s) => s?.id === songData?.id)
            : currentSongs?.length,
        }));
        dispatch(setFullScreen(true));
        dispatch(playPause(true));
      } catch (e) {
        console.error("Play error:", e);
      }
    }
  };

  return (
    <div>
      <div className="w-11/12 m-auto mt-16">
        <div className="mt-10 text-gray-200">
          <h1 className="text-3xl font-bold">
            Search results for &quot;{decodedQuery}&quot;
          </h1>

          {error && (
            <div className="mt-6 bg-red-900/40 border border-red-500 text-red-300 rounded-lg p-4 text-sm">
              <p className="font-bold mb-1">⚠ API Error</p>
              <p>{error}</p>
              <p className="mt-2 text-gray-400">
                Go to <strong>Netlify → Site settings → Environment variables</strong> and set:<br />
                <code className="text-[#00e6e6]">NEXT_PUBLIC_SAAVN_API</code> = <code className="text-[#00e6e6]">https://saavn.dev</code>
              </p>
            </div>
          )}

          <div className="mt-10 text-gray-200">
            <h2 className="text-lg lg:text-4xl font-semibold">Songs</h2>
            {loading ? (
              <SongListSkeleton />
            ) : error ? null : searchedData?.songs?.results?.length > 0 ? (
              <div className="mt-5">
                {searchedData.songs.results.map((song, index) => (
                  <div
                    key={song?.id || index}
                    onClick={() => handlePlayClick(song)}
                    className="flex items-center mt-5 cursor-pointer group border-b-[1px] border-gray-400 justify-between"
                  >
                    <div className="flex items-center gap-5">
                      <div className="relative mb-3">
                        <img
                          src={song?.image?.[2]?.url || song?.image?.[1]?.url || song?.image?.[0]?.url}
                          alt={song?.title || song?.name}
                          width={50}
                          height={50}
                          className="rounded-lg w-12 h-12 object-cover"
                        />
                        <BsPlayFill
                          size={25}
                          className="group-hover:block hidden absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-gray-200"
                        />
                      </div>
                      <div className="w-32 lg:w-80">
                        <p className="text-sm lg:text-lg font-semibold truncate">
                          {(song?.title || song?.name)
                            ?.replace(/&#039;/g, "'")
                            ?.replace(/&amp;/g, "&")}
                        </p>
                        <p className="text-gray-400 truncate text-xs">
                          {song?.artists?.primary?.map((a) => a.name).join(", ") || song?.primaryArtists}
                        </p>
                      </div>
                    </div>
                    <div className="hidden lg:block max-w-56">
                      {(song?.primaryArtists || song?.artists?.primary?.length > 0) && (
                        <p className="text-gray-400 truncate">
                          By: {song?.primaryArtists || song?.artists?.primary?.map((a) => a.name).join(", ")}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 mt-5">No songs found.</p>
            )}
          </div>

          <div className="mt-10 text-gray-200">
            <SwiperLayout title={"Albums"}>
              {searchedData?.albums?.results?.map((song) => (
                <SwiperSlide key={song?.id}><SongCard song={song} /></SwiperSlide>
              ))}
            </SwiperLayout>
          </div>

          <div className="mt-10 text-gray-200">
            <SwiperLayout title={"Artists"}>
              {searchedData?.artists?.results?.map((artist) => (
                <SwiperSlide key={artist?.id}>
                  <Link href={`/artist/${artist?.id}`}>
                    <div className="flex flex-col justify-center items-center">
                      <img
                        src={artist?.image?.[2]?.url || artist?.image?.[1]?.url}
                        alt={artist?.name || artist?.title}
                        width={200}
                        height={200}
                        className="rounded-full w-[200px] h-[200px] object-cover"
                      />
                      <p className="lg:text-base lg:w-44 w-24 text-center text-xs font-semibold mt-3 truncate">
                        {(artist?.title || artist?.name)?.replace(/&amp;/g, "&")}
                      </p>
                      {artist?.description && (
                        <p className="text-gray-400 truncate text-[8px] lg:text-xs">{artist?.description}</p>
                      )}
                    </div>
                  </Link>
                </SwiperSlide>
              ))}
            </SwiperLayout>
          </div>

          <div className="mt-10 text-gray-200">
            <SwiperLayout title={"Playlists"}>
              {searchedData?.playlists?.results?.map((song) => (
                <SwiperSlide key={song?.id}><SongCard song={song} /></SwiperSlide>
              ))}
            </SwiperLayout>
          </div>
        </div>
      </div>
    </div>
  );
};

export default page;
