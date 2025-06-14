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

  useEffect(() => {
    const idsString = localStorage.getItem("continueWatchingIds");
    if (idsString) {
      try {
        const ids: number[] = JSON.parse(idsString);
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
                  }}
                >
                  <Card.Img
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
        </>
      )}
    </Container>
  );
}
export default Landing;
