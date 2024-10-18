let memories = [];
let video;
let font;
let input;
let submitButton;
let song;
let fft;
let colorPalette = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FDCB6E', '#6C5CE7'];
let delayedFrames = [];
let maxDelay = 120; // 约2秒延迟 (60fps)
let videoLoaded = false;
let clearButton;

function preload() {
  font = loadFont('https://cdnjs.cloudflare.com/ajax/libs/topcoat/0.8.0/font/SourceSansPro-Light.otf');
  song = loadSound('memory-1.mp3'); 
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  textFont(font);
  
  // 设置视频捕获
  video = createCapture(VIDEO, () => {
    videoLoaded = true;
    // 初始化延迟帧
    for (let i = 0; i < maxDelay; i++) {
      let img = createImage(width, height);
      img.loadPixels();
      delayedFrames.push(img);
    }
  });
  video.size(width, height);
  video.hide();
  
  // 创建输入框和提交按钮
  input = createInput();
  input.position(20, height - 50);
  submitButton = createButton('Add Memory');
  submitButton.position(input.x + input.width + 10, height - 50);
  submitButton.mousePressed(addMemory);

  // 创建清除按钮
  clearButton = createButton('Clear All Memories');
  clearButton.position(submitButton.x + submitButton.width + 10, height - 50);
  clearButton.mousePressed(clearAllMemories);
  
  // 加载保存的记忆
  loadMemories();

  // 设置音频分析
  fft = new p5.FFT();
  song.loop();
}

function draw() {
  // 绘制半透明的背景
  background(50, 20);
  
  if (videoLoaded) {
    updateDelayedFrames();
    
    // 绘制延迟的视频feed，并应用回忆效果
    push();
    tint(255, 150); // 轻微透明度
    let delayedFrame = delayedFrames[0];
    image(delayedFrame, 0, 0, width, height);
    
    // 添加复古滤镜效果
    filter(BLUR, 1.5); // 模糊处理
    tint(255, 170, 150); // 暖色调，增强回忆感
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
  
  // 创建一个新的图像用于保存当前视频帧
  let newFrame = createImage(width, height);
  newFrame.loadPixels();
  video.loadPixels();
  
  // 将视频的像素数据复制到新帧
  for (let i = 0; i < video.pixels.length; i++) {
    newFrame.pixels[i] = video.pixels[i];
  }
  newFrame.updatePixels();
  
  // 将新帧添加到延迟帧数组的末尾
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
    saveMemories();
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
    this.size = random(18, 36);
    this.alpha = 0;
    this.fadeSpeed = random(0.005, 0.02);
  }
  
  update(energy) {
    this.pos.add(this.vel);
    this.vel.mult(0.99);
    
    let pulse = sin(frameCount * 0.05) * 2;
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
  
  // 重新初始化延迟帧
  delayedFrames = [];
  for (let i = 0; i < maxDelay; i++) {
    let img = createImage(width, height);
    img.loadPixels();
    delayedFrames.push(img);
  }
}
