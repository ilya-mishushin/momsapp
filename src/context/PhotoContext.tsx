import React, { createContext, useState, useContext, ReactNode } from 'react';

interface PhotoContextType {
    photoUploaded: boolean;
    setPhotoUploaded: (uploaded: boolean) => void;
}

const PhotoContext = createContext<PhotoContextType | undefined>(undefined);

export const PhotoProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [photoUploaded, setPhotoUploaded] = useState(false);

    return (
        <PhotoContext.Provider value={{ photoUploaded, setPhotoUploaded }}>
            {children}
        </PhotoContext.Provider>
    );
};

export const usePhotoContext = () => {
    const context = useContext(PhotoContext);
    if (!context) {
        throw new Error('usePhotoContext must be used within a PhotoProvider');
    }
    return context;
};