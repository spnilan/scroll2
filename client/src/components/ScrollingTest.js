import React, { Fragment, useState, useEffect, useRef } from 'react'

const ScrollingTest = ({ file }) => {

    ///const [timeoutIds, setTimeoutIds] = useState([]);
    const [shownLines, setShownLines] = useState([]);
    //const [currentTime, setCurrentTime] = useState(0);
    const { lines, src } = file;
    const time = useRef(0);

    useEffect(() => {
        setShownLines([]);
        let timeoutIds = [];
        lines.forEach(line => {
            let start = line.startTime;
            let end = line.endTime;
            let tid = setTimeout(() => {
                setShownLines(shown => [...shown, 
                                        {text: line.text, highlight: true}])
            }, start);
            timeoutIds.push(tid);
            tid = setTimeout(() => {
                setShownLines(shown => [...shown.slice(0, -1), 
                                        {text: line.text, highlight: false}])
            }, end);
            timeoutIds.push(tid);
        });

        return () => {
            timeoutIds.forEach(id => clearTimeout(id));
        };
    }, [lines]);

    function updateTime(e) {
        console.log(e);
        time.current = e.target.currentTime * 1000;
    }


    return (
        <Fragment>
        <ul>
           {lines.filter(line => line.startTime <= time.current)
                 .map((line, index) => (
               <li key={index} className={(time.current <= line.endTime) ? 'highlight' : ''} >
                   {line.text}
                </li>
           ))} 
        </ul>
        <audio src={src} controls autoPlay onTimeUpdate={updateTime}>
        </audio>
        <div>
            {time.current}
        </div>
        </Fragment>
    )
}

export default ScrollingTest
