// import { CloudinaryStorage } from "multer-storage-cloudinary";
// import cloudinary from "./cloudinary.config";
// import { v4 as uuidv4 } from "uuid";
// import { extname } from "path";

// export const storage = new CloudinaryStorage({
//     cloudinary: cloudinary,
//     params: {
//         folder: 'some-folder-name',
//         allowed_formats: ['jpg', 'png', 'jpeg', 'gif'], 
//         public_id: (req, file) => uuidv4() + extname(file.originalname), 
//     }
// })