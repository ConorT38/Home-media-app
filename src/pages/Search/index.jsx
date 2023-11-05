import React, { Component } from "react";
import SearchResultsList from "../../components/Search/SearchResultsList";
import NavigationBar from "../../components/NavigationBar/NavigationBar";
import { withRouter } from "react-router-dom";

class Search extends Component {
  state = {
    searchTerm: decodeURI(window.location.href.match(/(?<=\/search\/).*/)[0]),
    searchResults: [],
    currentTab: 0,
    errorLoading: false,
  };

  getSearchResults = (searchTerm) => {
    fetch("http://homemedia.lan:8081/api/search/" + searchTerm)
      .then((response) => {
        if (!response.ok) throw new Error(response.status);
        else return response.json();
      })
      .then(
        (result) => {
          this.setState({
            searchResults: result,
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

  unlisten = this.props.history.listen((location, action) => {
    this.setState({
      searchTerm: decodeURI(window.location.href.match(/(?<=\/search\/).*/)[0]),
    });
    console.log(decodeURI(window.location.href.match(/(?<=\/search\/).*/)[0]));
    this.getSearchResults(
      decodeURI(window.location.href.match(/(?<=\/search\/).*/)[0])
    );
  });

  componentDidMount() {
    this.getSearchResults(this.state.searchTerm);
  }

  componentWillUnmount() {
    this.unlisten();
  }

  render() {
    const { searchTerm, searchResults, currentTab, errorLoading, error } =
      this.state;
    return (
      <React.Fragment>
        <NavigationBar />
        <div className="container">
          {!errorLoading ? (
            <>
              <div className="card-title">
                Showing results for: {searchTerm}
              </div>
              <nav>
                <div className="nav nav-tabs" id="nav-tab" role="tablist">
                  <a
                    className={
                      "nav-item nav-link " + (currentTab === 0 ? "active" : "")
                    }
                    onClick={(e) => this.setState({ currentTab: 0 })}
                    id="nav-home-tab"
                    href="javascript:;"
                  >
                    Movies ({searchResults.length})
                  </a>
                  <a
                    className={
                      "nav-item nav-link " + (currentTab === 1 ? "active" : "")
                    }
                    onClick={(e) => this.setState({ currentTab: 1 })}
                    id="nav-profile-tab"
                    href="javascript:;"
                  >
                    Series ({searchResults.length})
                  </a>
                  <a
                    className={
                      "nav-item nav-link " + (currentTab === 2 ? "active" : "")
                    }
                    onClick={(e) => this.setState({ currentTab: 2 })}
                    id="nav-contact-tab"
                    href="javascript:;"
                  >
                    Documentaries ({searchResults.length})
                  </a>
                </div>
              </nav>
              {searchResults.length < 1 ? (
                <div>No Search Results for that term</div>
              ) : (
                <div>
                  <br />
                  <SearchResultsList searchResults={searchResults} />
                </div>
              )}
            </>
          ) : (
            <div className="card-title">
              Error occurred searching for: {searchTerm}
            </div>
          )}
        </div>
      </React.Fragment>
    );
  }
}

export default withRouter(Search);
