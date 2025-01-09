import express from 'express';
import cors from 'cors';
import { Sequelize, STRING, BLOB, Model } from 'sequelize';
import { Request, Response } from 'express';
import * as fs from "node:fs";
import multer from "multer";
import * as dotenv from 'dotenv'; // Добавляем dotenv

dotenv.config(); // Загружаем переменные окружения

const app = express();
const PORT = 3000;

app.use(cors({
  origin: '*',
}));

app.use(express.json({ limit: '150mb' }));
app.use(express.urlencoded({ limit: '150mb', extended: true }));

// Определение интерфейса для модели Photo
interface PhotoAttributes {
    id?: number;
    filename: string;
    data: Buffer;
}

interface PhotoInstance extends Model<PhotoAttributes, any>, PhotoAttributes {
    setAlbum: (album: AlbumInstance) => Promise<void>;
    getAlbum: () => Promise<AlbumInstance>;
}

// Определение интерфейса для модели Album
interface AlbumAttributes {
    id?: number;
    name: string;
}

interface AlbumInstance extends Model<AlbumAttributes, any>, AlbumAttributes {
    addPhoto: (photo: PhotoInstance) => Promise<void>;
    getPhotos: () => Promise<PhotoInstance[]>;
    Photos?: PhotoInstance[]; // Добавляем свойство Photos
}

// Создание базы данных SQLite
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './database.sqlite'
});

// Определение модели для фотографий
const Photo = sequelize.define<PhotoInstance, PhotoAttributes>('Photo', {
    filename: {
        type: STRING,
        allowNull: false
    },
    data: {
        type: BLOB('long'),
        allowNull: false
    }
});

// Определение модели для альбомов
const Album = sequelize.define<AlbumInstance, AlbumAttributes>('Album', {
    name: {
        type: STRING,
        allowNull: false
    }
});

// Определение связей между моделями
Album.hasMany(Photo);
Photo.belongsTo(Album);

// Синхронизация модели с базой данных
sequelize.sync().then(() => {
    console.log('База данных синхронизирована');
}).catch(err => {
    console.error('Ошибка синхронизации базы данных:', err);
});

const upload = multer({ dest: 'uploads/' });

// Маршрут для загрузки фотографии
// @ts-ignore
app.post('/upload', upload.single('file'), async (req: Request, res: Response) => {
    if (!req.file) {
        return res.status(400).json({ message: 'Файл не был загружен' });
    }

    const { filename, path } = req.file;
    const { name } = req.body; // Получаем имя фотографии из тела запроса
    try {
        const photo = await Photo.create({
            filename: name, // Используем имя, переданное в запросе
            data: fs.readFileSync(path)
        });
        res.status(201).json({ message: 'Фотография успешно загружена', photo });
    } catch (err) {
        console.error('Ошибка при загрузке фотографии:', err);
        res.status(500).json({ message: 'Ошибка при загрузке фотографии' });
    }
});

// Маршрут для получения фотографии
// @ts-ignore
app.get('/photo/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const photo = await Photo.findByPk(id);
        if (!photo) {
            return res.status(404).json({ message: 'Фотография не найдена' });
        }
        res.set('Content-Type', 'image/jpeg');
        res.send(photo.data);
    } catch (err) {
        console.error('Ошибка при получении фотографии:', err);
        res.status(500).json({ message: 'Ошибка при получении фотографии' });
    }
});

// Маршрут для удаления фотографии
// @ts-ignore
app.delete('/photo/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const photo = await Photo.findByPk(id);
        if (!photo) {
            return res.status(404).json({ message: 'Фотография не найдена' });
        }
        await photo.destroy();
        res.status(200).json({ message: 'Фотография успешно удалена' });
    } catch (err) {
        console.error('Ошибка при удалении фотографии:', err);
        res.status(500).json({ message: 'Ошибка при удалении фотографии' });
    }
});

// Маршрут для получения всех альбомов
app.get('/albums', async (req: Request, res: Response) => {
    try {
        const albums = await Album.findAll();
        res.status(200).json(albums);
    } catch (err) {
        console.error('Ошибка при получении альбомов:', err);
        res.status(500).json({ message: 'Ошибка при получении альбомов' });
    }
});

