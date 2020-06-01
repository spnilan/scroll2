import React, { Component, Fragment } from 'react'
import axios from 'axios';
import Message from './Message'
import Progress from './Progress'
import Scroll from './Scroll'
import EditableList from './EditableList';


let SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
let recognition = new SpeechRecognition();
recognition.lang = 'en-US';
recognition.interimResults = false;
recognition.maxAlternatives = 1;

class ClueRecorder extends Component {

    constructor() {
        super();
        this.state = {
            recording: false,
            startingTime: 0,
            lineStart: 0,
            recordedLines: [],
            pageTitle: "Page",
            answer: "",
            hint: "",


            audioFile: null,
            readyForUpload: false,
            
            selectedPage: null,
            uploadedPages: [],
            message: null,
            uploadPercentage: 0

        };
        this.recorder = null;

        this.handleListen = this.handleListen.bind(this);
        this.startRecording = this.startRecording.bind(this);
        this.stopRecording = this.stopRecording.bind(this);
        this.onPageSelectedChange = this.onPageSelectedChange.bind(this);
        this.onRecordingReady = this.onRecordingReady.bind(this);
        this.onFieldChange = this.onFieldChange.bind(this);
        this.alterLine = this.alterLine.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
    }


    componentDidMount() {
        let self = this;
        navigator.mediaDevices.getUserMedia({
            audio: true
          })
          .then(function (stream) {
            self.recorder = new MediaRecorder(stream);
            self.recorder.addEventListener('dataavailable', self.onRecordingReady);
          });
    }

    handleListen() {
        if (!this.state.recording) {
            return;
        }

        recognition.onspeechstart = (e) => {
            console.log("onspeechstart")
            this.setState(state => ({
                lineStart: Date.now() - state.startingTime - 50
            }));
        }

        recognition.onresult = (e) => {
            console.log("onresult");
            let speechResult = e.results[0][0].transcript.toLowerCase();
            this.setState(state => ({
                recordedLines: [...state.recordedLines, {
                    text: speechResult,
                    startTime: state.lineStart,
                    endTime: Date.now() - state.startingTime + 50
                }],
            }));
        }

        recognition.onend = (e) => {
            console.log("onend");
            if (this.state.recording) {
                recognition.start();
            } else {
                this.setState({
                    readyForUpload: true
                })
            }
        }
        this.recorder.start();
        recognition.start();
    }


    onSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('file', this.state.audioFile);
        formData.append('pageTitle', this.state.pageTitle);
        formData.append('answer', this.state.answer);
        formData.append('hint', this.state.hint);
        formData.append('lines', JSON.stringify(this.state.recordedLines));
        try {
            const res = await axios.post('/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                onUploadProgress: (progressEvent) => {
                    this.setState({
                        uploadPercentage: parseInt(
                            Math.round((progressEvent.loaded*100)/progressEvent.total)
                        )
                    });
                }
            
            });


            console.log("result", res);
            setTimeout(() => this.setState({ uploadPercentage: 0}), 10000);
            const { name, lines, src } = res.data;
            let newPage = { name, lines, src };
            this.setState(state => ({
                uploadedPages: [...state.uploadedPages, newPage],
                selectedPage: newPage,
                recordedLines: [],
                message: "File uploaded successfully",
                audioFile: null
            }));

        } catch (err) {
            console.log("error", err);
            if (err.response.status === 500) {
                this.setState({ message: "there was a problem with the server"})
                
            } else {
                this.setState({ message: err.response.data.msg})
            }
        }
    }

    

    onRecordingReady(e) {
        console.log("recording ready");
        this.setState({audioFile : e.data});
    }

    startRecording(e) {

        this.setState({
            selectedPage: null,
            recording: true,
            startingTime: Date.now(),
            recordedLines: [],
            pageTitle: "Page",
            hint: "",
            answer: "",
            audioFile: null,
            readyForUpload: false
        }, this.handleListen);

    }

    stopRecording() {
        console.log("recording has stopped");

        this.setState({
                recording: false
            }, () => {
            recognition.stop();
            this.recorder.stop();
        });
    }
    

    onPageSelectedChange(e) {
        console.log("page has been changed");
        let pageTitle = e.target.value;
        this.setState(state => ({
            recording: false,
            audioFile: null,
            recordedLines: [],
            selectedPage: state.uploadedPages.find(p => p.name === pageTitle)
        }))
    }

    alterLine(index, alteredText) {
        console.log("changed line")
        this.setState(state => ({
            recordedLines: [
                ...state.recordedLines.slice(0, index),
                {...state.recordedLines[index], text: alteredText},
                ...state.recordedLines.slice(index+1)
            ]
        }));
    }

    onFieldChange(e) {
        let { name, value } = e.target;
        this.setState({ [name]: value });
    }

    render() {
        return (
            <Fragment>
            {this.state.message ? <Message msg={this.state.message} /> : null}
            <form onSubmit={this.onSubmit}>
            <div>
            <label htmlFor='pageTitle'>Page Title</label>
            <input type='text' name='pageTitle' value={this.state.pageTitle}
                onChange={this.onFieldChange} />
            </div>
            <button onClick={this.startRecording} disabled={this.state.recording}>Start recording</button>
            <button onClick={this.stopRecording} disabled={!this.state.recording}>Stop recording</button>
            <div id='preview'>
                <EditableList lines={this.state.recordedLines} setLine={this.alterLine} >
                </EditableList>
            </div>
            {
                this.state.audioFile && 
                <Fragment>
                    <label htmlFor='answer'>Answer</label>
                    <input type='text' name='answer' value={this.state.answer}
                        onChange={this.onFieldChange} />
                    <label htmlFor='hint'>Hint</label>
                    <input type='text' name='hint' value={this.state.hint}
                        onChange={this.onFieldChange} />
                    
                    <input type="submit" 
                        className="btn btn-primary btn-block mt-4" 
                        value="Upload" />
                    <Progress percentage={this.state.uploadPercentage} />
                </Fragment>
            }
            </form>

            {
                this.state.uploadedPages.length > 0 &&
                <Fragment>
                    <select onChange={this.onPageSelectedChange} 
                            value={this.state.selectedPage ? this.state.selectedPage.name : ''} >
                        {
                            this.state.uploadedPages.map((page, index) => 
                                (<option key={index} value={page.name}>{page.name}</option>))
                        }
                    </select>
                    {
                        this.state.selectedPage && 
                        <Scroll file={this.state.selectedPage} />
                    }
                    
                </Fragment>
            }
        </Fragment>
        )
    }

        
}

export default ClueRecorder;