import React, { Fragment, useState, useEffect } from 'react'

const Scroll = ({ file, options }) => {

    ///const [timeoutIds, setTimeoutIds] = useState([]);
    const [shownLines, setShownLines] = useState([]);
    const [timeoutIds, setTimeoutIds] = useState([]);
    const [startTime, setStartTime] = useState(0);

    const { lines, src } = file;



    function cancelTimeouts() {
        let tids = [...timeoutIds];
        setTimeoutIds([]);
        tids.forEach(id => clearTimeout(id));
    }
    


    function showSnapshot(time) {
        setShownLines(
            lines.filter(line => line.startTime <= time)
            .map(line => ({
                text: line.text,
                highlight: line.endTime > time
            })));
    }

    useEffect(() => {
        console.log("start:", startTime);
        let shown = lines.filter(line => line.startTime <= startTime);
        let tids = [];
        
        function addAndHighlight(line) {
            let tid = setTimeout(() => {
                setShownLines(shown => [...shown, 
                                        {text: line.text, highlight: true}])
            }, line.startTime - startTime);
            tids.push(tid);
        }

        function unHighlight(line) {
            let tid = setTimeout(() => {
                setShownLines(shown => [...shown.slice(0, -1), 
                                        {text: line.text, highlight: false}])
            }, line.endTime - startTime);
            tids.push(tid);
        }

        
        if (shown.length > 0 && shown[shown.length - 1].endTime > startTime) {
            unHighlight(shown[shown.length - 1]);
        }

        let unshown = lines.filter(line => line.startTime > startTime);
        unshown.forEach(line => {
            addAndHighlight(line);
            unHighlight(line);       
        });
        setTimeoutIds(timeoutIds => [...timeoutIds, ...tids])
        setShownLines(shown.map(line => ({text: line.text, highlight: (startTime < line.endTime)})));
        return () => {
            [...tids].forEach(id => clearTimeout(id));
        };
    }, [lines, startTime]);

    return (
        <Fragment>
        <ul>
           {shownLines.map((line, index) => (
               <li key={index} className={line.highlight ? 'highlight' : ''} >
                   {line.text}
                </li>
           ))} 
        </ul>
        <audio  src={src} onPlay={e => setStartTime(e.target.currentTime * 1000)}
                onPause={cancelTimeouts}
                onSeeked={e => showSnapshot(e.target.currentTime * 1000)}
                autoPlay controls></audio>
        </Fragment>
    )
}

export default Scroll
