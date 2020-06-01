import React from 'react';
import ClueRecorder from './components/ClueRecorder'
import Clock from './components/Clock'
import ImageScramble from './components/ImageScramble'
import './App.css';

import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { TouchBackend } from 'react-dnd-touch-backend'

const imageUrl = 'uploads/celebphoto.jpg'


//const backend = 'ontouchstart' in window ? TouchBackend : HTML5Backend;

function App() {
  return <ClueRecorder />;
    
}

export default App;

// celebphoto size = 100
// celebphoto3 size = 150

/*
<DndProvider backend={backend}>
        <ImageScramble imageUrl={imageUrl} />
    </DndProvider>);

  */