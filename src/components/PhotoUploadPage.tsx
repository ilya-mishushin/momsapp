import React, { useState } from 'react';
import PhotoUpload from './PhotoUpload';
import '../styles/PhotoUploadPage.css';

const PhotoUploadPage: React.FC = () => {
    const [photoUploaded, setPhotoUploaded] = useState<boolean>(false);

    return (
        <div className="photo-upload-page">
            {!photoUploaded && (
                <div className="text-container">
                    <p>Ты можешь загружать сюда фотографии с помощью этой кнопки</p>
                    <div className="arrow">&#8595;</div>
                </div>
            )}
            <PhotoUpload setPhotoUploaded={setPhotoUploaded} />
            {photoUploaded && (
                <p className="upload-message">Ты загрузила фотографию!!! Теперь нажимаем 'Сохранить' и оно будет добавлено в библиотеку фотографий</p>
            )}
        </div>
    );
};

export default PhotoUploadPage;