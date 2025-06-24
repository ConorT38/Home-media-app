import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faEdit } from "@fortawesome/free-solid-svg-icons";
import { useLocation } from "react-router-dom";
import { getCdnHostEndpoint, getHostAPIEndpoint, getHostEndpoint } from "../../utils/common";
import { Spinner, Modal, Button, Form } from "react-bootstrap";
import ReactPlayer from "react-player";

async function getSearchResults(videoId: string) {
  if (!videoId) return console.error("No videoId provided");
  return await fetch(getHostAPIEndpoint() + "/video/" + videoId).then(
    (res) => res.json()
  ).catch((error) => {
    console.error("Error fetching video details:", error);
    throw new Error("Failed to fetch video details");
  });
}

async function uploadImage(file: File) {
  const formData = new FormData();
  formData.append("image", file);
  const res = await fetch(getHostAPIEndpoint() + "/image/upload", {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error("Image upload failed");
  return res.json(); // expects { id, filename }
}

const VideoContent: React.FC = () => {
  const [title, setTitle] = useState("");
  const [videoId, setVideoId] = useState("");
  const [editedTitle, setEditedTitle] = useState(title);
  const [views, setViews] = useState("");
  const [cdnPath, setCdnPath] = useState("");
  const [uploaded, setUploaded] = useState("");
  const [isControlsEnabled, setIsControlsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorFetching, setErrorFetching] = useState(false);
  const [continueTime, setContinueTime] = useState<number | null>(null);
  const [hasSeeked, setHasSeeked] = useState(false);


  const playerRef = useRef<ReactPlayer>(null);
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [thumbnailEditType, setThumbnailEditType] = useState<"upload" | "link">("upload");
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailLink, setThumbnailLink] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [thumbnailSrc, setThumbnailSrc] = useState("");

  // Delete Modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const handleDeleteImage = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(
        getHostAPIEndpoint() + "/video/" + videoId,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        }
      );
      if (!response.ok) {
        throw new Error("Failed to delete video");
      }
      setShowDeleteModal(false);
      // Optionally, redirect or update state to reflect deletion
      console.log("Video deleted successfully");
      // Redirect to home or another page
      window.location.href = "/";
    } catch (error) {
      console.error("Error deleting video:", error);
      setShowDeleteModal(false);
    } finally {
      setIsDeleting(false);
    }
  };
  useEffect(() => {
    if (videoId) {
      const checkEpisodeInfo = async () => {
        try {
          const response = await fetch(
            `${getHostAPIEndpoint()}/video/${videoId}/episode-info`
          );
          if (response.ok) {
            console.log("Episode info found for videoId:", videoId);
            const episodeInfo = await response.json();
            const { show_id, season_number, episode_number } = episodeInfo;
            window.location.href = `/show/${show_id}/season/${season_number}/episode/${episode_number}`;
          }
        } catch (error) {
          console.error("Error checking episode info:", error);
        }
      };
      checkEpisodeInfo();
    }
  }, [videoId]);

  useEffect(() => {
    const handleBeforeUnload = () => {
  if (videoId) {
    const key = "continueWatchingIds";
    let ids: { id: number, time: number, finished:number }[] = [];
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        ids = JSON.parse(stored).filter((item: any) => typeof item.id === "number" && typeof item.time === "number");
      }
    } catch { }
    const intId = parseInt(videoId, 10);
    const currentTime = playerRef.current?.getCurrentTime?.();
     const duration = playerRef.current?.getDuration?.();
    let finishedPerc = 0;
    if (typeof currentTime === "number" && typeof duration === "number" && duration > 0) {
      finishedPerc = Math.min(100, Math.round((currentTime / duration) * 100));
      // You can now use finishedPerc as needed, e.g., log or store it
      console.log("Finished percent:", finishedPerc);
    }
if (typeof currentTime === "number" && currentTime > 1) { // avoid saving 0 or near-zero times
  ids = ids.filter(item => item.id !== intId);
  ids.push({ id: intId, time: currentTime, finished: finishedPerc });
  localStorage.setItem(key, JSON.stringify(ids));
}
    
  }
};

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      handleBeforeUnload();
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [videoId]);

   useEffect(() => {
    const key = "continueWatchingIds";
    const stored = localStorage.getItem(key);
    if (stored && videoId) {
      try {
        const ids = JSON.parse(stored);
        const entry = ids.find((item: any) => item.id === parseInt(videoId, 10));
        if (entry) {
          setContinueTime(entry.time);
        }
      } catch {}
    }
    setHasSeeked(false); // Reset seeked state when videoId changes
  }, [videoId]);

  // Handler for when the player is ready
  const handlePlayerReady = () => {
    if (!hasSeeked && continueTime && playerRef.current) {
      playerRef.current.seekTo(continueTime, "seconds");
      setHasSeeked(true);
      console.log("Sought to continue time:", continueTime);
    }
  };

  const location = useLocation();

  useEffect(() => {
    if (!videoId) return;
    const key = "continueWatchingIds";
    const intId = parseInt(videoId, 10);

    const updateContinueWatching = () => {
      let ids: { id: number, time: number, finished:number}[] = [];
      try {
        const stored = localStorage.getItem(key);
        if (stored) {
          ids = JSON.parse(stored).filter((item: any) => typeof item.id === "number" && typeof item.time === "number");
        }
      } catch { }
          const currentTime = playerRef.current?.getCurrentTime?.();
    const duration = playerRef.current?.getDuration?.();
    let finishedPerc = 0;
    if (typeof currentTime === "number" && typeof duration === "number" && duration > 0) {
      finishedPerc = Math.min(100, Math.round((currentTime / duration) * 100));
      // You can now use finishedPerc as needed, e.g., log or store it
      console.log("Finished percent:", finishedPerc);
    }
      if (typeof currentTime === "number" && currentTime > 1) {
        ids = ids.filter(item => item.id !== intId);
        ids.push({ id: intId, time: currentTime, finished: finishedPerc });
        localStorage.setItem(key, JSON.stringify(ids));
      }
    };

    const interval = setInterval(updateContinueWatching, 15000);

    return () => clearInterval(interval);
  }, [videoId]);

  useEffect(() => {
    if (location.pathname) {
      setIsLoading(true);
      const matchedValue = location.pathname.match(/(?<=\/video\/).*/);
      if (matchedValue) {
        const id = decodeURI(matchedValue[0]);
        setVideoId(id);
        getSearchResults(id).then(
          (result) => {
            if (result?.error) {
              setErrorFetching(true);
              setTitle("Error fetching video details");
              setIsLoading(false);
              return;
            }
            setTitle(result?.title);
            setEditedTitle(result?.title);
            setVideoId(result?.id);
            setViews(result?.views);
            setCdnPath(result?.cdn_path);
            setUploaded(result?.uploaded);
            setIsLoading(false);
            setThumbnailSrc(
              result?.thumbnail_cdn_path
                ? getHostEndpoint() + ":8000" + result.thumbnail_cdn_path
                : ""
            );
            console.log("Video details fetched:", result);
          },
          (error) => {
            console.error(error);
            setIsLoading(false);
            setErrorFetching(true);
            setTitle("Error fetching video details");
          }
        );
      }
    }
  }, [location.pathname]);

  useEffect(() => {
  const key = "continueWatchingIds";
  const stored = localStorage.getItem(key);
  if (stored && videoId) {
    try {
      const ids = JSON.parse(stored);
      const entry = ids.find((item: any) => item.id === parseInt(videoId, 10));
      if (entry && playerRef.current) {
        playerRef.current.seekTo(entry.time, "seconds");
        console.log("Resuming video from time:", entry.time);
      }
    } catch {}
  }
}, [videoId]);

  const handleEditVideo = async () => {
    setIsSubmitting(true);
    let thumbnailData: any = {};
    console.log("Editing video with ID:", thumbnailEditType, thumbnailFile, thumbnailLink);
    try {
      if (thumbnailEditType === "upload" && thumbnailFile) {
        // Upload image first
        const uploadResult = await uploadImage(thumbnailFile);
        console.log("Image uploaded successfully:", uploadResult);
        thumbnailData = { thumbnailId: uploadResult.file.id };
      } else if (thumbnailEditType === "link" && thumbnailLink) {
        thumbnailData = { filePath: thumbnailLink, mediaType: 'video', filename: 'null', };
      }

      console.log("Thumbnail data to be sent:", JSON.stringify({
        id: videoId,
        title: editedTitle.trim(),
        ...thumbnailData,
      }));

      // Update video
      await fetch(
        getHostEndpoint() + ":8081/api/video/" + location.pathname.split("/")[2],
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: videoId,
            title: editedTitle.trim(),
            ...thumbnailData,
          }),
        }
      );
      setTitle(editedTitle.trim());
      setShowModal(false);
    } catch (e) {
      console.error(e);
    }
    setIsSubmitting(false);
  };

  if (errorFetching) {
    return (
      <div className="container">
        <h5>Error fetching video details</h5>
        <p>Please try again later.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "50vh" }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  return (
    <React.Fragment>
      <div className="container">
        {thumbnailSrc ? (
          <div
            onMouseEnter={() => setIsControlsEnabled(true)}
            onMouseLeave={() => setIsControlsEnabled(false)}
          >
            <ReactPlayer
              light={<img loading="lazy" src={thumbnailSrc} />}
              controls={isControlsEnabled}
              url={`${getCdnHostEndpoint() + cdnPath}`
              }
              ref={playerRef}
              width="100%"
              height="100%"
              style={{ objectFit: "cover" }}
              onReady={handlePlayerReady}
            />
          </div>
        ) : (
          <div
            onMouseEnter={() => setIsControlsEnabled(true)}
            onMouseLeave={() => setIsControlsEnabled(false)}
          >
            <ReactPlayer
              controls={isControlsEnabled}
              url={`${getCdnHostEndpoint() + cdnPath}`}
              ref={playerRef}
              width="100%"
              height="100%"
              onReady={handlePlayerReady}
            />
          </div>
        )}
        <div className="row">
          <br />
          <div className="col">
            <h5>{title}</h5>
          </div>
          <div className="col d-flex justify-content-end gap-2">
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => setShowModal(true)}
            >
              Edit <FontAwesomeIcon icon={faEdit} />
            </button>
            <button
              type="button"
              className="btn btn-outline-danger"
              onClick={() => setShowDeleteModal(true)}
            >
              Delete
            </button>
          </div>
        </div>
        <br />
        {views} views &middot; {new Date(uploaded).toLocaleDateString("en-US")}
        <hr />
      </div>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this image? This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDeleteImage}
            disabled={isDeleting}
          >
            Delete
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Video</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="editTitle">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
              />
            </Form.Group>
            <Form.Group controlId="editThumbnailType" className="mt-3">
              <Form.Label>Thumbnail</Form.Label>
              <Form.Select
                value={thumbnailEditType}
                onChange={(e) =>
                  setThumbnailEditType(e.target.value as "upload" | "link")
                }
              >
                <option value="upload">Upload</option>
                <option value="link">Link</option>
              </Form.Select>
            </Form.Group>
            {thumbnailEditType === "upload" ? (
              <Form.Group controlId="editThumbnailUpload" className="mt-2">
                <Form.Label>Upload Image</Form.Label>
                <Form.Control
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const input = e.target as HTMLInputElement;
                    setThumbnailFile(input.files ? input.files[0] : null);
                  }}
                />
              </Form.Group>
            ) : (
              <Form.Group controlId="editThumbnailLink" className="mt-2">
                <Form.Label>Image Link</Form.Label>
                <Form.Control
                  type="text"
                  value={thumbnailLink}
                  onChange={(e) => setThumbnailLink(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
              </Form.Group>
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button
            variant="success"
            onClick={handleEditVideo}
            disabled={isSubmitting}
          >
            Submit <FontAwesomeIcon icon={faCheck} />
          </Button>
        </Modal.Footer>
      </Modal>
    </React.Fragment>
  );
};

export default VideoContent;
