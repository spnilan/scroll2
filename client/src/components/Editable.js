import React, { useEffect } from "react";


const Editable = ({
  text,
  childRef,
  handleEvent,
  isEditing
}) => {


  useEffect(() => {
    if (childRef && childRef.current && isEditing === true) {
      childRef.current.focus();
    }
  }, [isEditing, childRef]);



  return (

    <section>
      {isEditing ? (
        <div
          onBlur={handleEvent}
          onKeyDown={handleEvent}
        >
          <input type='text' value={text} ref={childRef} onChange={handleEvent} />
        </div>
      ) : (
        <div 
          onClick={handleEvent}
        >
          <span className={`${text ? "text-black" : "text-gray-500"}`}>
            {text}
          </span>
        </div>
      )}
    </section>
  );
};

export default Editable;