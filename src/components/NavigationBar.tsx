import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/NavigationBar.css';

const NavigationBar: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const goBack = () => {
        navigate(-1);
    };

    const goToHome = () => {
        navigate('/');
    };

    const goToAlbums = () => {
        navigate('/albums');
    };

    const goToGallery = () => {
        navigate('/gallery');
    };

    return (
        <div className="navigation-bar">
            <div className="menu">
                <button onClick={goBack} className="back-button">
                    <span className="material-icons">arrow_back</span>
                </button>
                <button
                    onClick={goToHome}
                    className={`menu-button ${location.pathname === '/' ? 'active' : ''}`}
                >
                    Главная
                </button>
                <button
                    onClick={goToAlbums}
                    className={`menu-button ${location.pathname === '/albums' ? 'active' : ''}`}
                >
                    Альбомы
                </button>
                <button
                    onClick={goToGallery}
                    className={`menu-button ${location.pathname === '/gallery' ? 'active' : ''}`}
                >
                    Галерея
                </button>
            </div>
        </div>
    );
};

export default NavigationBar;