const { createCanvas, loadImage } = require('canvas');
const multer = require('multer');
const fs = require('fs');

// Set up multer for image upload handling
const upload = multer({ 
    dest: '/tmp/', 
    limits: { fileSize: 4 * 1024 * 1024 } // 4 MB file size limit
});

// Main handler function for Vercel
module.exports = (req, res) => {
    if (req.method === 'POST') {
        upload.single('image')(req, res, async (err) => {
            if (err) {
                console.error('Multer error:', err); // Log Multer error
                return res.status(500).send(`Error uploading image: ${err.message}`);
            }

            const canvas = createCanvas(1080, 1080);
            const ctx = canvas.getContext('2d');

            try {
                // Load the uploaded image
                const imagePath = req.file.path;
                const image = await loadImage(fs.readFileSync(imagePath));

                // Draw the image on the canvas
                ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

                // Set text properties and overlay text as needed
                const fontSize = 60;
                ctx.font = `${fontSize}px Arial`;
                ctx.textAlign = "center";
                ctx.textBaseline = "top";

                const text = req.body.customText || '';
                const lines = text.split('\n');
                const padding = 20;
                const lineHeight = fontSize * 1.2;
                const totalTextHeight = (lines.length * lineHeight) + padding;
                const backgroundY = (canvas.height - totalTextHeight) / 2;

                ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
                ctx.fillRect(0, backgroundY - padding / 2, canvas.width, totalTextHeight);

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
    } else {
        res.status(405).send('Method Not Allowed');
    }
};
