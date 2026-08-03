import React from 'react';

const FourBoxes = () => {
    const arr = []
    for (let i=0; i<4; i++) {
        const num = Math.floor(Math.random() * 100);
        arr.push(num);
    }
    console.log(arr);
    return (
        <div style={{ display: "flex", justifyContent: "space-around", marginTop: "20px"}}>
            {arr.map((num, index) => (
                <div key={index} style={{margin:"10px", padding: "20px", border: "1px solid black"}}>
                    {num}
                </div>
            ))}
        </div>
    )
}

export default FourBoxes;