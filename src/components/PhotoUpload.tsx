import React, { useState, useEffect } from 'react';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { usePhotoContext } from '../context/PhotoContext';
import '../styles/PhotoUpload.css';

interface PhotoUploadProps {
    setPhotoUploaded: (uploaded: boolean) => void;
}

const PhotoUpload: React.FC<PhotoUploadProps> = ({ setPhotoUploaded }) => {
    const [photo, setPhoto] = useState<string | null>(null);
    const [photoName, setPhotoName] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | undefined>(undefined);
    const [message, setMessage] = useState<string | undefined>(undefined);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const navigate = useNavigate();
    const { setPhotoUploaded: setPhotoUploadedContext } = usePhotoContext();
    const apiUrl = 'https://80.234.78.166:3000';

    useEffect(() => {
        setPhotoUploaded(!!photo);
    }, [photo, setPhotoUploaded]);

    const takePhoto = async () => {
        setLoading(true);
        setError(undefined);
        setMessage(undefined);
        try {
            const image = await Camera.getPhoto({
                quality: 90,
                allowEditing: false,
                resultType: CameraResultType.Uri,
                source: CameraSource.Camera
            });
            setPhoto(image.webPath!);
        } catch (err) {
            setError('Ошибка при загрузке фото');
        } finally {
            setLoading(false);
        }
    };

    const deletePhoto = () => {
        setPhoto(null);
        setPhotoName('');
        setMessage(undefined);
    };

    const savePhoto = async () => {
        if (!photo || !photoName) return;

        try {
            const response = await fetch(photo);
            const blob = await response.blob();
            const fileName = `photo_${new Date().getTime()}.jpg`;

            // Создаем форму для отправки файла
            const formData = new FormData();
            formData.append('file', blob, fileName);
            formData.append('name', photoName);

            const uploadResponse = await axios.post(`${apiUrl}/upload`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            setMessage('Фотография успешно сохранена в библиотеку!');
            setPhotoUploadedContext(true);
            navigate(`/photo/${uploadResponse.data.photo.id}`);
        } catch (err) {
            console.error('Ошибка при сохранении фото', err);
            setError('Ошибка при сохранении фото');
        }
    };

    const openModal = () => {
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    return (
        <div className="photo-upload-container">
            {photo ? (
                <div className="photo-container">
                    <div className="photo-wrapper" onClick={openModal}>
                        <img src={photo} alt="Uploaded" className="uploaded-image" />
                        <button className="zoom-icon">
                            <span className="material-icons">zoom_in</span>
                        </button>
                    </div>
                    <input
                        type="text"
                        value={photoName}
                        onChange={(e) => setPhotoName(e.target.value)}
                        placeholder="Введите имя фотографии"
                        className="photo-name-input"
                    />
                    <button onClick={deletePhoto} className="delete-icon">
                        <span className="material-icons">delete</span>
                    </button>
                    <button onClick={savePhoto} className="save-button">
                        <span className="material-icons">save Сохранить</span>
                    </button>
                    {message && <p className="success-message">{message}</p>}
                </div>
            ) : (
                <button onClick={takePhoto} disabled={loading} className="upload-button">
                    {loading ? 'Загрузка...' : 'Загрузить фото'}
                </button>
            )}
            {error && <p className="error-message">{error}</p>}
            {isModalOpen && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content">
                        <img src={photo!} alt="Uploaded" className="modal-image" />
                    </div>
                </div>
            )}
        </div>
    );
};

export default PhotoUpload;