import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { PhotoProvider } from './context/PhotoContext';
import WelcomePage from './components/WelcomePage';
import PhotoView from './components/PhotoView';
import AlbumsPage from "./components/AlbumsPage";
import AlbumView from "./components/AlbumView";
import AllPhotosPage from './components/AllPhotosPage';

const App: React.FC = () => {
    return (
        <PhotoProvider>
            <Router>
                <div>
                    <Routes>
                        <Route path="/" element={<WelcomePage />} />
                        <Route path="/photo/:id" element={<PhotoView />} />
                        <Route path="/albums" element={<AlbumsPage />} />
                        <Route path="/album/:id" element={<AlbumView />} />
                        <Route path='/gallery' element={<AllPhotosPage />} />
                    </Routes>
                </div>
            </Router>
        </PhotoProvider>
    );
};

export default App;