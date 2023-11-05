import React, { Component } from "react";
import NavigationBar from "../../components/NavigationBar/NavigationBar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { withRouter } from "react-router-dom";
import { ReactVideo } from "reactjs-media";
import { faCheck, faSquarePen } from "@fortawesome/free-solid-svg-icons";

class Video extends Component {
  state = {
    videoId: decodeURI(window.location.href.match(/(?<=\/video\/).*/)[0]),
    title: "",
    views: "",
    videoPlayer: "",
    uploaded: "",
    isEditMode: false,
  };

  getSearchResults = (videoId) => {
    fetch("http://homemedia.lan:8081/api/video/" + videoId)
      .then((res) => res.json())
      .then(
        (result) => {
          console.log(result);
          this.setState({
            title: result[0].title,
            views: result[0].views,
            videoPlayer: (
              <ReactVideo
                src={"http://cdn.homemedia.lan" + result[0].cdn_path}
                // poster="https://www.example.com/poster.png"
                primaryColor="#ff8c00"
              />
            ),
            uploaded: result[0].uploaded,
          });
        },
        (error) => {
          this.setState({
            isLoaded: true,
            error,
          });
        }
      );
  };

  unlisten = this.props.history.listen((location, action) => {
    this.setState({
      videoId: decodeURI(window.location.href.match(/(?<=\/video\/).*/)[0]),
    });
    this.getSearchResults(
      decodeURI(window.location.href.match(/(?<=\/video\/).*/)[0])
    );
  });

  componentDidMount() {
    this.getSearchResults(this.state.videoId);
  }
  render() {
    const { id, title, videoPlayer, views, uploaded, isEditMode } = this.state;

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
                  />
                </div>
              )}
            </div>
            <div className="col align-self-end">
              {!isEditMode ? (
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => this.setState({ isEditMode: true })}
                >
                  Edit <FontAwesomeIcon icon={faSquarePen} />
                </button>
              ) : (
                <button
                  type="button"
                  className="btn btn-outline-success"
                  onClick={() => this.setState({ isEditMode: false })}
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
  }
}

export default withRouter(Video);
