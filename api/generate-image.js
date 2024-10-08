const { createCanvas } = require('canvas');
const multer = require('multer');

// Set up multer to store files in memory
const storage = multer.memoryStorage();
const upload = multer({ 
    storage, 
    limits: { fileSize: 4 * 1024 * 1024 } // 4 MB file size limit
});

module.exports = async (req, res) => {
    if (req.method === 'POST') {
        // Parse JSON body (for text inputs)
        let body = '';
        req.on('data', (chunk) => {
            body += chunk;
        });

        req.on('end', async () => {
            const parsedBody = JSON.parse(body);

            const canvas = createCanvas(1080, 1080);
            const ctx = canvas.getContext('2d');

            try {
                // Set text properties and overlay text as needed
                const fontSize = 60;
                ctx.font = `${fontSize}px Arial`;
                ctx.textAlign = "center";
                ctx.textBaseline = "top";

                const text = parsedBody.customText || '';
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

            } catch (err) {
                console.error(err);
                res.status(500).send('Error generating image.');
            }
        });

    } else {
        res.status(405).send('Method Not Allowed');
    }
};
