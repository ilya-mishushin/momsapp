import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Modal from 'react-modal';
import '../styles/AlbumView.css';
import NavigationBar from './NavigationBar';

interface Photo {
    id: number;
    filename: string;
    data: string;
}

interface Album {
    id: number;
    name: string;
}

const AlbumView: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [albums, setAlbums] = useState<Album[]>([]);
    const [albumName, setAlbumName] = useState<string | undefined>(undefined);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | undefined>(undefined);
    const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
    const [deleteModalIsOpen, setDeleteModalIsOpen] = useState<boolean>(false);
    const [photoToDelete, setPhotoToDelete] = useState<number | null>(null);
    const navigate = useNavigate();
    const apiUrl = 'https://80.234.78.166:3000';

    useEffect(() => {
        const fetchAlbumDetails = async () => {
            try {
                const response = await axios.get(`${apiUrl}/albums/${id}`, {
                    responseType: 'json'
                });
                setAlbumName(response.data.name);
            } catch (err) {
                console.error('Ошибка при загрузке деталей альбома', err);
                setError('Ошибка при загрузке деталей альбома');
            }
        };

        const fetchPhotos = async () => {
            try {
                const response = await axios.get(`${apiUrl}/albums/${id}/photos`, {
                    responseType: 'json'
                });
                const photosWithUrls = response.data.map((photo: Photo) => {
                    const url = `data:image/jpeg;base64,${photo.data}`;
                    return { ...photo, data: url };
                });
                setPhotos(photosWithUrls);
            } catch (err) {
                console.error('Ошибка при загрузке фотографий', err);
                setError('Ошибка при загрузке фотографий');
            } finally {
                setLoading(false);
            }
        };

        const fetchAlbums = async () => {
            try {
                const response = await axios.get(`${apiUrl}/albums`, {
                    responseType: 'json'
                });
                setAlbums(response.data);
            } catch (err) {
                console.error('Ошибка при загрузке списка альбомов', err);
                setError('Ошибка при загрузке списка альбомов');
            }
        };

        fetchAlbumDetails();
        fetchPhotos();
        fetchAlbums();
    }, [id]);

    const handleDeletePhoto = async (photoId: number) => {
        try {
            await axios.delete(`${apiUrl}/photo/${photoId}`);
            setPhotos(photos.filter(photo => photo.id !== photoId));
            toast.success('Фотография успешно удалена', {
                position: 'top-center',
                autoClose: 50
            })
        } catch (err) {
            console.error('Ошибка при удалении фотографии', err);
            setError('Ошибка при удалении фотографии');
        }
    };

    const handleRenamePhoto = async (photoId: number, newName: string) => {
        try {
            await axios.put(`${apiUrl}/photo/${photoId}`, { filename: newName });
            setPhotos(photos.map(photo => photo.id === photoId ? { ...photo, filename: newName } : photo));
        } catch (err) {
            console.error('Ошибка при переименовании фотографии', err);
            setError('Ошибка при переименовании фотографии');
        }
    };

    const handleMovePhoto = async (photoId: number, newAlbumName: string) => {
        const newAlbum = albums.find(album => album.name === newAlbumName);
        if (!newAlbum) {
            setError('Альбом с таким названием не найден');
            return;
        }

        try {
            await axios.post(`${apiUrl}/albums/${newAlbum.id}/photos`, { photoId });
            setPhotos(photos.filter(photo => photo.id !== photoId));
        } catch (err) {
            console.error('Ошибка при перемещении фотографии', err);
            setError('Ошибка при перемещении фотографии');
        }
    };

    const handlePhotoClick = (index: number) => {
        setSelectedPhotoIndex(index);
    };

    const handleCloseModal = () => {
        setSelectedPhotoIndex(null);
    };

    const handlePrevPhoto = () => {
        if (selectedPhotoIndex !== null && selectedPhotoIndex > 0) {
            setSelectedPhotoIndex(selectedPhotoIndex - 1);
        }
    };

    const handleNextPhoto = () => {
        if (selectedPhotoIndex !== null && selectedPhotoIndex < photos.length - 1) {
            setSelectedPhotoIndex(selectedPhotoIndex + 1);
        }
    };

    const openDeleteModal = (photoId: number) => {
        setPhotoToDelete(photoId);
        setDeleteModalIsOpen(true);
    };

    const closeDeleteModal = () => {
        setPhotoToDelete(null);
        setDeleteModalIsOpen(false);
    };

    const confirmDeletePhoto = async () => {
        if (photoToDelete !== null) {
            await handleDeletePhoto(photoToDelete);
            closeDeleteModal();
        }
    };

    if (loading) {
        return <div>Загрузка...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div>
            <NavigationBar />
            <div className="album-view-container">
            <ToastContainer />
                <h1>{albumName}</h1>
                <div className="photos-grid">
                    {photos.map((photo, index) => (
                        <div key={photo.id} className="photo-item" onClick={() => handlePhotoClick(index)}>
                            <img src={photo.data} alt={photo.filename} className="photo-thumbnail" />
                            <span className="photo-name">{photo.filename}</span>
                            <div className="photo-actions">
                                <button className='rename-button' onClick={(e) => {
                                    e.stopPropagation();
                                    const newName = prompt('Введите новое название', photo.filename);
                                    if (newName) handleRenamePhoto(photo.id, newName);
                                }}>
                                    <span className="material-icons">edit</span> Переименовать
                                </button>
                                <button className='move-button' onClick={(e) => {
                                    e.stopPropagation();
                                    const newAlbumName = prompt('Введите название нового альбома');
                                    if (newAlbumName) handleMovePhoto(photo.id, newAlbumName);
                                }}>
                                    <span className="material-icons">move_to_inbox</span> Переместить
                                </button>
                                <button className='delete-button' onClick={(e) => {
                                    e.stopPropagation();
                                    openDeleteModal(photo.id);
                                }}>
                                    <span className="material-icons">delete</span> Удалить
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
                {selectedPhotoIndex !== null && (
                    <div className="photo-modal" onClick={handleCloseModal}>
                        <div className="modal-content" onClick={e => e.stopPropagation()}>
                            <img src={photos[selectedPhotoIndex].data} alt={photos[selectedPhotoIndex].filename} className="modal-photo" />
                            <button onClick={handlePrevPhoto} className="modal-button prev">
                                <span className="material-icons">arrow_back</span>
                            </button>
                            <button onClick={handleCloseModal} className='modal-button close'>
                                <span className='material-icons'>close</span>
                            </button>
                            <button onClick={handleNextPhoto} className="modal-button next">
                                <span className="material-icons">arrow_forward</span>
                            </button>
                        </div>
                    </div>
                )}
                <Modal
                    isOpen={deleteModalIsOpen}
                    onRequestClose={closeDeleteModal}
                    contentLabel="Подтверждение удаления"
                    className="delete-modal"
                    overlayClassName="delete-modal-overlay"
                >
                    <h2>Ты правда хочешь удалить эту фотографию?</h2>
                    <div className="modal-actions">
                        <button onClick={confirmDeletePhoto} className="confirm-delete-button">Да</button>
                        <button onClick={closeDeleteModal} className="cancel-delete-button">Нет</button>
                    </div>
                </Modal>
            </div>
        </div>
    );
};

export default AlbumView;