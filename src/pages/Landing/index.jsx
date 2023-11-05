import React, { Component } from "react";
import NavigationBar from "../../components/NavigationBar/NavigationBar";

class Landing extends Component {
  state = {
    mediaResults: [],
    currentTab: 0,
    errorLoading: false,
  };

  getMediaResults = (url, tab) => {
    fetch(url)
      .then((response) => {
        if (!response.ok) throw new Error(response.status);
        else return response.json();
      })
      .then(
        (result) => {
          this.setState({
            mediaResults: result,
            currentTab: tab,
          });
        },
        (error) => {
          this.setState({
            isLoaded: true,
            errorLoading: true,
          });
        }
      );
  };

  componentDidMount() {
    this.getMediaResults(
      "http://homemedia.lan:8081/api/top/media/",
      this.state.currentTab
    );
  }

  render() {
    const { mediaResults, currentTab, errorLoading } = this.state;
    return (
      <div className="App">
        <NavigationBar />
        <div className="py-5">
          <div className="container">
            <nav>
              <div className="nav nav-tabs" id="nav-tab" role="tablist">
                <a
                  className={
                    "nav-item nav-link " + (currentTab === 0 ? "active" : "")
                  }
                  onClick={(e) =>
                    this.getMediaResults(
                      "http://homemedia.lan:8081/api/top/media/",
                      0
                    )
                  }
                  id="nav-home-tab"
                  href="#Top-Viewed"
                >
                  Top Viewed
                </a>
                <a
                  className={
                    "nav-item nav-link " + (currentTab === 1 ? "active" : "")
                  }
                  onClick={(e) => this.setState({ currentTab: 1 })}
                  id="nav-profile-tab"
                  href="#Movies"
                >
                  Movies
                </a>
                <a
                  className={
                    "nav-item nav-link " + (currentTab === 2 ? "active" : "")
                  }
                  onClick={(e) => this.setState({ currentTab: 2 })}
                  id="nav-contact-tab"
                  href="#Shows"
                >
                  Shows
                </a>
              </div>
            </nav>
            <br />
            <div className="row hidden-md-up">
              {!errorLoading ? (
                mediaResults.map((object) => (
                  <div className="col-md-4">
                    <div className="card">
                      <div className="card-block">
                        <h5 className="card-title">
                          <a href={"/video/" + object.id}>{object.title}</a>
                        </h5>
                        <h6 className="card-subtitle text-muted">
                          {" "}
                          uploaded {object.uploaded}
                        </h6>
                        <p className="card-text p-y-1">
                          {object.views + " views"}{" "}
                        </p>
                      </div>
                    </div>
                    <br />
                  </div>
                ))
              ) : (
                <div className="card-title">
                  Error occurred getting top media
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Landing;
