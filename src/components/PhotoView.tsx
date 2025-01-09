import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Modal from 'react-modal';
import '../styles/PhotoView.css';

Modal.setAppElement('#root'); // Установите корневой элемент для модального окна

const PhotoView: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [photoUrl, setPhotoUrl] = useState<string | null>(null);
    const [photoVisible, setPhotoVisible] = useState(true);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | undefined>(undefined);
    const [albums, setAlbums] = useState<{ id: number; name: string }[]>([]);
    const [modalIsOpen, setModalIsOpen] = useState<boolean>(false);
    const [newAlbumName, setNewAlbumName] = useState<string>('');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const navigate = useNavigate();
    const apiUrl = 'https://80.234.78.166:3000';

    useEffect(() => {
        const fetchPhoto = async () => {
            try {
                const response = await axios.get(`${apiUrl}/photo/${id}`, {
                    responseType: 'blob'
                });
                const url = URL.createObjectURL(response.data);
                setPhotoUrl(url);
            } catch (err) {
                console.error('Ошибка при загрузке фото', err);
                setError('Ошибка при загрузке фото');
            } finally {
                setLoading(false);
            }
        };

        const fetchAlbums = async () => {
            try {
                const response = await axios.get(`${apiUrl}/albums`);
                setAlbums(response.data);
            } catch (err) {
                console.error('Ошибка при загрузке альбомов', err);
                setError('Ошибка при загрузке альбомов');
            }
        };

        fetchPhoto();
        fetchAlbums();
    }, [id]);

    const handleHidePhoto = () => {
        setPhotoVisible(false);
        navigate('/');
    };

    const handleSaveToAlbum = async (albumId: number) => {
        try {
            await axios.post(`${apiUrl}/albums/${albumId}/photos`, {
                photoId: id
            });
            toast.success('Фотография успешно сохранена в альбом!', {
                position: 'top-center',
                autoClose: 1500
            });
            navigate(`/album/${albumId}`); // Перенаправление на страницу альбома
        } catch (err) {
            toast.error('Ошибка при сохранении фотографии в альбом');
            console.error('Ошибка при сохранении фотографии в альбом', err);
            setError('Ошибка при сохранении фотографии в альбом');
        }
    };

    const handleCreateAndSaveToAlbum = async () => {
        if (!newAlbumName) {
            setErrorMessage('Поле названия альбома не может быть пустым');
            setTimeout(() => setErrorMessage(null), 1000); // Скрыть сообщение об ошибке через 3 секунды
            return;
        }

        try {
            const response = await axios.post(`${apiUrl}/albums`, {
                name: newAlbumName,
            });
            await handleSaveToAlbum(response.data.id);
            navigate(`/album/${response.data.id}`); // Перенаправление на страницу нового альбома
        } catch (err) {
            console.error('Ошибка при создании и сохранении фотографии в альбом', err);
            setError('Ошибка при создании и сохранении фотографии в альбом');
        } finally {
            setModalIsOpen(false);
            setErrorMessage(null);
        }
    };

    const handleDelete = async () => {
        try {
            await axios.delete(`${apiUrl}/photo/${id}`);
            navigate('/');
        } catch (err) {
            console.error('Ошибка при удалении фото', err);
            setError('Ошибка при удалении фото');
        }
    };

    if (loading) {
        return <div>Загрузка...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div className="photo-view-container">
            <ToastContainer />
            {photoVisible && photoUrl && <img src={photoUrl} alt="Uploaded" className="photo-view-image" />}
            <div className="photo-view-actions">
                <button onClick={handleHidePhoto} className="hide-button">
                    <span className="material-icons">visibility_off</span> Скрыть
                </button>
                <button onClick={handleDelete} className="delete-button">
                    <span className="material-icons">delete</span> Удалить
                </button>
                <button onClick={() => setModalIsOpen(true)} className="save-to-album-button">
                    <span className="material-icons">add_photo_alternate</span> Создать альбом и сохранить в него
                </button>
                <select onChange={(e) => handleSaveToAlbum(Number(e.target.value))} className="save-to-album-select">
                    <option value="">Сохранить в существующий альбом</option>
                    {albums.map(album => (
                        <option key={album.id} value={album.id}>{album.name}</option>
                    ))}
                </select>
            </div>

            <Modal
                isOpen={modalIsOpen}
                onRequestClose={() => {
                    setModalIsOpen(false);
                    setErrorMessage(null); // Сбросить состояние ошибки при закрытии модального окна
                }}
                contentLabel="Создать новый альбом"
                className="modal"
                overlayClassName="modal-overlay"
            >
                <h2>Создать новый альбом</h2>
                <input
                    type="text"
                    placeholder="Введи название нового альбома"
                    value={newAlbumName}
                    onChange={(e) => setNewAlbumName(e.target.value)}
                    className="modal-input"
                />
                {errorMessage && <div className="error-message">{errorMessage}</div>}
                <div className="modal-actions">
                    <button onClick={handleCreateAndSaveToAlbum} className="save-button">
                        Сохранить
                    </button>
                    <button onClick={() => setModalIsOpen(false)} className="cancel-button">
                        Отменить
                    </button>
                </div>
            </Modal>
        </div>
    );
};

export default PhotoView;