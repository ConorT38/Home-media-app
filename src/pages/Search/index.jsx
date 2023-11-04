import React, { Component } from "react";
import SearchResultsList from "../../components/Search/SearchResultsList";
import NavigationBar from "../../components/NavigationBar/NavigationBar";
import { withRouter } from "react-router-dom";

class Search extends Component {
    state = {
        searchTerm: decodeURI(window.location.href.match(/(?<=\/search\/).*/)[0]),
        searchResults: []
    };

    getSearchResults = searchTerm => {
        fetch("http://homemedia.lan:8081/api/search/" + searchTerm).then(res => res.json())
            .then(
                (result) => {
                    console.log(result);
                    this.setState({
                        searchResults: result
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
            searchTerm: decodeURI(window.location.href.match(/(?<=\/search\/).*/)[0])
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
        const { searchTerm, searchResults } = this.state;
        return (
            <React.Fragment>
                <NavigationBar />
                <div className="container">
                    <div className="card-title">Showing results for: {searchTerm}</div>

                    {searchResults.length < 1 ? (
                        <div>No Search Results for that term</div>
                    ) : (
                            <div>{searchResults.length} results found<br />
                                <SearchResultsList searchResults={searchResults} />
                            </div>
                        )}
                </div>
            </React.Fragment>
        );
    }
}

export default withRouter(Search);