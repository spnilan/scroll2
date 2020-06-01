import React, { useState, useRef, useEffect } from 'react'
import './clock.css'


const Clock = () => {

    let [state, setState] = useState({
        hour: 4,
        minute: 45,
        mouseDownHour: false,
        mouseDownMinute: false
    })

    let [time, setTime] = useState();

    let clock = useRef();
    function minuteCss(minute) {
        return {
            '--rotation': minute * 6
        }
    }

    function hourCss(hour, minute) {
        return {
            '--rotation': (hour + (minute/60)) * 30
        }
    }

    useEffect(() => {
        if (!state.mouseDownHour && !state.mouseDownMinute) {
            setTime({
                hour: state.hour,
                minute: state.minute
            })
        }
        
    }, [state, setTime]);



    const getAngle = (x, y) => {
        return ((Math.atan2(x, -y) * 180 / Math.PI) + 360) % 360;
    }

    const calculateXPosition = e => {
        return e.clientX - clock.current.offsetLeft - clock.current.offsetWidth / 2;
    }
    const calculateYPosition = e => {
        return e.clientY - clock.current.offsetTop - clock.current.offsetHeight / 2;
    }

    const onMinuteHandMove = e => {
        console.log("minutemove");
        let currentAngle = getAngle(calculateXPosition(e), calculateYPosition(e));
        let prevMinute = state.minute;
        let newMinute = (currentAngle / 360) * 60;
        let newHour = state.hour;    
        if (prevMinute > 55 && newMinute < 5) {
            newHour = (state.hour + 1) % 12;
        } else if (prevMinute < 5 && newMinute > 55) {
            newHour = ((state.hour - 1) + 12) % 12; 
        }

        setState(state => ({
            ...state,
            minute: newMinute,
            hour: newHour
        }));
    }

    const onHourHandMove = (e) => {
        console.log("hourmove");
        let currentAngle = getAngle(calculateXPosition(e), calculateYPosition(e));
        let newHour = Math.floor((currentAngle / 360) * 12);
        let minuteRatio = 12 * (currentAngle / 360) - newHour;
        let newMinute = minuteRatio * 60;
        setState(state => ({
            ...state,
            hour: newHour,
            minute: newMinute
        }))
        
    }

    const onMouseMove = (e) => {
        if (state.mouseDownMinute) onMinuteHandMove(e);
        else if (state.mouseDownHour) onHourHandMove(e);
        else return;
    }


    const onMouseUp = (e) => {
        setState(state => ({
            ...state,
            mouseDownHour: false,
            mouseDownMinute: false
        }));

    }

    const onMouseDownHour = () => {
        setState(state => ({
            ...state,
            mouseDownHour: true
        }))
    }
    const onMouseDownMinute = () => {
        setState(state => ({
            ...state,
            mouseDownMinute: true
        }))
    }

    const getTime = function(hour, minute) {
        let minuteStr = minute < 10 ? `0${minute}` : minute.toString();
         if (hour === 0) {
             return `12:${minuteStr}`;
         } else {
             return `${hour}:${minuteStr}`;
         }
    }

    return (
        <div>
            <div id='time'>{time && getTime(time.hour, Math.floor(time.minute))}</div>
            <div class='clock' ref={clock}
                onMouseMove={onMouseMove}
                onMouseUp={onMouseUp} >
                <div class='hand hour-hand' onMouseDown={onMouseDownHour} 
                style={hourCss(state.hour, state.minute)}
                data-hour-hand>
                </div>
                <div class='hand minute-hand' onMouseDown={onMouseDownMinute} 
                style={minuteCss(state.minute)}
                data-minute-hand>
                </div>
                <div class='number number1'>I</div>
                <div class='number number2'>II</div>
                <div class='number number3'>III</div>
                <div class='number number4'>IV</div>
                <div class='number number5'>V</div>
                <div class='number number6'>VI</div>
                <div class='number number7'>VII</div>
                <div class='number number8'>VII</div>
                <div class='number number9'>IX</div>
                <div class='number number10'>X</div>
                <div class='number number11'>XI</div>
                <div class='number number112'>XII</div>
            </div>
        </div>
    )
}

export default Clock
