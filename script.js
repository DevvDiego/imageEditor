const canvas = document.createElement("canvas");
const context = canvas.getContext('2d', { willReadFrequently: true });

class PhotoFilters{

    GrayScale(){
        // Get the image data
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Apply the grayscale filter
        for (let i = 0; i < data.length; i += 4) {
            const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
            data[i] = avg;
            data[i + 1] = avg;
            data[i + 2] = avg;
        }

        // Update the canvas with the filtered image
        context.putImageData(imageData, 0, 0);

    }

    Sepia(){
        // Get the image data
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Apply the sepia filter
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            data[i] = (r * 0.393) + (g * 0.769) + (b * 0.189);
            data[i + 1] = (r * 0.349) + (g * 0.686) + (b * 0.168);
            data[i + 2] = (r * 0.272) + (g * 0.534) + (b * 0.131);
        }

        // Update the canvas with the filtered image
        context.putImageData(imageData, 0, 0);

    }

    Inverted(){
        
        // Get the image data
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Apply the invert filter
        for (let i = 0; i < data.length; i += 4) {
            data[i] = 255 - data[i];
            data[i + 1] = 255 - data[i + 1];
            data[i + 2] = 255 - data[i + 2];
        }

        // Update the canvas with the filtered image
        context.putImageData(imageData, 0, 0);
    }

    Brightness(){
        // Get the image data
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Apply the brightness filter
        const brightness = 100; // adjust this value to control the brightness level
        for (let i = 0; i < data.length; i += 4) {
            data[i] += brightness;
            data[i + 1] += brightness;
            data[i + 2] += brightness;
        }

        // Update the canvas with the filtered image
        context.putImageData(imageData, 0, 0);
    }


    Blur(){
        // Get the image data
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Apply the blur filter
        const radius = 10; // adjust this value to control the blur level
        const kernel = [];
        const kernelSize = radius * 2 + 1;
        const sigma = radius / 3;
        const scale2 = -1 / (2 * sigma * sigma);
        let sum = 0;
        for (let i = -radius; i <= radius; i++) {
            const g = Math.exp(scale2 * i * i);
            kernel.push(g);
            sum += g;
        }
        for (let i = 0; i < kernel.length; i++) {
            kernel[i] /= sum;
        }
        const temp = context.getImageData(0, 0, canvas.width, canvas.height);
        for (let y = 0; y < canvas.height; y++) {
            for (let x = 0; x < canvas.width; x++) {
            let r = 0;
            let g = 0;
            let b = 0;
            let a = 0;
            for (let i = -radius; i <= radius; i++) {
                const dy = Math.min(Math.max(y + i, 0), canvas.height - 1);
                const offset = (dy * canvas.width + x) * 4;
                const weight = kernel[i + radius];
                r += temp.data[offset] * weight;
                g += temp.data[offset + 1] * weight;
                b += temp.data[offset + 2] * weight;
                a += temp.data[offset + 3] * weight;
            }

            const offset = (y * canvas.width + x) * 4;
            data[offset] = r;
            data[offset + 1] = g;
            data[offset + 2] = b;
            data[offset + 3] = a;
            }
        }
    }
};

class MainEditor{
    constructor(img){
        // this.Editorcanvas = document.createElement("canvas");
        // this.Editorcontext = this.Editorcanvas.getContext("2d");


        this.originalImage = img;
        this.originalImage_data = img.data;

        this.resizingFactor = 0.2;


        this.history = [];


        this.PhotoFilters = new PhotoFilters();
    }


    ResizeImage(){

        const originalWidth = this.originalImage.width-30;
        const originalHeight = this.originalImage.height-30;

        const canvasWidth = originalWidth * this.resizingFactor;
        const canvasHeight = originalHeight * this.resizingFactor;

        canvas.width = canvasWidth;
        canvas.height = canvasHeight;

        context.drawImage(
            this.originalImage,
            0,
            0,
            originalWidth * this.resizingFactor,
            originalHeight * this.resizingFactor
        );
    }

    ApplyFilter(type){


        switch(type){
            case "grayscale":
                this.PhotoFilters.GrayScale();
                break;

            case "sepia":
                this.PhotoFilters.Sepia();;
                break;
            
            case "brigthness":
                this.PhotoFilters.Brightness();;
                break;
            default:
                break;  
        }

        this.history.push(context.getImageData(0,0,canvas.width,canvas.height));
    }

    ReturnImage(){

        return canvas.toDataURL();

    }

    Undo(){
        // Check if there is a previous version of the image in the history stack
        if (this.history.length > 1) {
            // Remove the current version of the image from the history stack
            this.history.pop();

            // Get the previous version of the image from the history stack
            const imageData = this.history[this.history.length - 1];

             // Update the canvas with the previous version of the image
            context.putImageData(imageData, 0, 0);
        }
    }
}






const img = new Image();

img.src = 'casa.jpg';
const imgDiv = document.getElementById("image");

const Editor = new MainEditor(img);


img.onload = ()=>{





    Editor.ResizeImage(0.2);
    Editor.ApplyFilter();
    imgDiv.src = Editor.ReturnImage();

}

const buttons = document.getElementsByClassName("toolFilter")
for(let i=0; i<buttons.length;i++){
    buttons[i].addEventListener("click",()=>{
        Editor.ApplyFilter(buttons[i].value);
        imgDiv.src = Editor.ReturnImage();
    })


}

document.getElementById("getLastSave").addEventListener("click",()=>{
    Editor.Undo();
})
