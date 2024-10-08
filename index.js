const express = require('express');
const { createCanvas, loadImage } = require('canvas');
const multer = require('multer');
const fs = require('fs');

const app = express();
const port = 3000;

// Set up multer for image upload handling
const upload = multer({ dest: 'uploads/' });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
    console.log(`Request received: ${req.method} ${req.url}`);
    next();
});

// Endpoint to handle image and text overlay
app.post('/generate-image', upload.single('image'), async (req, res) => {
    console.log(req.file); // Log the uploaded file details
    const canvas = createCanvas(1080, 1080);
    const ctx = canvas.getContext('2d');

    try {
        // Load the uploaded image
        const imagePath = req.file.path;
        const image = await loadImage(fs.readFileSync(imagePath));

        // Draw the image on the canvas
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

        // Set text properties
        const fontSize = 60;
        ctx.font = `${fontSize}px Arial`;
        ctx.textAlign = "center";
        ctx.textBaseline = "top";

        // Define padding for the background
        const padding = 20;
        const lineHeight = fontSize * 1.2;

        // Split text into lines and calculate text height
        const text = req.body.customText || '';
        const lines = text.split('\n');
        const totalTextHeight = (lines.length * lineHeight) + padding;
        const backgroundY = (canvas.height - totalTextHeight) / 2;

        // Draw semi-transparent background
        ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
        ctx.fillRect(0, backgroundY - padding / 2, canvas.width, totalTextHeight);

        // Draw the text on the canvas
        ctx.fillStyle = "black";
        lines.forEach((line, index) => {
            const textY = backgroundY + (index * lineHeight);
            ctx.fillText(line, canvas.width / 2, textY);
        });

        // Send the image as a response
        res.setHeader('Content-Type', 'image/png');
        canvas.createPNGStream().pipe(res);

        // Clean up the uploaded image file
        fs.unlinkSync(imagePath);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error generating image.');
    }
});

// app.post('/generate-image', upload.single('image'), async (req, res) => {
//     console.log(req.file); // Log the uploaded file details
//     const canvas = createCanvas(1080, 1080);
//     const ctx = canvas.getContext('2d');

//     try {
//         // Load the uploaded image
//         const imagePath = req.file.path;
//         const image = await loadImage(fs.readFileSync(imagePath));

//         // Draw the image on the canvas
//         ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

//         // Set text properties
//         const fontSize = 60;
//         ctx.font = `${fontSize}px Arial`;
//         ctx.textAlign = "center";
//         ctx.textBaseline = "top";

//         // Define padding for the background
//         const padding = 10;
//         const lineHeight = fontSize * 1.2;

//         // Split text into lines
//         const text = req.body.customText || '';
//         const lines = text.split('\n');

//         // Calculate the Y position to start drawing text (centered)
//         const totalTextHeight = (lines.length * lineHeight);
//         const startY = (canvas.height - totalTextHeight) / 2;

//         // Loop through each line and each word
//         lines.forEach((line, lineIndex) => {
//             const words = line.split(' ');
//             let textX = canvas.width / 2 - ctx.measureText(line).width / 2; // Centered alignment

//             words.forEach((word, wordIndex) => {
//                 const wordWidth = ctx.measureText(word).width;

//                 // Draw background for specific words (e.g., "first" and "second")
//                 if (word.toLowerCase() === "first" || word.toLowerCase() === "2") {
//                     ctx.fillStyle = "rgba(255, 255, 255, 1)";
//                     ctx.fillRect(textX - padding / 2, startY + lineIndex * lineHeight - padding / 2, wordWidth + padding, lineHeight);
//                 }

//                 // Draw the word
//                 ctx.fillStyle = "black";
//                 ctx.fillText(word, textX + wordWidth / 2, startY + lineIndex * lineHeight);

//                 // Move the X position for the next word
//                 textX += wordWidth + ctx.measureText(' ').width;
//             });
//         });

//         // Send the image as a response
//         res.setHeader('Content-Type', 'image/png');
//         canvas.createPNGStream().pipe(res);

//         // Clean up the uploaded image file
//         fs.unlinkSync(imagePath);
//     } catch (err) {
//         console.error(err);
//         res.status(500).send('Error generating image.');
//     }
// });



app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
