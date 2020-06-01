import React, { useState, useEffect, useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd'

//const squareSize = 150;
const squareSize = 100;
const DraggableImage = ({ slice, onMoveItem }) => {

    const ref = useRef();

    const { row, column, id, imageUrl } = slice;

    const hOffset = row*squareSize;
    const wOffset = column*squareSize;


    const style = {
        padding: '1px',
        backgroundClip: 'content-box',
        backgroundRepeat: 'no-repeat',
        width: squareSize,
        height: squareSize,
        cursor: "pointer",
        backgroundImage: `url('${imageUrl}')`,
        backgroundPosition: `${wOffset}px ${hOffset}px`
    };

    const [{ isDragging }, connectDrag] = useDrag({
        item: { id, type: "IMG"},
        collect: monitor => {
            return {
                isDragging: monitor.isDragging()
            };
        }
    });


    const [, connectDrop] = useDrop({
        accept: "IMG",
        hover(hoveredOverItem) {
            if (hoveredOverItem.id !== id) {
                onMoveItem(hoveredOverItem.id, id)
            }
        }
    });

    connectDrag(ref);
    connectDrop(ref);

    //const isDragging = false;
    const opacity = isDragging ? 0.5  : 1;
    const containerStyle = {
        ...style,
        opacity
    }
    return <div ref={ref} style={containerStyle}></div>;

}


const ImageScramble = ({completed, onComplete, imageUrl }) => {

    const [imageSlices, setImageSlices] = useState(null);
    const [imageWidth, setImageWidth] = useState(0);

    const correctOrder = imageSlices !== null &&
                        imageSlices.every((slice, index) => slice.id === index);



    useEffect(() => {

        if (correctOrder && !completed) {
            //onComplete();
            console.log("correct order");
        }

    }, [correctOrder, completed])

    console.log("image", imageUrl)
    useEffect(() => {
        let image = new Image();
        image.src = imageUrl;
        image.onload = () => {
            console.log(image.width, image.height);
            setImageWidth(image.width);
            
            let numSlicesWidth = Math.floor(image.width / squareSize);
            let numSlicesHeight = Math.floor(image.height / squareSize);
            
            const shuffle = (array) => {
                for (let i = array.length - 1; i > 0; i--) {
                  let j = Math.floor(Math.random() * (i + 1));
                  [array[i], array[j]] = [array[j], array[i]];
                }
            }


            let slices = [];
            let index = 0;
            for (let i = 0; i > -numSlicesHeight; i--) {
                for (let j = 0; j > -numSlicesWidth; j--) {
                    slices.push({
                        id: index,
                        row: i,
                        column: j,
                        imageUrl
                    });
                    index++;
                }
            }
            if (!completed) {
                shuffle(slices);
            }

            setImageSlices(slices);
        }

    }, []);

    const onMoveItem = (id1, id2) => {
        setImageSlices(slices => {
            let index1 = slices.findIndex(slice => slice.id == id1);
            let index2 = slices.findIndex(slice => slice.id == id2);

            let newSlices = [...slices];
            newSlices[index1] = slices[index2];
            newSlices[index2] = slices[index1];
            return newSlices;
        })

    }
    
    return (
        <div className='draggable' style={{padding: '10px'}}>
             
             <div style={{ display: 'flex', flexWrap: 'wrap', padding: '0px', margin: '0px',
                           width: `${imageWidth}px`, 
                        }}>
                {imageSlices && 
                imageSlices.map(slice =>
                    <DraggableImage key={slice.id} slice={slice} onMoveItem={onMoveItem} />)}
            </div>

            <div>
                Correct order: {correctOrder && "yup"}
            </div>
        </div>
       
    )
}


export default ImageScramble
