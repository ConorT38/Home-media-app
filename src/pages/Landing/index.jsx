import React, { Component } from "react";
import NavigationBar from "../../components/NavigationBar/NavigationBar";

class Landing extends Component {
  state = {
    mediaResults: []
  };

  getMediaResults = () => {
    fetch("http://localhost:8081/api/top/media/").then(res => res.json())
      .then(
        (result) => {
          console.log(result);
          this.setState({
            mediaResults: result
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

  componentDidMount() {
    this.getMediaResults();
  }

  render() {
    const { mediaResults } = this.state;
    return <div className="App">
      <NavigationBar />
      <div className="py-5">
        <div className="container">
          <h3>Latest Media</h3>
          <div className="row hidden-md-up">
            {mediaResults.map(object => (
              <div className="col-md-4">
                <div className="card">
                  <div className="card-block">
                    <h5 className="card-title"><a href={"/video/" + object.id}>{object.title}</a></h5>
                    <h6 className="card-subtitle text-muted"> uploaded {object.uploaded}</h6>
                    <p className="card-text p-y-1">{object.views + " views"} </p>
                  </div>
                </div>
                <br />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>;
  }
}

export default Landing;
