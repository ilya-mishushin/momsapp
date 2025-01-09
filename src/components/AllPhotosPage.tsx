import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/AllPhotosPage.css';
import NavigationBar from "./NavigationBar";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface Photo {
    id: number;
    data: string;
    name: string;
}

const AllPhotosPage: React.FC = () => {
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | undefined>(undefined);
    const apiUrl = 'https://80.234.78.166:3000';

    useEffect(() => {
        const fetchPhotos = async () => {
            try {
                const response = await axios.get(`${apiUrl}/photos`);
                setPhotos(response.data);
            } catch (err) {
                console.error('Ошибка при загрузке фотографий', err);
                setError('Ошибка при загрузке фотографий');
            } finally {
                setLoading(false);
            }
        };

        fetchPhotos();
    }, []);

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

    if (loading) {
        return <div>Загрузка...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div>
            <NavigationBar />
            <div className="all-photos-page-container">
                <ToastContainer />
                <h1>Все фото</h1>
                <div className="photos-grid">
                    {photos.map(photo => (
                        <div key={photo.id} className="photo-item">
                            <img src={`data:image/jpeg;base64,${photo.data}`} alt={photo.name} className="photo-thumbnail" />
                            <button className='delete-button' onClick={(e) => { e.stopPropagation(); handleDeletePhoto(photo.id); }}>
                                    <span className="material-icons">delete Удалить</span>
                                </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AllPhotosPage;