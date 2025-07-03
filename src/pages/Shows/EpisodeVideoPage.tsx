import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faEdit } from "@fortawesome/free-solid-svg-icons";
import { useLocation } from "react-router-dom";
import { getCdnHostEndpoint, getHostAPIEndpoint, getHostEndpoint } from "../../utils/common";
import { Card, Container, Spinner } from "react-bootstrap";
import ReactPlayer from "react-player";
import { ShowEpisode } from "../../types";

async function getSearchResults(showId: number, seasonNumber: number, episodeNumber: number) {
  if (!showId || !seasonNumber || !episodeNumber) {
    console.error("Missing showId, seasonNumber, or episodeNumber");
    return null;
  }
  const url = `${getHostAPIEndpoint()}/show/${showId}/season/${seasonNumber}/episode/${episodeNumber}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Failed to fetch episode details");
  }
  return await res.json();
}

function removeFromContinueWatching(videoId: string) {
  const key = "continueWatchingIds";
  const stored = localStorage.getItem(key);
  if (!stored) return;
  try {
    const ids: string[] = JSON.parse(stored);
    const updatedIds = ids.filter(id => id !== videoId);
    localStorage.setItem(key, JSON.stringify(updatedIds));
  } catch (e) {
    console.error("Failed to update continueWatchingIds in localStorage", e);
  }
}

const EpisodeVideoPage: React.FC = () => {
  const [title, setTitle] = useState("");
  const [videoId, setVideoId] = useState("");
  const [editedTitle, setEditedTitle] = useState(title);
  const [views, setViews] = useState("");
  const [cdnPath, setCdnPath] = useState("");
  const [uploaded, setUploaded] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [isControlsEnabled, setIsControlsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [seasonId, setSeasonId] = useState<number>(0);
  const [episodeId, setEpisodeId] = useState<number>(0);
  const [seasons, setSeasons] = useState<{ seasonNumber: number; episodes: ShowEpisode[] }[]>([]);

  const location = useLocation();

  const getSeasonsDetails = async (showId: number) => {
    try {
      const response = await fetch(`${getHostEndpoint()}:8081/api/show/${showId}/season`);
      if (!response.ok) throw new Error(response.statusText);
      const result: any[] = await response.json();
      console.log("Seasons details fetched:", result);

      // Group episodes by season_number
      const grouped = result.reduce((acc: any, episode: any) => {
        const seasonNum = episode.season_number;
        if (!acc[seasonNum]) {
          acc[seasonNum] = [];
        }
        acc[seasonNum].push(episode);
        return acc;
      }, {});

      // Convert to array of { seasonNumber, episodes }
      const seasonsArr = Object.entries(grouped).map(([seasonNumber, episodes]) => ({
        seasonNumber: Number(seasonNumber),
        episodes: (episodes as any[]).map((ep) => ({
          id: ep.id,
          show_id: ep.show_id,
          season: ep.season_number,
          episodeNumber: ep.episode_number,
          video: {
            id: ep.video_id,
            filename: ep.filename,
            title: ep.title,
            cdn_path: ep.cdn_path,
            uploaded: ep.uploaded ? new Date(ep.uploaded) : null,
            views: ep.views,
            entertainment_type: ep.entertainment_type,
            thumbnail_cdn_path: ep.thumbnail_cdn_path,
          },
        }))
          .sort((a, b) => a.episodeNumber - b.episodeNumber)
          .filter(v => v.episodeNumber > episodeId) as ShowEpisode[],
      }));

      setSeasons(seasonsArr);
      console.log("Grouped seasons:", seasonsArr);
      return result;
    } catch (error) {
      console.error("Error fetching seasons details:", error);
      return null;
    }
  };

  useEffect(() => {
    if (location.pathname) {
      setIsLoading(true);
      const match = location.pathname.match(/\/show\/([^/]+)\/season\/([^/]+)\/episode\/([^/]+)/);
      const showId = Number(match?.[1]);
      const seasonId = Number(match?.[2]);
      const episodeId = Number(match?.[3]);
      const matchedValue = episodeId;
      console.log("Matched value:", matchedValue);
      if (matchedValue) {
        getSearchResults(showId, seasonId, episodeId).then(
          (result) => {
            console.log("Search results:", result);
            setTitle(result.title);
            setVideoId(result.id);
            setViews(result.views);
            setCdnPath(result.cdn_path);
            setUploaded(result.uploaded);
            setIsLoading(false);
          },
          (error) => {
            console.error(error);
            setIsLoading(false);
          }
        );
      }
      setSeasonId(seasonId);
      setEpisodeId(episodeId);
      getSeasonsDetails(showId);
    }
  }, [location.pathname]);

  useEffect(() => {
    const checkVideoCompletion = () => {
      const player = document.querySelector("video");
      if (player) {
        player.addEventListener("ended", () => {
          const currentSeason = seasons.find(s => s.seasonNumber === seasonId);
          if (currentSeason) {
            const nextEpisode = currentSeason.episodes.find(
              ep => ep.episodeNumber === episodeId + 1
            );
            if (nextEpisode) {
              window.location.href = `/show/${nextEpisode.show_id}/season/${nextEpisode.season}/episode/${nextEpisode.episodeNumber}`;
            } else {
              const nextSeason = seasons.find(s => s.seasonNumber === seasonId + 1);
              if (nextSeason && nextSeason.episodes.length > 0) {
                const firstEpisode = nextSeason.episodes[0];
                window.location.href = `/show/${firstEpisode.show_id}/season/${firstEpisode.season}/episode/${firstEpisode.episodeNumber}`;
              }
            }
          }
        });
      }
    };

    checkVideoCompletion();
  }, [seasons, seasonId, episodeId]);

  const handleEditVideoName = (title: string) => {
    if (title) {
      const newTitle = title.trim();
      if (newTitle) {
        setTitle(newTitle);
        setIsEditMode(false);

        // Send the new title to the backend
        fetch(
          getHostEndpoint() + ":8081/api/video/" +
          location.pathname.split("/")[2],
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ id: videoId, title: newTitle }),
          }
        ).then((res) => {
          if (!res.ok) {
            console.error("Failed to update video title");
          }
        });
      }
    }
  };

  if (isLoading) {
    return (<div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh" }}>
      <Spinner animation="border" role="status">
        <span className="visually-hidden">Loading...</span>
      </Spinner>
    </div>);
  }

  return (
    <React.Fragment>
      <div className="container">
        <div
          onMouseEnter={() => setIsControlsEnabled(true)}
          onMouseLeave={() => setIsControlsEnabled(false)}
        >
          <ReactPlayer
            controls={isControlsEnabled}
            url={
              window.location.hostname === "localhost"
                ? "http://192.168.0.23:8000" + cdnPath
                : getHostEndpoint() + ":8000" + cdnPath
            }
            width="100%"
            height="100%"
          />
        </div>
        <div className="row">
          <br />
          <div className="col">
            {!isEditMode ? (
              <h5>{title}</h5>
            ) : (
              <div>
                <input
                  type="text"
                  className="form-control"
                  id="titleInput"
                  placeholder={title}
                  onChange={(e) => setEditedTitle(e.target.value)}
                />
              </div>
            )}
          </div>
          <div className="col align-self-end">
            {!isEditMode ? (
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => setIsEditMode(true)}
              >
                Edit <FontAwesomeIcon icon={faEdit} />
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-outline-success"
                onClick={() => handleEditVideoName(editedTitle)}
              >
                Submit <FontAwesomeIcon icon={faCheck} />
              </button>
            )}
          </div>
        </div>
        <br />
        {views} views &middot; {new Date(uploaded).toLocaleDateString("en-US")}
        <hr />

        {/* Next Episode Button */}
        {(() => {
          // Find the current season
          const currentSeason = seasons.find(s => s.seasonNumber === seasonId);
          if (!currentSeason) return null;
          // Find the next episode in the current season
          const nextEpisode = currentSeason.episodes.find(
            ep => ep.episodeNumber === episodeId + 1
          );
          if (!nextEpisode) return null;
          // Build the link for the next episode
          const nextLink = `/show/${nextEpisode.show_id}/season/${nextEpisode.season}/episode/${nextEpisode.episodeNumber}`;
          return (
            <div className="d-flex justify-content-center my-4">
              <a
                href={nextLink}
                className="btn btn-primary btn-lg"
                style={{ fontSize: "1.5rem", padding: "1rem 2.5rem" }}
                onClick={(e) => {
                  removeFromContinueWatching(videoId);
                }}
              >
                Next Episode &rarr;
              </a>
            </div>
          );
        })()}
      </div>
      <Container className="mt-4">
        {seasons && seasons.length > 0 ? (
          seasons.map((season: any) => (
            <>
              <h3 key={season.seasonNumber} className="mt-4">
                Season {season.seasonNumber}
              </h3>
              <div
                id={`season-${season.seasonNumber}-episodes-row`}
                style={{
                  overflowX: "auto",
                  paddingBottom: "1rem",
                  scrollbarWidth: "none", // Firefox
                  msOverflowStyle: "none", // IE/Edge
                }}
                className="hide-scrollbar"
              >
                <div style={{ display: "inline-flex", gap: "1rem" }}>
                  {season.episodes?.map((episode: ShowEpisode, index: number) => (
                    <Card
                      key={episode.id || index}
                      style={{
                        width: "18rem",
                        display: "inline-block",
                        verticalAlign: "top",
                        minWidth: "18rem",
                        maxWidth: "18rem",
                      }}
                    >
                      <Card.Img
                        loading="lazy"
                        variant="top"
                        src={
                          episode.video?.thumbnail_cdn_path
                            ? `${getCdnHostEndpoint()}${episode.video.thumbnail_cdn_path}`
                            : "/default-thumbnail.jpg"
                        }
                        style={{ height: "200px", objectFit: "cover" }}
                      />
                      <Card.Body>
                        <Card.Title>
                          <span>
                            {`S${season.seasonNumber}E${episode.episodeNumber}: `}
                            <a
                              href={`/video/${episode.video.id}`}
                              style={{ textDecoration: "none" }}
                            >
                              {episode.video.title}
                            </a>
                          </span>
                        </Card.Title>
                        <Card.Text>
                          <small>{episode.video?.views ?? 0} views</small>
                        </Card.Text>
                      </Card.Body>
                    </Card>
                  ))}
                </div>
              </div>
            </>
          ))
        ) : (
          <div className="text-center">
            <p>No seasons yet. Add a season to get started!</p>

          </div>
        )}
      </Container>
    </React.Fragment>
  );
};

export default EpisodeVideoPage;
