import React, { useState, useEffect, ReactNode } from "react";
import NavigationBar from "../../components/NavigationBar/NavigationBar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Video } from "reactjs-media";
import { faCheck, faEdit } from "@fortawesome/free-solid-svg-icons";
import { useLocation } from "react-router-dom";

async function getSearchResults(videoId: string) {
  if (!videoId) return console.error("No videoId provided");
  return await fetch("http://homemedia.lan:8081/api/video/" + videoId).then(
    (res) => res.json()
  );
}

const VideoContent: React.FC = () => {
  const [title, setTitle] = useState("");
  const [videoId, setVideoId] = useState("");
  const [editedTitle, setEditedTitle] = useState(title);
  const [views, setViews] = useState("");
  const [videoPlayer, setVideoPlayer] = useState<ReactNode | null>(null);
  const [uploaded, setUploaded] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);

  const location = useLocation();

  useEffect(() => {
    if (location.pathname) {
      const matchedValue = location.pathname.match(/(?<=\/video\/).*/);
      if (matchedValue) {
        const id = decodeURI(matchedValue[0]);
        getSearchResults(id).then(
          (result) => {
            setTitle(result[0].title);
            setVideoId(result[0].id);
            setViews(result[0].views);
            setVideoPlayer(
              <Video
                src={"http://cdn.homemedia.lan" + result[0].cdn_path}
                height={""}
                width={""}
                poster={""} // poster="https://www.example.com/poster.png"
              />
            );
            setUploaded(result[0].uploaded);
          },
          (error) => {
            console.error(error);
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
          "http://homemedia.lan:8081/api/video/" +
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

  return (
    <React.Fragment>
      <NavigationBar />
      <div className="container">
        <div className="row">{videoPlayer}</div>
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
        {views} views &middot; {uploaded}
        <hr />
      </div>
    </React.Fragment>
  );
};

export default VideoContent;
