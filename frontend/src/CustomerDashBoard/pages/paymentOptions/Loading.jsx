import React from 'react';
import { Player } from '@lottiefiles/react-lottie-player';

function Loading() {
    return (
        <div className="loading-container">
            <Player
                autoplay
                loop
                src="https://lottie.host/71bd1d8f-9d1d-4089-a20c-8565065f4017/77nXWjtJ7u.json"
                style={{ height: '300px', width: '300px' }}
            />
            <p>Submitting your request...</p>
        </div>
    );
}

export default Loading;
