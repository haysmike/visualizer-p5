let audioInput;
let fft;
let ranges;
let peakDetectors;

const showInputSelector = async () => {
  const sources = await audioInput.getSources();
  const select = createSelect();
  const defaultOption = 'Select an audio source to begin';
  select.option(defaultOption);
  select.disable(defaultOption);
  select.selected(defaultOption);
  for (let i = 0; i < sources.length; i++) {
    select.option(sources[i].label, i);
  }
  select.changed(() => {
    userStartAudio();
    audioInput.setSource(select.value());
    audioInput.start();
  });
};

function setup() {
  createCanvas(1280, 720);
  audioInput = new p5.AudioIn(console.error);
  audioInput.start(showInputSelector, console.error);
  fft = new p5.FFT(0.8, 1024);
  fft.setInput(audioInput);
  ranges = [fft.bass, fft.lowMid, fft.mid, fft.highMid, fft.treble];
  peakDetectors = ranges.map((range) => {
    const peakDetector = new p5.PeakDetect(...range, 0.4, 20);
    return peakDetector;
  });
}

function draw() {
  background(0);
  fft.analyze();
  const spectrum = fft.logAverages(fft.getOctaveBands(1));
  noStroke();
  fill(63, 0, 63);
  for (let i = 0; i < spectrum.length; i++) {
    const x = map(i, 0, spectrum.length, 0, width);
    const h = -height + map(spectrum[i], 0, 255, height, 0);
    rect(x, height, width / spectrum.length, h);
  }
  for (let i = 0; i < ranges.length; i++) {
    // Using `-1, ranges.length` instead of `0, ranges.length - 1` to add padding
    const x = map(i, -1, ranges.length, 0, width);
    const r = fft.getEnergy(...ranges[i]);
    const peakDetector = peakDetectors[i];
    peakDetector.update(fft);
    fill(
      255 -
        (peakDetector.framesSinceLastPeak / peakDetector.framesPerPeak) * 127,
      255,
      map(i, 0, ranges.length - 1, 0, 255)
    );
    ellipse(x, height / 2, r, r);
  }

  // const waveform = fft.waveform();
  // noFill();
  // beginShape();
  // stroke(20);
  // for (let i = 0; i < waveform.length; i++) {
  //   const x = map(i, 0, waveform.length, 0, width);
  //   const y = map(waveform[i], -1, 1, 0, height);
  //   vertex(x, y);
  // }
  // endShape();
}
