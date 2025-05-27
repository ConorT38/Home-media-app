import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Video } from "reactjs-media";
import { faCheck, faEdit } from "@fortawesome/free-solid-svg-icons";
import { useLocation } from "react-router-dom";
import { getHostAPIEndpoint, getHostEndpoint } from "../../utils/common";
import { Spinner } from "react-bootstrap";
import ReactPlayer from "react-player";

async function getSearchResults(videoId: string) {
  if (!videoId) return console.error("No videoId provided");
  return await fetch(getHostAPIEndpoint() + "/video/" + videoId).then(
    (res) => res.json()
  );
}

const VideoContent: React.FC = () => {
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
      const matchedValue = location.pathname.match(/(?<=\/video\/).*/);
      if (matchedValue) {
        const id = decodeURI(matchedValue[0]);
        getSearchResults(id).then(
          (result) => {
            setTitle(result[0].title);
            setVideoId(result[0].id);
            setViews(result[0].views);
            setCdnPath(result[0].cdn_path);
            setUploaded(result[0].uploaded);
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
    return (<Spinner animation="border" role="status">
      <span className="visually-hidden">Loading...</span>
    </Spinner>);
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

export default VideoContent;
