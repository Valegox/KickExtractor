// Get DOM elts
const uploadButton = document.getElementById('upload')
const fileInput = document.getElementById('file')
const pauseButton = document.getElementById('pause')

// Check for BlobURL support
var blob = window.URL || window.webkitURL
if (!blob) {
    console.log('Your browser does not support Blob URLs :(')
    exit
}

// Load song
uploadButton.addEventListener('click', async () => {
    const url = blob.createObjectURL(fileInput.files[0])

    const audioCtx = new AudioContext();

    const audioEle = new Audio();

    audioEle.src = url; //insert file name here
    audioEle.autoplay = true;
    audioEle.preload = "auto";

    const audioSourceNode = audioCtx.createMediaElementSource(audioEle);

    //Create analyser node
    const analyserNode = audioCtx.createAnalyser();
    analyserNode.fftSize = 256;
    const bufferLength = analyserNode.frequencyBinCount;
    const dataArray = new Float32Array(bufferLength);

    console.log(bufferLength)

    //Set up audio node network
    audioSourceNode.connect(analyserNode);
    analyserNode.connect(audioCtx.destination);

    //Create 2D canvas
    const canvas = document.createElement("canvas");
    canvas.style.position = "absolute";
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    document.body.appendChild(canvas);
    const canvasCtx = canvas.getContext("2d");
    canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

    function draw() {
        //Schedule next redraw
        requestAnimationFrame(draw);

        //Get spectrum data
        analyserNode.getFloatFrequencyData(dataArray);

        //Draw black background
        canvasCtx.fillStyle = "rgb(0, 0, 0)";
        canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

        //Draw spectrum
        const barWidth = (canvas.width / bufferLength) * 2.5;
        let posX = 0;
        for (let i = 0; i < 1; i++) {
            const barHeight = Math.exp((dataArray[i] + 200) / 25)
            //const barHeight = Math.exp(Math.exp((dataArray[i] + 200) / 70))
            if (barHeight >= 1300) {
                canvasCtx.fillStyle = "rgb(" + Math.floor(barHeight + 100) + ", 50, 50)";
                canvasCtx.fillRect(
                    posX,
                    canvas.height - barHeight / 2,
                    barWidth / 2,
                    barHeight / 2
                );
            }

            posX += barWidth + 1;
        }
    }

    draw()
})
