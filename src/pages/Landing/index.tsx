import React, { useState, useEffect } from "react";
import { getCdnHostEndpoint, getHostAPIEndpoint, getHostEndpoint } from "../../utils/common";
import { Button, Card, Col, Container, Row } from "react-bootstrap";
import { Video } from "../../types";
import { Link } from "react-router-dom";

const Landing: React.FC = () => {
  const [mediaResults, setMediaResults] = useState<Video[]>([]);
  const [currentTab, setCurrentTab] = useState(0);
  const [errorLoading, setErrorLoading] = useState(false);

  const [continueWatchingResults, setContinueWatchingResults] = useState<Video[]>([]);

  const removeFromContinueWatching = (id: number) => {
    const idsString = localStorage.getItem("continueWatchingIds");
    if (idsString) {
      try {
        const ids: number[] = JSON.parse(idsString);
        const updatedIds = ids.filter((itemId) => itemId !== id);
        localStorage.setItem("continueWatchingIds", JSON.stringify(updatedIds));
        setContinueWatchingResults((prev) =>
          prev.filter((media) => media.id !== id)
        );
      } catch {
        console.error("Error parsing continue watching IDs");
      }
    }
  };

  useEffect(() => {
    const idsString = localStorage.getItem("continueWatchingIds");
    if (idsString) {
      try {
        console.log("Continue watching IDs string:", idsString);
       const items: { id: number; time: number }[] = JSON.parse(idsString);
        const ids = items.map((item) => item.id);
        console.log("Continue watching IDs:", ids);
        if (Array.isArray(ids) && ids.length > 0) {
          // Send ids as a comma-separated string in the query parameter
          const query = encodeURIComponent(ids.join(","));
          fetch(getHostAPIEndpoint() + `/video/by-ids?ids=${query}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          })
            .then((response) => {
              if (!response.ok) throw new Error(response.statusText);
              return response.json();
            })
            .then((result) => {
              console.log("Continue watching results:", result);
              setContinueWatchingResults(result?.items);
            })
            .catch(() => setContinueWatchingResults([]));
        }
      } catch {
        setContinueWatchingResults([]);
      }
    }
  }, []);

  const getMediaResults = (url: string, tab: number) => {
    fetch(url)
      .then((response) => {
        if (!response.ok) throw new Error(response.statusText);
        else return response.json();
      })
      .then(
        (result) => {
          setMediaResults(result);
          console.log(result);
          setCurrentTab(tab);
        },
        (error) => {
          setErrorLoading(true);
        }
      );
  };

  useEffect(() => {
    getMediaResults(
      getHostAPIEndpoint() + "/top/media/",
      currentTab
    );
  }, [currentTab]);

  // Helper to scroll the container
  const scrollContainer = (containerId: string, direction: "left" | "right") => {
    const container = document.getElementById(containerId);
    if (container) {
      const scrollAmount = 300;
      container.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <Container fluid style={{ maxWidth: "1600px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h4>Recently Added</h4>
        <div>
          <Button
            variant="dark"
            size="sm"
            onClick={() => scrollContainer("recently-added-container", "left")}
            style={{ marginRight: 4 }}
          >
            &#8592;
          </Button>
          <Button
            variant="dark"
            size="sm"
            onClick={() => scrollContainer("recently-added-container", "right")}
          >
            &#8594;
          </Button>
        </div>
      </div>
      <hr />
      <div
        id="recently-added-container"
        style={{
          overflowX: "auto",
          paddingBottom: "1rem",
          scrollbarWidth: "none", // Firefox
          msOverflowStyle: "none", // IE/Edge
        }}
        className="hide-scrollbar"
      >
        <div style={{ display: "inline-flex", gap: "1rem" }}>
          {mediaResults?.map((media, index) => (
            <Card
              key={index}
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
                  media?.thumbnail_cdn_path
                    ? `${getCdnHostEndpoint()}${media?.thumbnail_cdn_path}`
                    : "/default-thumbnail.jpg"
                }
                style={{ height: "200px", objectFit: "cover" }}
              />
              <Card.Body>
                <Card.Title>
                  <Link
                    to={"/video/" + media.id}
                    style={{ textDecoration: "none" }}
                  >
                    {media.title}
                  </Link>
                </Card.Title>
                <Card.Text>
                  <Row>
                    <Col>
                      <small>{media?.views + " views"}</small>
                    </Col>
                    <Col></Col>
                  </Row>
                </Card.Text>
              </Card.Body>
            </Card>
          ))}
        </div>
      </div>
      {(continueWatchingResults.length > 0) && (
        <>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <h4>Continue watching</h4>
            <div>
              <Button
                variant="dark"
                size="sm"
                onClick={() => scrollContainer("continue-watching-container", "left")}
                style={{ marginRight: 4 }}
              >
                &#8592;
              </Button>
              <Button
                variant="dark"
                size="sm"
                onClick={() => scrollContainer("continue-watching-container", "right")}
              >
                &#8594;
              </Button>
            </div>
          </div>
          <hr />
          <div
            id="continue-watching-container"
            style={{
              overflowX: "auto",
              paddingBottom: "1rem",
              scrollbarWidth: "none", // Firefox
              msOverflowStyle: "none", // IE/Edge
            }}
            className="hide-scrollbar"
          >
            <div style={{ display: "inline-flex", gap: "1rem" }}>
              {continueWatchingResults?.map((media, index) => (
                <Card
                  key={index}
                  style={{
                  width: "18rem",
                  display: "inline-block",
                  verticalAlign: "top",
                  minWidth: "18rem",
                  maxWidth: "18rem",
                  position: "relative",
                  }}
                >
                  {/* Close button */}
                  <Button
                  variant="light"
                  size="sm"
                  style={{
                    position: "absolute",
                    top: 6,
                    right: 6,
                    zIndex: 2,
                    borderRadius: "50%",
                    padding: "0.25rem 0.5rem",
                    lineHeight: 1,
                  }}
                  onClick={() => removeFromContinueWatching(media.id)}
                  >
                  &times;
                  </Button>
                  <Card.Img
                    loading="lazy"
                    variant="top"
                    src={
                      media?.thumbnail_cdn_path
                        ? `${getCdnHostEndpoint()}${media?.thumbnail_cdn_path}`
                        : "/default-thumbnail.jpg"
                    }
                    style={{ height: "200px", objectFit: "cover" }}
                  />
                  {/* Progress bar */}
                  <div
                    style={{
                      position: "absolute",
                      left: 0,
                      bottom: 0,
                      width: "100%",
                      height: "6px",
                      background: "#303030",
                      borderBottomLeftRadius: "0.375rem",
                      borderBottomRightRadius: "0.375rem",
                      overflow: "hidden",
                      zIndex: 1,
                      pointerEvents: "none",
                    }}
                  >
                    <div
                      style={{
                        width: `${(() => {
                          const idsString = localStorage.getItem("continueWatchingIds");
                          if (idsString) {
                            try {
                              const items: { id: number; time: number; finished?: number }[] = JSON.parse(idsString);
                              const found = items.find((item) => item.id === media.id);
                              return Math.round((found?.finished ?? 0));
                            } catch {
                              return 0;
                            }
                          }
                          return 0;
                        })()}%`,
                        height: "100%",
                        background: "tomato",
                        transition: "width 0.3s",
                      }}
                    />
                  </div>
                  <Card.Body>
                  <Card.Title>
                    <Link
                    to={"/video/" + media.id}
                    style={{ textDecoration: "none" }}
                    >
                    {media.title}
                    </Link>
                  </Card.Title>
                  <Card.Text>
                    <Row>
                    <Col>
                      <small>{media?.views + " views"}</small>
                    </Col>
                    <Col></Col>
                    </Row>
                  </Card.Text>
                  </Card.Body>
                </Card>
              ))}
            </div>
          </div>
        </>
      )}
    </Container>
  );
}
export default Landing;
