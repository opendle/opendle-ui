/** Crop the centre square of a picture and scale it down. */
export async function squarePicture(file, pixels) {
    const bitmap = await createImageBitmap(file);
    try {
        const side = Math.min(bitmap.width, bitmap.height);
        const size = Math.min(side, pixels);
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const context = canvas.getContext("2d");
        if (context === null)
            throw new Error("Canvas is not available.");
        context.drawImage(bitmap, (bitmap.width - side) / 2, (bitmap.height - side) / 2, side, side, 0, 0, size, size);
        return await new Promise((resolve, reject) => {
            canvas.toBlob((blob) => {
                if (blob === null)
                    reject(new Error("The picture is not readable."));
                else
                    resolve(blob);
            }, "image/jpeg", 0.9);
        });
    }
    finally {
        bitmap.close();
    }
}
//# sourceMappingURL=squarePicture.js.map