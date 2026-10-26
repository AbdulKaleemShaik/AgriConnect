import React from 'react';
import { Player } from '@lottiefiles/react-lottie-player';

function updating() {
    return (
        <div className="loading-container">
            <Player
                autoplay
                loop
                src="https://lottie.host/03f918da-1c3e-49ee-b7b7-0b39492184a5/1hZi8gf1iB.json"
                style={{ height: '700px', width: '700px' , textAlign:'center'}}
            />
            <p>Submitting your request...</p>
        </div>
    );
}

export default updating;