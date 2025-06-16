import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faEdit } from "@fortawesome/free-solid-svg-icons";
import { useLocation } from "react-router-dom";
import { getCdnHostEndpoint, getHostAPIEndpoint, getHostEndpoint } from "../../utils/common";
import { Card, Container, Spinner } from "react-bootstrap";
import ReactPlayer from "react-player";
import { ShowEpisode } from "../../types";

async function getSearchResults(movieId: number) {
    if (!movieId) {
        console.error("Missing movieId");
        return null;
    }
    const url = `${getHostAPIEndpoint()}/movie/${movieId}`;
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

const MovieVideoPage: React.FC = () => {
    const [title, setTitle] = useState("");
    const [videoId, setVideoId] = useState("");
    const [editedTitle, setEditedTitle] = useState(title);
    const [views, setViews] = useState("");
    const [cdnPath, setCdnPath] = useState("");
    const [uploaded, setUploaded] = useState("");
    const [isEditMode, setIsEditMode] = useState(false);
    const [isControlsEnabled, setIsControlsEnabled] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const location = useLocation();

    useEffect(() => {
        if (location.pathname) {
            setIsLoading(true);
            const match = location.pathname.match(/\/movie\/([^/]+)/);
            const movieId = Number(match?.[1]);
            const matchedValue = movieId;
            console.log("Matched value:", matchedValue);
            if (matchedValue) {
                getSearchResults(movieId).then(
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
        }
    }, [location.pathname]);

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

            </div>
        </React.Fragment>
    );
};

export default MovieVideoPage;
