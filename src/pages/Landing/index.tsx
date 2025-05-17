import React, { useState, useEffect } from "react";
import NavigationBar from "../../components/NavigationBar/NavigationBar";
import { getHostEndpoint } from "../../utils/common";

const Landing: React.FC = () => {
  const [mediaResults, setMediaResults] = useState([]);
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
                  getMediaResults(
                    getHostEndpoint() + ":8081/api/top/media/",
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
                onClick={(e) => setCurrentTab(1)}
                id="nav-profile-tab"
                href="#Movies"
              >
                Movies
              </a>
              <a
                className={
                  "nav-item nav-link " + (currentTab === 2 ? "active" : "")
                }
                onClick={(e) => setCurrentTab(2)}
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
              mediaResults.map((object: any) => (
                <div className="col-md-4">
                  <div className="card">
                    <div className="card-block">
                      <h5 className="card-title">
                        <a
                          href={"/video/" + object.id}
                          style={{
                            textDecoration: "none",
                            color: "greenyellow",
                          }}
                        >
                          {object.title}
                        </a>
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
};

export default Landing;
