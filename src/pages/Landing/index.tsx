import React, { useState, useEffect } from "react";
import NavigationBar from "../../components/NavigationBar/NavigationBar";
import { getHostEndpoint } from "../../utils/common";
import { Button, Card, Col, Container, Row } from "react-bootstrap";
import { Video } from "../../types";
import { Link } from "react-router-dom";

const Landing: React.FC = () => {
  const [mediaResults, setMediaResults] = useState<Video[]>([]);
  const [currentTab, setCurrentTab] = useState(0);
  const [errorLoading, setErrorLoading] = useState(false);

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
      getHostEndpoint() + ":8081/api/top/media/",
      currentTab
    );
  }, [currentTab]);

  return (
    <Container>
      <h4>Continue watching</h4>
      <hr />
      <Row>
        {mediaResults?.map((media, index) => (
          <Col key={index} xs={12} sm={6} md={4} lg={3} xl={2} className="d-flex justify-content-center mb-4">
            <Card style={{ width: "18rem" }}>

              <Card.Body>
                <Card.Img
                  variant="top"
                  src={'/default-thumbnail.jpg'}
                  style={{ height: "200px", objectFit: "cover" }}
                />
                <Card.Title><Link to={'/video/' + media.id} style={{ textDecoration: 'none' }}>{media.title}</Link></Card.Title>
                <Card.Text>
                  <Row>
                    <Col><small>{media?.views + ' views'}</small></Col>
                    <Col></Col>
                  </Row>
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default Landing;
