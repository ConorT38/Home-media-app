import React, { Component } from 'react';
import NavigationBar from '../../components/NavigationBar/NavigationBar';
import { withRouter } from "react-router-dom";
import { ReactVideo } from 'reactjs-media';

class Video extends Component {
    state = {
        videoId: decodeURI(window.location.href.match(/(?<=\/video\/).*/)[0]),
        title: "",
        views: "",
        videoPlayer: "",
        uploaded: ""
    };

    getSearchResults = videoId => {
        fetch("http://localhost:8081/api/video/" + videoId).then(res => res.json())
            .then(
                (result) => {
                    console.log(result);
                    this.setState({
                        title: result[0].title,
                        views: result[0].views,
                        videoPlayer: (
                            <ReactVideo
                                src={"http://192.168.0.21" + result[0].cdn_path}
                                // poster="https://www.example.com/poster.png"
                                primaryColor="#ff8c00"
                            />
                        ),
                        uploaded: result[0].uploaded
                    });
                },
                (error) => {
                    this.setState({
                        isLoaded: true,
                        error
                    });
                }
            )
    };

    unlisten = this.props.history.listen((location, action) => {
        this.setState({
            videoId: decodeURI(window.location.href.match(/(?<=\/video\/).*/)[0])
        });
        this.getSearchResults(
            decodeURI(window.location.href.match(/(?<=\/video\/).*/)[0])
        );
    });

    componentDidMount() {
        this.getSearchResults(this.state.videoId);
    }
    render() {
        const { id, title, videoPlayer, views, uploaded } = this.state;

        return (
            <React.Fragment>
                <NavigationBar />
                <div className="container">
                    {videoPlayer}
                    <h5>{title}</h5>
                    <br />
                    {views} views &middot; {uploaded}
                    <hr />
                </div>
            </React.Fragment >
        );
    }
}

export default withRouter(Video);