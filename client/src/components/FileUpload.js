import React, { Fragment, useState, useEffect, useRef } from 'react'
import axios from 'axios';
//import Message from './Message'
//import Progress from './Progress'
import Scroll from './Scroll'

let SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
let recognition = new SpeechRecognition();
recognition.lang = 'en-US';
recognition.interimResults = false;
recognition.maxAlternatives = 1;

const FileUpload = () => {

    let [recording, setRecording] = useState(false);
    let [selectedFile, setSelectedFile] = useState();
    let [fileName, setFileName] = useState("file");
    let [recordedLines, setRecordedLines] = useState([]);
    let [uploadedFiles, setUploadedFiles] = useState([]);
    let [audioFile, setAudioFile] = useState(null);
    //const [message, setMessage] = useState();
    //const [uploadPercentage, setUploadPercentage] = useState(0);

    let [startingTime, setStartingTime] = useState();
    let [lineStart, setLineStart] = useState();
    

    let recorder = useRef();

    function onRecognitionResult(event) {
        console.log("result", Date.now());
        let lineEnd = Date.now() - startingTime;    
        let speechResult = event.results[0][0].transcript.toLowerCase();
        setRecordedLines(lines => 
            [...lines, 
            {
                text: speechResult,
                startTime: lineStart,
                endTime: lineEnd
            }]);
        console.log("lines", recordedLines);
    };

    //recognition.onspeechend = function() {console.log("on speech end")}
    
    function onRecognitionEnd(event) { 
        console.log('SpeechRecognition.onend');
        //if (recording) recognition.start();
        recognition.start();
        window.myinfo = {
            recorder: recorder.current,
            recognition,
            recording,
            recordedLines
        };
    }
    function onRecognitionStart(event) {
        setLineStart(Date.now() - startingTime);
        console.log('SpeechRecognition.onspeechstart');
    }


    const onSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('file', audioFile)
        formData.append('lines', JSON.stringify(recordedLines));
        try {
            const res = await axios.post('/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                /*onUploadProgress: (progressEvent) => {
                    setUploadPercentage(
                        parseInt(
                            Math.round((progressEvent.loaded*100)/progressEvent.total)
                        )
                    );
                
                }*/
            })
            //setTimeout(() => setUploadPercentage(0), 10000)
            const { name, lines, src } = res.data

            setUploadedFiles(files => [...files, {name, lines, src}]);
            setSelectedFile(name);
            //setMessage("File Uploaded")

        } catch (err) {
            if (err.response.status === 500) {
                //setMessage("there was a problem with the server")
            } else {
                //setMessage(err.response.data.msg)
            }
        }
    }

    

    const onRecordingReady = e => {
        console.log("recording ready");
        setAudioFile(URL.createObjectURL(e.data));
    }

    const startRecording = e => {

        setSelectedFile(null);
        setRecording(true);
        console.log("recording is ", recording);

        setStartingTime(Date.now());
    
        recorder.current.start();
        recognition.start();
    }

    const stopRecording = () => {
        console.log("recording has stopped");
        setRecording(false);
        recognition.stop();
        recorder.current.stop();
    }
    

    const onChangeFile = e => {
        console.log("file has been changed");
        setRecording(false);
        setAudioFile(null);
        setRecordedLines([]);
        setSelectedFile(e.target.name)
    }
    
    useEffect(() => {
        recognition.onspeechstart = onRecognitionStart;
        recognition.onend = onRecognitionEnd;
        recognition.onresult = onRecognitionResult;

        console.log("initializing recorder");
        navigator.mediaDevices.getUserMedia({
            audio: true
          })
          .then(function (stream) {
            recorder.current = new MediaRecorder(stream);
            recorder.current.addEventListener('dataavailable', onRecordingReady);
          });
    }, []);


    return (

        <Fragment>
            <form onSubmit={onSubmit}>
            <button onClick={startRecording} disabled={recording}>Start recording</button>
            <button onClick={stopRecording} disabled={!recording}>Stop recording</button>
            <div id='preview'>
                <ul>
                {recordedLines.map((line, index) => <li key={index}>{line.text}</li>)}
                </ul>
            </div>
            {
                audioFile && 
                <Fragment>
                    <input type='text' value={fileName}
                        onChange={(e) => setFileName(e.target.value)} />
                    <input type="submit" 
                        className="btn btn-primary btn-block mt-4" 
                        value="Upload" />
                </Fragment>
            }
            </form>

            {
                uploadedFiles.length > 0 &&
                <Fragment>
                    <select onChange={onChangeFile} value={selectedFile.name} >
                        {
                            uploadedFiles.map(file => (<option value={file.name}>{file.name}</option>))
                        }
                    </select>
                <Scroll file={selectedFile} />
                </Fragment>
            }
    </Fragment>
    )
}

export default FileUpload;