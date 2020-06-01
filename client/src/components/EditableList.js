import React, { useState, useRef } from 'react'
import Editable from './Editable'
import { CSSTransitionGroup } from 'react-transition-group'
import './Editable.css'

const EditableList = ({ lines, setLine }) => {

    const [currentLine, setCurrentLine] = useState(-1);
    const lineRef = useRef()

    const handleEvent = index => e => {
        if (e.type === "change") {
            setLine(index, e.target.value);
        }
        else if (e.type ===  "blur") {
            setCurrentLine(-1);
        } 
        else if (e.type === "click") {
            setCurrentLine(index);
        } 
        else if (e.type ==="keydown") {
            if (e.key === "Tab") {
                setCurrentLine(cl => (cl + 1) % lines.length);
            } else if (e.key ==="Escape" || e.key === "Enter") {
                setCurrentLine(-1);
            }
        }
    }

    return (
            <ul>

              {lines.map((line, index) => (
                <Editable key={index} text={line.text} childRef={lineRef}
                        isEditing={currentLine === index}
                        handleEvent={handleEvent(index)} >
                </Editable>
            ))}
            </ul>
    )
}

export default EditableList;