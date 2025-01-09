import React, { useState } from 'react';
import '../styles/WelcomePage.css';
import PhotoUpload from "./PhotoUpload";
import ViewAlbumsButton from "./ViewAlbumsButton";

const WelcomePage: React.FC = () => {
    const [photoUploaded, setPhotoUploaded] = useState<boolean>(false);
    const [showWelcome, setShowWelcome] = useState<boolean>(true);

    return (
        <div className="welcome-page">
            {showWelcome && (
                <>
                    <big className="welcome-page__title">Семейный фотоальбом</big>
                    <h1 className="welcome-message">Привет, мамуль! Это приложение для тебя!</h1>
                    <div className="button-container">
                        <div className="button-group">
                            <p className="button-label">Ты можешь загружать фотографии с помощью этой кнопки</p>
                            <PhotoUpload setPhotoUploaded={setPhotoUploaded} />
                        </div>
                        <div className='button-group'>
                            <p className="button-label">Посмотреть все твои альбомы с помощью этой кнопки</p>
                            <ViewAlbumsButton setShowWelcome={setShowWelcome} />
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default WelcomePage;