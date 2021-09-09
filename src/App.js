import React, { useRef, useState, useEffect } from "react";
import "./App.css";

function App() {
  const BASE_URL = process.env.REACT_APP_SERVER_API;
  const API_URL = process.env.REACT_APP_VIDEOSDK_API;

  const [selectedFile, setSelectedFile] = useState("");
  const [token, settoken] = useState("");
  const [storageURL, setstorageURL] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [videoInfo, setvideoInfo] = useState({
    videoId: "",
    fileUrl: "",
  });

  const inputFile = useRef(null);

  const getToken = async () => {
    try {
      const response = await fetch(`${BASE_URL}/get-token`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });
      const { token } = await response.json();
      return token;
    } catch (e) {
      console.log(e);
    }
  };

  const fetchStorageAPI = async (token) => {
    try {
      const response = await fetch(`${API_URL}/v1/files`, {
        method: "POST",
        headers: {
          Authorization: token,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });
      const resp = await response.json();
      return resp;
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(async () => {
    const token = await getToken();
    const { url } = await fetchStorageAPI(token);
    settoken(token);
    setstorageURL(url);
  }, []);

  const onUpload = async () => {
    setIsUploading(true);
    var fData = new FormData();
    console.log("selected", selectedFile);
    fData.append("file", selectedFile);

    var options = {
      method: "POST",
      headers: {
        Authorization: token,
      },
      body: fData,
    };

    fetch(storageURL, options)
      .then((response) => response.json())
      .then((data) => {
        setvideoInfo({
          videoId: data.id,
          fileUrl: data.fileUrl,
        });
        setIsUploading(false);
      })
      .catch((error) => console.log(error));
  };

  const onEncode = () => {
    const url = `${API_URL}/v1/encoder/jobs`;
    var options = {
      method: "POST",
      headers: {
        Authorization: token,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        videoId: videoInfo.videoId,
        presets: [
          {
            resolutions: ["240"],
            format: "hls",
          },
          {
            resolutions: ["240"],
            format: "mp4",
          },
        ],
        thumbnails: [
          {
            timestamp: "00:00:03",
            resolutions: ["240"],
            formats: ["jpg", "webp"],
            filters: ["none", "blur"],
          },
        ],
        webhookUrl: `http://provide-webhook-url/video-encoded/60fab7e190288a03d0b7bee8`, // You have to add webhook url
      }),
    };

    fetch(url, options)
      .then((res) => res.json())
      .then((data) => console.log("data", data))
      .catch((err) => console.error("error:" + err));
  };

  return (
    <div
      style={{
        backgroundColor: "#F6F6FF",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      {selectedFile ? (
        <div>
          {isUploading ? (
            <div style={{ display: "flex", justifyContent: "center" }}>
              <h4>Uploading...</h4>
            </div>
          ) : (
            <div style={{ flexDirection: "row", display: "flex" }}>
              <p style={{ fontWeight: "bold" }}>File name : </p>
              <p style={{ marginLeft: 6 }}>{selectedFile.name}</p>
            </div>
          )}
          <div className="container">
            <button
              className="button"
              onClick={onUpload}
              style={{
                backgroundColor: "#059DC0",
                fontSize: 16,
              }}
            >
              Upload
            </button>

            {videoInfo.fileUrl ? (
              <>
                <div style={{ flexDirection: "row", display: "flex" }}>
                  <p style={{ fontWeight: "bold" }}>File URL : </p>
                  <p style={{ marginLeft: 6 }}>{videoInfo.fileUrl}</p>
                </div>

                <button
                  className="button"
                  onClick={onEncode}
                  style={{
                    backgroundColor: "#059DC0",
                    fontSize: 16,
                  }}
                >
                  Encode
                </button>
              </>
            ) : null}
          </div>
        </div>
      ) : (
        <>
          <button
            className="button"
            onClick={() => {
              inputFile.current.click();
            }}
            style={{
              backgroundColor: "#4AA96C",
              fontSize: 16,
            }}
          >
            Select a File
          </button>

          <input
            type="file"
            id="file"
            ref={inputFile}
            onChange={(event) => {
              event.preventDefault();
              setSelectedFile(event.target.files[0]);
            }}
            style={{ display: "none" }}
          />
        </>
      )}
    </div>
  );
}

export default App;