// Маршрут для создания нового альбома
app.post('/albums', async (req: Request, res: Response) => {
    const { name } = req.body;
    try {
        const album = await Album.create({ name });
        res.status(201).json(album);
    } catch (err) {
        console.error('Ошибка при создании альбома:', err);
        res.status(500).json({ message: 'Ошибка при создании альбома' });
    }
});

// Маршрут для редактирования альбома
// @ts-ignore
app.put('/albums/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name } = req.body;
    try {
        const album = await Album.findByPk(id);
        if (!album) {
            return res.status(404).json({ message: 'Альбом не найден' });
        }
        album.name = name;
        await album.save();
        res.status(200).json(album);
    } catch (err) {
        console.error('Ошибка при редактировании альбома:', err);
        res.status(500).json({ message: 'Ошибка при редактировании альбома' });
    }
});

// Маршрут для удаления альбома
// @ts-ignore
app.delete('/albums/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const album = await Album.findByPk(id);
        if (!album) {
            return res.status(404).json({ message: 'Альбом не найден' });
        }
        await album.destroy();
        res.status(200).json({ message: 'Альбом успешно удален' });
    } catch (err) {
        console.error('Ошибка при удалении альбома:', err);
        res.status(500).json({ message: 'Ошибка при удалении альбома' });
    }
});

// Маршрут для получения деталей альбома
// @ts-ignore
app.get('/albums/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const album = await Album.findByPk(id);
        if (!album) {
            return res.status(404).json({ message: 'Альбом не найден' });
        }
        res.status(200).json(album);
    } catch (err) {
        console.error('Ошибка при получении деталей альбома:', err);
        res.status(500).json({ message: 'Ошибка при получении деталей альбома' });
    }
});

// Маршрут для получения фотографий в альбоме
// @ts-ignore
app.get('/albums/:id/photos', async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const album = await Album.findByPk(id, { include: [Photo] });
        if (!album) {
            return res.status(404).json({ message: 'Альбом не найден' });
        }
        // @ts-ignore
        const photosWithBase64Data = album.Photos.map(photo => {
            const base64Data = photo.data.toString('base64');
            return { ...photo.toJSON(), data: base64Data };
        });
        res.status(200).json(photosWithBase64Data);
    } catch (err) {
        console.error('Ошибка при получении фотографий в альбоме:', err);
        res.status(500).json({ message: 'Ошибка при получении фотографий в альбоме' });
    }
});

//@ts-ignore
app.get('/photos', async (req: Request, res: Response) => {
    try {
        const photos = await Photo.findAll();
        const photosWithBase64Data = photos.map(photo => {
            return {
                ...photo.toJSON(),
                data: photo.data.toString('base64')
            };
        });
        res.status(200).json(photosWithBase64Data);
    } catch (err) {
        console.error('Ошибка при получении фотографий', err);
        res.status(500).json({ message: 'Ошибка при получении фотографий' });
    }
});

// Маршрут для переименования фотографии
// @ts-ignore
app.put('/photo/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    const { filename } = req.body;
    try {
        const photo = await Photo.findByPk(id);
        if (!photo) {
            return res.status(404).json({ message: 'Фотография не найдена' });
        }
        photo.filename = filename;
        await photo.save();
        res.status(200).json(photo);
    } catch (err) {
        console.error('Ошибка при переименовании фотографии:', err);
        res.status(500).json({ message: 'Ошибка при переименовании фотографии' });
    }
});

// Маршрут для перемещения фотографии в другой альбом
// @ts-ignore
app.post('/albums/:id/photos', async (req: Request, res: Response) => {
    const { id } = req.params;
    const { photoId } = req.body;
    try {
        const album = await Album.findByPk(id);
        if (!album) {
            return res.status(404).json({ message: 'Альбом не найден' });
        }
        const photo = await Photo.findByPk(photoId);
        if (!photo) {
            return res.status(404).json({ message: 'Фотография не найдена' });
        }
        await photo.setAlbum(album);
        res.status(200).json({ message: 'Фотография успешно перемещена' });
    } catch (err) {
        console.error('Ошибка при перемещении фотографии:', err);
        res.status(500).json({ message: 'Ошибка при перемещении фотографии' });
    }
});

// Логирование URL
const EXTERNAL_URL = process.env.REACT_APP_API_URL || `http://localhost:${PORT}`;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Сервер запущен на порту ${PORT}`);
    console.log(`Сервер доступен по адресу: ${EXTERNAL_URL}`);
});