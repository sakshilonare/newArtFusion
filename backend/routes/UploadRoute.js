const { Router } = require("express");
const uploadMiddleware = require("../middlewares/MulterMiddleware");
const UploadModel = require("../models/UploadModel");
const { google } = require('googleapis');
const fs = require('fs');
const stream = require('stream');

const router = Router();

// service account key file from Google Cloud console.
const path = require('path');

const KEYFILEPATH = path.join(__dirname, 'googleDriveKeys.json');


// Request full drive access.
const SCOPES = ['https://www.googleapis.com/auth/drive', 'profile'];
const auth = new google.auth.GoogleAuth({
  keyFile: KEYFILEPATH,
  scopes: SCOPES
});

const driveService = google.drive({version: 'v3', auth});

router.get("/api/get", async (req, res) => {
  const allPhotos = await UploadModel.find().sort({ createdAt: "descending" });
  res.send(allPhotos);
});

router.post("/api/save", uploadMiddleware.single("photo"), (req, res) => {
  const { phototitle, photoDescription, user,forSale,price } = req.body; 
  const photo = req.file.filename; 

  UploadModel.create({ phototitle, photoDescription, user, photo ,forSale,price}) // Create a new document with photo details
    .then((data) => {
      console.log("Uploaded Successfully...");
      console.log(data);
      //res.status(201).json({message : `Your Post has been uploaded`});
      res.send(data);
    })
    .catch((err) => console.log(err));

});


router.delete("/api/delete/:pid", async (req, res) => {
  const photoId = req.params.pid;

  try {
    const deletedPhoto = await UploadModel.findByIdAndDelete(photoId);

    if (!deletedPhoto) {
      return res.status(404).json({ message: "Photo not found" });
    }
    res.status(200).json({ message: "Photo deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// POST route to save the image to Google Drive
router.post('/api/save-to-drive/:photoId', async (req, res) => {
  const photoId = req.params.photoId;

  // Fetch the selected photo by photoId from your database
  const selectedPhoto = await UploadModel.findById(photoId); // Implement your own logic to fetch the photo

  if (!selectedPhoto) {
    return res.status(404).send('Image not found');
  }

  
  const imageUrl = `http://localhost:5000/uploads/${selectedPhoto.photo}`; // URL to the image

  try {
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error('Failed to fetch image');
    }

    console.log(imageResponse);

    const buffer = [];
    for await (const chunk of imageResponse.body) {
      buffer.push(chunk);
    }
    const imageBuffer = Buffer.concat(buffer);

    // Create a readable stream from the image buffer
    const imageStream = new stream.Readable();
    imageStream.push(imageBuffer);
    imageStream.push(null);


    // Define the file metadata and media
    const fileMetadata = {
      name: 'ArtFusionImg.jpg', // Replace with an appropriate name
      parents: ['1wbZExScq7n3fTGD5iRWYzGe_zpaQrDVo'], // Replace with your destination folder ID
    };

    const media = {
      mimeType: 'image/jpeg', // Change the mimeType if needed
      body: imageStream,
    };

    // Use the Google Drive API to create a file
    const response = await driveService.files.create({
      resource: fileMetadata,
      media: media,
    });
    // console.log('File created:', response.data);

    res.status(200).send('Image saved to Google Drive');
  } catch (error) {
    console.error('Error saving image to Google Drive:', error);
    res.status(500).send('Error saving image to Google Drive');
  }
});


router.put('/api/update/:photoId', async (req, res) => {
  try {
    const { photoId } = req.params;
    const { phototitle, photoDescription, price } = req.body; // Fields to update

    // You should include authentication and authorization checks here

    // Find the photo by its ID
    const photo = await UploadModel.findById(photoId);

    if (!photo) {
      return res.status(404).json({ message: 'Photo not found' });
    }

    // Update the photo details
    if (phototitle) {
      photo.phototitle = phototitle;
    }

    if (photoDescription) {
      photo.photoDescription = photoDescription;
    }

    if (price) {
      photo.price = price;
    }

    // Save the updated photo
    await photo.save();

    return res.status(200).json({ message: 'Photo details updated successfully' });
  } catch (error) {
    console.error('Error updating photo details:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


module.exports = router;