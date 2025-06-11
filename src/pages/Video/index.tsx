import React, { useState, useEffect } from "react";
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
  );
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

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [thumbnailEditType, setThumbnailEditType] = useState<"upload" | "link">("upload");
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailLink, setThumbnailLink] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [thumbnailSrc, setThumbnailSrc] = useState("");

  const location = useLocation();

  useEffect(() => {
    if (location.pathname) {
      setIsLoading(true);
      const matchedValue = location.pathname.match(/(?<=\/video\/).*/);
      if (matchedValue) {
        const id = decodeURI(matchedValue[0]);
        setVideoId(id);
        getSearchResults(id).then(
          (result) => {
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
          }
        );
      }
    }
  }, [location.pathname]);

  const handleEditVideo = async () => {
    setIsSubmitting(true);
    let thumbnailData: any = {};
    console.log("Editing video with ID:", thumbnailEditType, thumbnailFile, thumbnailLink);
    try {
      if (thumbnailEditType === "upload" && thumbnailFile) {
        // Upload image first
        const uploadResult = await uploadImage(thumbnailFile);
        console.log("Image uploaded successfully:", uploadResult);
        thumbnailData = {  thumbnailId: uploadResult.file.id };
      } else if (thumbnailEditType === "link" && thumbnailLink) {
        thumbnailData = { filePath: thumbnailLink, mediaType: 'video', filename:'null', };
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

  if (isLoading) {
    return (
      <Spinner animation="border" role="status">
        <span className="visually-hidden">Loading...</span>
      </Spinner>
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
              light={<img src={thumbnailSrc} />}
              controls={isControlsEnabled}
              url={`${getCdnHostEndpoint()+ cdnPath}`
              }
              width="100%"
              height="100%"
              style={{objectFit: "cover" }}
            />
          </div>
        ) : (
          <div
            onMouseEnter={() => setIsControlsEnabled(true)}
            onMouseLeave={() => setIsControlsEnabled(false)}
          >
            <ReactPlayer
              controls={isControlsEnabled}
              url={`${getCdnHostEndpoint()+ cdnPath}`}

              width="100%"
              height="100%"
            />
          </div>
        )}
        <div className="row">
          <br />
          <div className="col">
            <h5>{title}</h5>
          </div>
          <div className="col align-self-end">
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => setShowModal(true)}
            >
              Edit <FontAwesomeIcon icon={faEdit} />
            </button>
          </div>
        </div>
        <br />
        {views} views &middot; {new Date(uploaded).toLocaleDateString("en-US")}
        <hr />
      </div>

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
