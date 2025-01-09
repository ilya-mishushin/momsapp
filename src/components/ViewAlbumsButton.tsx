import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/ViewAlbumsButton.css';

interface ViewAlbumsButtonProps {
    setShowWelcome: (show: boolean) => void;
}

const ViewAlbumsButton: React.FC<ViewAlbumsButtonProps> = ({ setShowWelcome }) => {
    const navigate = useNavigate();

    const handleViewAlbums = () => {
        setShowWelcome(false);
        navigate('/albums');
    };

    return (
        <div className="view-albums-container">
            <button onClick={handleViewAlbums} className="view-albums-button">Открыть альбомы</button>
        </div>
    );
};

export default ViewAlbumsButton;