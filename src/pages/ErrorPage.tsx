import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';

const ErrorPage: React.FC = () => {
    return (
        <Container className="text-center mt-5">
            <Row>
                <Col>
                    <h1 className="display-4 text-danger">404</h1>
                    <p className="lead">Oops! The page you're looking for doesn't exist.</p>
                    <Button variant="primary" href="/">Go Back Home</Button>
                </Col>
            </Row>
        </Container>
    );
};

export default ErrorPage;