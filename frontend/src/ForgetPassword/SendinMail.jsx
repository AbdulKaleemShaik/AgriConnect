import React from 'react';
import { Player } from '@lottiefiles/react-lottie-player';

function Sending() {
    return (
        <div className="loading-container">
            <Player
                autoplay
                loop
                src="https://lottie.host/e0454f4b-6bb4-4df7-be28-7d14c3290ac9/TdLstUL93z.json"
                style={{ height: '300px', width: '300px' }}
            />
            <p style={{textAlign:'center', fontSize: 'bold'}}>Sending your Memory loss............</p>
        </div>
    );
}

export default Sending;