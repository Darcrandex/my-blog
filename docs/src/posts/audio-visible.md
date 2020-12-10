# 音频可视化

> 后面补全

```js
class AudioVisible {
  constructor(containerId = "") {
    this.$container = document.getElementById(containerId);
    this.$input = null;
    this.$canvas = null;
    this.canvasCtx = null;

    this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    this.source = this.audioCtx.createBufferSource();
    this.analyser = this.audioCtx.createAnalyser();
    this.bufferLength = 0;
    this.dataArray = []; //一个数组,元素为音频中每个频率的大小值(Number),长度为128
    this.maxAudioValue = 256;

    this.initElements();
  }

  initElements() {
    this.$input = document.createElement("input");
    this.$input.type = "file";
    this.$canvas = document.createElement("canvas");
    this.canvasCtx = this.$canvas.getContext("2d");

    // settings
    this.$canvas.width = 800;
    this.$canvas.height = 400;

    this.$container.append(this.$input);
    this.$container.append(this.$canvas);
    this.bindInputEvent();
  }

  bindInputEvent() {
    const reader = new FileReader();

    this.$input.onchange = (event) => {
      const file = event.target.files[0];
      reader.readAsArrayBuffer(file);
    };

    reader.onload = (event) => {
      const arrayBuffer = event.target.result;
      this.onDecode(arrayBuffer);
    };
  }

  onDecode(arrayBuffer) {
    this.audioCtx.decodeAudioData(
      arrayBuffer,
      (buffer) => {
        this.source.buffer = buffer;
        this.source.loop = true;
        this.source.connect(this.audioCtx.destination);
        this.source.start(0);
        this.source.connect(this.analyser);
        this.analyser.connect(this.audioCtx.destination);
        this.analyser.fftSize = this.maxAudioValue;
        this.bufferLength = this.analyser.frequencyBinCount;
        this.dataArray = new Uint8Array(this.bufferLength);

        this.onDrawCanvas();
      },
      (err) => console.error(err)
    );
  }

  onDrawCanvas() {
    const { width, height } = this.$canvas;
    const lineOffsetBase = width / this.bufferLength;
    this.canvasCtx.fillRect(0, 0, width, height);
    this.analyser.getByteFrequencyData(this.dataArray);

    this.canvasCtx.strokeStyle = "#ffffff";
    this.canvasCtx.beginPath();
    for (let i = 0; i < this.bufferLength; i++) {
      const x = i * lineOffsetBase;
      const y = height - (this.dataArray[i] / this.maxAudioValue) * height;
      this.canvasCtx.moveTo(x, height);
      this.canvasCtx.lineTo(x, y);
      this.canvasCtx.stroke();
    }

    requestAnimationFrame(this.onDrawCanvas.bind(this));
  }
}
```
