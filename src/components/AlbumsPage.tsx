import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/AlbumsPage.css';
import NavigationBar from "./NavigationBar";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Modal from 'react-modal';

interface Album {
    id: number;
    name: string;
}

interface Photo {
    id: number;
    data: string;
}

const AlbumsPage: React.FC = () => {
    const [albums, setAlbums] = useState<Album[]>([]);
    const [photos, setPhotos] = useState<{ [key: number]: Photo[] }>({});
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | undefined>(undefined);
    const [modalIsOpen, setModalIsOpen] = useState<boolean>(false);
    const [albumToDelete, setAlbumToDelete] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAlbums = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/albums`);
                setAlbums(response.data);

                const photosPromises = response.data.map(async (album: Album) => {
                    const photosResponse = await axios.get(`${process.env.REACT_APP_API_URL}/albums/${album.id}/photos`);
                    return { [album.id]: photosResponse.data };
                });

                const photosData = await Promise.all(photosPromises);
                const photosMap = photosData.reduce((acc, curr) => ({ ...acc, ...curr }), {});
                setPhotos(photosMap);
            } catch (err) {
                console.error('Ошибка при загрузке альбомов', err);
                setError('Ошибка при загрузке альбомов');
            } finally {
                setLoading(false);
            }
        };

        fetchAlbums();
    }, []);

    const handleCreateAlbum = async () => {
        const albumName = prompt('Введи название альбома');
        if (albumName) {
            try {
                const response = await axios.post(`${process.env.REACT_APP_API_URL}/albums`, {
                    name: albumName
                });
                toast.success('Альбом успешно создан!', {
                    position: 'top-center',
                    autoClose: 10
                });
                setAlbums([...albums, response.data]);
            } catch (err) {
                console.error('Ошибка при создании альбома', err);
                setError('Ошибка при создании альбома');
            }
        }
    };

    const handleDeleteAlbum = async (id: number) => {
        setAlbumToDelete(id);
        setModalIsOpen(true);
    };

    const confirmDeleteAlbum = async () => {
        if (albumToDelete) {
            try {
                await axios.delete(`${process.env.REACT_APP_API_URL}/albums/${albumToDelete}`);
                toast.success('Альбом успешно удален', {
                    position: 'top-center',
                    autoClose: 10,
                });
                setAlbums(albums.filter(album => album.id !== albumToDelete));
            } catch (err) {
                console.error('Ошибка при удалении альбома', err);
                setError('Ошибка при удалении альбома');
            } finally {
                setModalIsOpen(false);
                setAlbumToDelete(null);
            }
        }
    };

    const handleEditAlbum = async (id: number) => {
        const newName = prompt('Введи новое название альбома');
        if (newName) {
            try {
                const response = await axios.put(`${process.env.REACT_APP_API_URL}/albums/${id}`, {
                    name: newName
                });
                toast.success('Альбом отредактирован', {
                    position: 'top-center',
                    autoClose: 1500,
                });
                setAlbums(albums.map(album => album.id === id ? response.data : album));
            } catch (err) {
                console.error('Ошибка при редактировании альбома', err);
                setError('Ошибка при редактировании альбома');
            }
        }
    };

    const filteredAlbums = albums.filter(album =>
        album.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return <div>Загрузка...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div>
            <NavigationBar />
            <div className="albums-page-container">
                <ToastContainer />
                <h1>Альбомы</h1>
                <div className="search-bar">
                    <input
                        type="text"
                        placeholder="Поиск альбома..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                </div>
                <button onClick={handleCreateAlbum} className="create-album-button">
                    <span className="material-icons">add</span> Создать альбом
                </button>
                <div className="albums-grid">
                    {filteredAlbums.map(album => (
                        <div key={album.id} className="album-item" onClick={() => navigate(`/album/${album.id}`)}>
                            <h2>{album.name}</h2>
                            <div className="album-collage">
                                {photos[album.id]?.slice(0, 4).map((photo, index) => (
                                    <img key={photo.id} src={`data:image/jpeg;base64,${photo.data}`} alt="Album" className="album-photo" />
                                ))}
                            </div>
                            <div className="album-actions">
                                <button onClick={(e) => { e.stopPropagation(); handleEditAlbum(album.id); }}>
                                    <span className="material-icons">edit</span>
                                </button>
                                <button onClick={(e) => { e.stopPropagation(); handleDeleteAlbum(album.id); }}>
                                    <span className="material-icons">delete</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <Modal
                isOpen={modalIsOpen}
                onRequestClose={() => setModalIsOpen(false)}
                contentLabel="Подтверждение удаления"
                className="modal"
                overlayClassName="modal-overlay"
            >
                <h2>Подтверждение удаления</h2>
                <p>Вы уверены, что хотите удалить этот альбом?</p>
                <div className="modal-actions">
                    <button className='delete-confirm-button' onClick={confirmDeleteAlbum}>Да</button>
                    <button className='cancel-confirm=button' onClick={() => setModalIsOpen(false)}>Нет</button>
                </div>
            </Modal>
        </div>
    );
};

export default AlbumsPage;