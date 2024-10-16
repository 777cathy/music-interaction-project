let memories = [];
let video;
let font;
let input;
let submitButton;
let song;
let fft;
let colorPalette = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FDCB6E', '#6C5CE7'];
let delayedFrames = [];

let maxDelay = 120; // 2 seconds at 60fps
let videoLoaded = false;
let clearButton;


function preload() {
  font = loadFont('https://cdnjs.cloudflare.com/ajax/libs/topcoat/0.8.0/font/SourceSansPro-Light.otf');
  song = loadSound('memory_1.m4a'); 
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  textFont(font);
  
  // Set up video capture with delayed effect
  video = createCapture(VIDEO, () => {
    videoLoaded = true;
  });
  video.size(width, height);
  video.hide();
  
  // Initialize delayed frames
  for (let i = 0; i < maxDelay; i++) {
    delayedFrames.push(createGraphics(width, height));
  }
  
  // Create input field and submit button
  input = createInput();
  input.position(20, height - 50);
  submitButton = createButton('Add Memory');
  submitButton.position(input.x + input.width + 10, height - 50);
  submitButton.mousePressed(addMemory);

  // Create clear button
  clearButton = createButton('Clear All Memories');
  clearButton.position(submitButton.x + submitButton.width + 10, height - 50);
  clearButton.mousePressed(clearAllMemories);
  
  // Load saved memories
  loadMemories();

  // Set up audio analysis
  fft = new p5.FFT();
  song.loop();
}

function draw() {
  // 绘制半透明的背景
  background(50, 20);
  
  // 如果视频已加载，更新延迟帧
  if (videoLoaded) {
    updateDelayedFrames();
    
    // 绘制延迟的视频feed
    push();
    tint(255, 70);
    let delayedFrame = delayedFrames[floor(random(maxDelay))];
    image(delayedFrame, 0, 0, width, height);
    filter(BLUR, 2);
    pop();
  }
  
  // 分析音频
  let spectrum = fft.analyze();
  let energy = fft.getEnergy("mid");
  
  // 更新并显示记忆
  for (let memory of memories) {
    memory.update(energy);
    memory.display();
  }
  
  // 定期保存记忆
  if (frameCount % 300 == 0) {
    saveMemories();
  }
}

function updateDelayedFrames() {
  // 移除最旧的帧
  delayedFrames.shift();
  
  // 创建一个新的图像帧并将视频帧复制到图像中
  let newFrame = createGraphics(width, height);
  newFrame.image(video, 0, 0, width, height);
  delayedFrames.push(newFrame);
}

function addMemory() {
  let text = input.value();
  if (text !== '') {
    let x = random(width);
    let y = random(height);
    let color = random(colorPalette);
    memories.push(new Memory(x, y, text, color));
    input.value('');
    saveMemories(); // 立即保存新添加的记忆
  }
}

function saveMemories() {
  let memoryData = memories.map(m => ({
    x: m.pos.x,
    y: m.pos.y,
    text: m.text,
    color: m.color
  }));
  localStorage.setItem('memories', JSON.stringify(memoryData));
}

function loadMemories() {
  memories = []; // 清空现有的记忆
  let savedMemories = localStorage.getItem('memories');
  if (savedMemories) {
    let memoryData = JSON.parse(savedMemories);
    memoryData.forEach(m => {
      memories.push(new Memory(m.x, m.y, m.text, m.color));
    });
  }
}

class Memory {
  constructor(x, y, text, color) {
    this.pos = createVector(x, y);
    this.vel = createVector(random(-0.5, 0.5), random(-0.5, 0.5));
    this.text = text;
    this.color = color;
    this.size = random(18, 36); // 减小文字大小范围
    this.alpha = 0;
    this.fadeSpeed = random(0.005, 0.02);
  }
  
  update(energy) {
    this.pos.add(this.vel);
    this.vel.mult(0.99);
    
    // 移除大幅度的放大缩小效果
    let pulse = sin(frameCount * 0.05) * 2; // 减小脉动效果
    this.size += pulse;
    
    this.alpha = 127 + 127 * sin(frameCount * this.fadeSpeed);
    
    if (this.pos.x < 0 || this.pos.x > width) this.vel.x *= -1;
    if (this.pos.y < 0 || this.pos.y > height) this.vel.y *= -1;
  }
  
  display() {
    push();
    translate(this.pos.x, this.pos.y);
    
    textSize(this.size);
    textAlign(CENTER, CENTER);
    fill(this.color + hexAlpha(this.alpha));
    text(this.text, 0, 0);
    
    pop();
  }
}

function hexAlpha(alpha) {
  return hex(floor(alpha), 2).toString();
}

function clearAllMemories() {
  memories = [];
  localStorage.removeItem('memories');
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  video.size(width, height);
  input.position(20, height - 50);
  submitButton.position(input.x + input.width + 10, height - 50);
  clearButton.position(submitButton.x + submitButton.width + 10, height - 50);
  
  // 清空并重新初始化延迟帧
  delayedFrames = [];
  for (let i = 0; i < maxDelay; i++) {
    delayedFrames.push(createGraphics(width, height));
  }
}