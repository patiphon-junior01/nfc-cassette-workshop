// const viewportMeta = document.getElementById("viewportMeta");

// function updateViewport() {
//   if (window.innerWidth <= 432) {
//     viewportMeta.setAttribute("content", "width=432");
//   } else {
//     viewportMeta.setAttribute("content", "width=device-width, initial-scale=1.0");
//   }
// }

// updateViewport();

// window.addEventListener("resize", updateViewport);

// Handle Image Uploads for All Upload Areas
document.querySelectorAll(".upload-box").forEach((box) => {
  box.addEventListener("click", () => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*";
    fileInput.click();

    fileInput.onchange = () => {
      const file = fileInput.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = document.createElement("img");
          img.src = e.target.result;
          img.style.width = "100%";
          img.style.height = "100%";
          img.style.objectFit = "cover"; // Maintain object-fit: cover behavior
          box.innerHTML = "";
          box.appendChild(img);
        };
        reader.readAsDataURL(file);
      }
    };
  });
});

// Handle Popup for Text Customization
let activeTextBox = null;

document.querySelectorAll(".text-box").forEach((textBox) => {
  textBox.addEventListener("click", (e) => {
    if (!textBox.classList.contains("active")) {
      textBox.classList.add("active");
    }
    activeTextBox = textBox;
    const popup = document.getElementById("textControlsPopup");
    popup.style.zIndex = "1000";
    popup.style.opacity = "1";
    // Pre-fill controls with current values
    console.log(window.getComputedStyle(textBox).fontSize.replace("px", ""));

    document.getElementById("popupFontSize").value = +window
      .getComputedStyle(textBox)
      .fontSize.replace("px", "");

    document.getElementById("valuePopupFontSize").innerText = +window
      .getComputedStyle(textBox)
      .fontSize.replace("px", "");

    document.getElementById("popupText").value = textBox.innerText;

    // get color
    var color = window.getComputedStyle(textBox).color;
    var rgb = color.match(/\d+/g);
    var hex = `#${(
      (1 << 24) +
      (parseInt(rgb[0]) << 16) +
      (parseInt(rgb[1]) << 8) +
      parseInt(rgb[2])
    )
      .toString(16)
      .slice(1)}`;

    // Set the color value in the popup color input
    document.getElementById("popupColor").value = hex;

    document.getElementById("popupFontStyle").value = (
      window.getComputedStyle(textBox).fontFamily ?? ""
    )
      .toString()
      .replace(/["']/g, "");

    console.log((window.getComputedStyle(textBox).fontFamily ?? "").toString());
  });
});

// Close Popup
document.getElementById("closePopup").addEventListener("click", () => {
  const popup = document.getElementById("textControlsPopup");
  popup.style.zIndex = "-100";
  popup.style.opacity = "0";
  document.querySelectorAll(".text-with-stroke").forEach((e) => {
    e.classList.remove("active");
  });
});

// Apply Font Customization
document.getElementById("popupFontSize").addEventListener("input", (e) => {
  if (activeTextBox) {
    activeTextBox.style.fontSize = `${e.target.value + "px"}`;
    document.getElementById(
      "valuePopupFontSize"
    ).innerText = `${e.target.value}`;
  }
});

document.getElementById("popupColor").addEventListener("change", (e) => {
  if (activeTextBox) {
    activeTextBox.style.color = `${e.target.value}`;
  }
});

document.getElementById("popupText").addEventListener("change", (e) => {
  if (activeTextBox) {
    activeTextBox.innerText = e.target.value;
  }
});

document.getElementById("popupFontStyle").addEventListener("change", (e) => {
  if (activeTextBox) {
    activeTextBox.style.fontFamily = e.target.value;
  }
});

// Handle PDF Generation
document.getElementById("generate").addEventListener("click", async () => {
  try {
    if (document.querySelectorAll(".upload-box img").length < 7) {
      alert("Please Upload Image Is All!");
      return;
    }

    document.getElementById("generate").innerText = "Generating...";
    document.getElementById("generate").disabled = true;

    const template = document.getElementById("template");
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    // Set canvas size to A4 (300 DPI)
    // canvas.width = 2480; // A4 width in pixels
    // canvas.height = 3508; // A4 height in pixels

    canvas.width = 3508; // A4 width in pixels
    canvas.height = 2480; // A4 height in pixels

    const rect = template.getBoundingClientRect();

    // Draw the template image
    const templateImg = document.querySelector("#template img");
    const img = new Image();
    img.src = templateImg.src;
    await img.decode();
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // Draw uploaded images
    document.querySelectorAll(".upload-box img").forEach((uploadedImg) => {
      const box = uploadedImg.parentElement;
      const boxRect = box.getBoundingClientRect();
      const x = (boxRect.left - rect.left) * (canvas.width / rect.width);
      const y = (boxRect.top - rect.top) * (canvas.height / rect.height);
      const width = boxRect.width * (canvas.width / rect.width);
      const height = boxRect.height * (canvas.height / rect.height);

      // Maintain object-fit: cover manually
      const imgAspectRatio =
        uploadedImg.naturalWidth / uploadedImg.naturalHeight;
      const boxAspectRatio = width / height;

      let drawWidth, drawHeight, offsetX, offsetY;

      if (imgAspectRatio > boxAspectRatio) {
        drawWidth = height * imgAspectRatio;
        drawHeight = height;
        offsetX = (width - drawWidth) / 2;
        offsetY = 0;
      } else {
        drawWidth = width;
        drawHeight = width / imgAspectRatio;
        offsetX = 0;
        offsetY = (height - drawHeight) / 2;
      }

      ctx.save();
      ctx.beginPath();
      ctx.rect(x, y, width, height);
      ctx.clip();
      ctx.drawImage(
        uploadedImg,
        x + offsetX,
        y + offsetY,
        drawWidth,
        drawHeight
      );
      ctx.restore();
    });

    // Draw the top-template.png
    const topTemplateImg = new Image();
    topTemplateImg.src = "/assets/images/top-template-1.png"; // Ensure the path to your top-template.png is correct
    await topTemplateImg.decode();
    ctx.drawImage(topTemplateImg, 0, 0, canvas.width, canvas.height);

    // Draw text from editable areas
    document.querySelectorAll(".text-box").forEach((textBox) => {
      const boxRect = textBox.getBoundingClientRect();
      const x = (boxRect.left - rect.left) * (canvas.width / rect.width);
      const y = (boxRect.top - rect.top) * (canvas.height / rect.height);
      const width = boxRect.width * (canvas.width / rect.width);
      const height = boxRect.height * (canvas.height / rect.height);

      // Extract text styles
      const fontSize =
        parseFloat(window.getComputedStyle(textBox).fontSize) *
        (canvas.width / rect.width);
      const fontFamily = window.getComputedStyle(textBox).fontFamily;
      const color = window.getComputedStyle(textBox).color;
      const textAlign = window.getComputedStyle(textBox).textAlign;
      const writingMode = window.getComputedStyle(textBox).writingMode;
      const textOrientation = window.getComputedStyle(textBox).textOrientation;
      const letterSpacing = window.getComputedStyle(textBox).letterSpacing;

      // Extract the text, splitting it into lines based on natural line breaks
      const textLines = textBox.innerText.split(/\n/); // Split by natural line breaks (Enter key)

      ctx.save();

      // Apply text styles
      ctx.font = `${fontSize}px ${fontFamily}`;
      ctx.letterSpacing = letterSpacing;
      ctx.fillStyle = color;
      ctx.textAlign = "center"; // Center alignment horizontally
      ctx.textBaseline = "middle"; // Center alignment vertically

      // Apply vertical writing mode transformations
      if (writingMode === "vertical-rl" && textOrientation === "sideways") {
        if (textBox.classList.contains("left-text")) {
          ctx.translate(x + width / 2, y + height / 2);
          ctx.rotate(-Math.PI / 2); // Rotate counter-clockwise
        } else if (textBox.classList.contains("right-text")) {
          ctx.translate(x + width / 2, y + height / 2);
          ctx.rotate(Math.PI / 2); // Rotate clockwise
        }
      } else {
        ctx.translate(x + width / 2, y + height / 2); // Center horizontally and vertically
      }

      // Calculate line height
      const lineHeight = fontSize * 1.2;

      // Calculate the starting y-offset to vertically center multi-line text
      const totalTextHeight = lineHeight * textLines.length;
      const startYOffset = -totalTextHeight / 2 + lineHeight / 2;

      // Draw each line
      textLines.forEach((line, index) => {
        const offsetY = startYOffset + index * lineHeight;

        // Apply filled text
        ctx.fillText(line, 0, offsetY);
      });

      ctx.restore();
    });

    // Convert canvas to an image
    console.log("end procress next generate v2");
    const pdfImage = canvas.toDataURL("image/jpeg");
    const pdfImage2 = await genetatePDFV2();
    console.log({
      pdfImage,
      pdfImage2
    });
    if (!pdfImage2) {
      throw new Error("Failed to generate PDF");
    }
    generatePdfFromImage([pdfImage, pdfImage2]);
  } catch (err) {
    console.error(err);
    document.getElementById("generate").innerText = "Continue to Generate";
    document.getElementById("generate").disabled = false;
  }
});

const API_URL = "/sendEmail";
const FILENAME = "generated.pdf";
const CONTENT_TYPE = "application/pdf";

async function generatePdfFromImage(dataUrls) {
  try {
    // สร้างเอกสาร PDF ใหม่
    const pdfDoc = await PDFLib.PDFDocument.create();

    for (let i = 0; i < dataUrls.length; i++) {
      console.log({
        dataUrls: dataUrls[i]
      });
      const dataUrl = dataUrls[i];

      // แปลง Data URL ของรูปภาพเป็น Buffer
      const base64Image = dataUrl.split(",")[1];
      const imageBuffer = Uint8Array.from(atob(base64Image), (char) =>
        char.charCodeAt(0)
      );

      // ฝังรูปภาพลงใน PDF
      const image = await pdfDoc.embedJpg(imageBuffer);

      // คำนวณขนาดหน้ากระดาษตามขนาดรูปภาพ
      const { width, height } = image.scale(1);

      // เพิ่มหน้าใหม่ แล้วเซ็ตขนาดตามรูป
      const page = pdfDoc.addPage([width, height]);

      // วาดรูปภาพลงบนหน้า PDF
      page.drawImage(image, {
        x: 0,
        y: 0,
        width,
        height
      });
    }

    // สร้าง PDF และแปลงเป็น Blob
    const pdfBytes = await pdfDoc.save();
    const pdfBlob = new Blob([pdfBytes], { type: CONTENT_TYPE });

    const blobUrl = URL.createObjectURL(pdfBlob);
    // window.open(blobUrl, "_blank");

    // สร้าง Base64 ของ PDF
    const pdfBase64 = await convertBlobToBase64(pdfBlob);

    console.log({
      blobUrl,
      pdfBase64
    });

    // ส่ง PDF ไปยังเซิร์ฟเวอร์
    await sendPdfEmail(pdfBase64);
    document.getElementById("generate").innerText = "Continue to Generate";
    document.getElementById("generate").disabled = false;
  } catch (error) {
    console.error("Error generating PDF:", error);
    alert("Error generating PDF");
    document.getElementById("generate").innerText = "Continue to Generate";
    document.getElementById("generate").disabled = false;
  }
}

async function genetatePDFV2() {
  try {
    const template = document.getElementById("template-2");
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = 3508; // A4 width in pixels
    canvas.height = 2480; // A4 height in pixels

    const rect = template.getBoundingClientRect();

    // Draw the template image
    const templateImg = document.querySelector("#template-2 img");
    const img = new Image();
    img.src = templateImg.src;
    await img.decode();
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // Draw uploaded images
    document.querySelectorAll(".upload-box img").forEach((uploadedImg) => {
      const box = uploadedImg.parentElement;
      const boxRect = box.getBoundingClientRect();
      const x = (boxRect.left - rect.left) * (canvas.width / rect.width);
      const y = (boxRect.top - rect.top) * (canvas.height / rect.height);
      const width = boxRect.width * (canvas.width / rect.width);
      const height = boxRect.height * (canvas.height / rect.height);

      // Maintain object-fit: cover manually
      const imgAspectRatio =
        uploadedImg.naturalWidth / uploadedImg.naturalHeight;
      const boxAspectRatio = width / height;

      let drawWidth, drawHeight, offsetX, offsetY;

      if (imgAspectRatio > boxAspectRatio) {
        drawWidth = height * imgAspectRatio;
        drawHeight = height;
        offsetX = (width - drawWidth) / 2;
        offsetY = 0;
      } else {
        drawWidth = width;
        drawHeight = width / imgAspectRatio;
        offsetX = 0;
        offsetY = (height - drawHeight) / 2;
      }

      ctx.save();
      ctx.beginPath();
      ctx.rect(x, y, width, height);
      ctx.clip();
      ctx.drawImage(
        uploadedImg,
        x + offsetX,
        y + offsetY,
        drawWidth,
        drawHeight
      );
      ctx.restore();
    });

    // Draw the top-template.png
    const topTemplateImg = new Image();
    topTemplateImg.src = "/assets/images/top-template-2.png"; // Ensure the path to your top-template.png is correct
    await topTemplateImg.decode();
    ctx.drawImage(topTemplateImg, 0, 0, canvas.width, canvas.height);

    // Convert canvas to an image
    const pdfImage = canvas.toDataURL("image/jpeg");
    return pdfImage;
  } catch (error) {
    console.error("Error generating PDF Docs 2:", error);
    return null;
  }
}

async function convertBlobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result.split(",")[1]); // ดึงเฉพาะ Base64 ส่วนข้อมูล
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

async function sendPdfEmail(pdfBase64) {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        file: pdfBase64,
        filename: FILENAME,
        contentType: CONTENT_TYPE
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to send email: ${response.statusText}`);
    }

    const result = await response.json();
    // console.log("Email sent successfully:", result.message);
    const isConfirm = confirm("Keychain generated successfully!");
    if (isConfirm) {
      window.location.reload(); // Correctly reloads the current page
    }
  } catch (error) {
    console.error("Error sending email:", error);
    alert("Error generating Keychain");
  }
}
