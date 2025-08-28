const express = require("express");
const fs = require("fs");
const { createCanvas, loadImage } = require("canvas");
const PDFDocument = require("pdfkit");

const app = express();
app.use(express.json({ limit: "10mb" })); // รองรับการส่งข้อมูลรูปภาพขนาดใหญ่

app.post("/generate-pdf", async (req, res) => {
  try {
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({ error: "Image data is required" });
    }

    // Decode base64 image
    const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
    const imageBuffer = Buffer.from(base64Data, "base64");

    // Create a new PDF document
    const pdfDoc = new PDFDocument();
    const filePath = `./generated-pdf/keychain_${Date.now()}.pdf`;

    // Stream PDF to file
    const writeStream = fs.createWriteStream(filePath);
    pdfDoc.pipe(writeStream);

    // Add the image to the PDF
    const img = await loadImage(imageBuffer);
    const canvas = createCanvas(img.width, img.height);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, img.width, img.height);

    pdfDoc.image(canvas.toBuffer(), 50, 50, {
      fit: [500, 700], // Adjust size as needed
      align: "center",
      valign: "center",
    });

    pdfDoc.end();

    // Wait for the file to be written
    writeStream.on("finish", () => {
      res.json({ pdfUrl: `/generated-pdf/${filePath.split("/").pop()}` });
    });
  } catch (error) {
    console.error("Error generating PDF:", error);
    res.status(500).json({ error: "Error generating PDF" });
  }
});

// Serve the PDF files
app.use("/generated-pdf", express.static("generated-pdf"));

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
