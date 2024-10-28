let currentScene;
let scenes = {};
let tickSound, hourglassSound, oldPhotoSound, oldPhotoImage,fieldFlowSound;
//address "AudioContext" issue on Chorme
let audioContextStarted = false;

/* 
 Preload background music for each scene and background picture. 
 */
function preload() {
  tickSound = loadSound("tick_tock.wav");
  hourglassSound = loadSound("hourglass_sound.mp3");
  oldPhotoSound = loadSound("oldPhotoSound.wav");
  oldPhotoImage = loadImage("oldPhoto.jpg");
  flowFieldSound = loadSound("flow_field_music.wav");
  delayedSceneMusic = loadSound("video_sound.mp3");  
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  textAlign(CENTER, CENTER);
  tickSound.loop();

  // All scenes
  scenes = {
    main: new MainScene(),
    timeRewind: new TimeRewindScene(),
    oldPhoto: new OldPhotoScene(),
    flowField: new FlowFieldScene(),
    transition: new TransitionScene(),
    delayedVideo: new DelayedVideoScene()
  };
  
  currentScene = scenes.main;
  // Logic deal with scene error
  if (!currentScene) {
    console.error('Current scene not properly initialized');
    currentScene = scenes.main; 
  }
}

function draw() {
  currentScene.display();
}

/* 
address "AudioContext" issue
 */
function resumeAudioContext() {
  if (!audioContextStarted) {
    if (typeof getAudioContext === 'function') {
      getAudioContext().resume(); //start sound
      audioContextStarted = true;
    }
  }
}

/* 
address "AudioContext" issue, palying sound after the first interaction
 */
function mousePressed() {
  resumeAudioContext();
  if (currentScene && typeof currentScene.handleClick === 'function') {
    currentScene.handleClick();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  if (currentScene.initialize) {
    currentScene.initialize();
  }
}


/**
 * MainScene：Initial scene class. Display an interactive clock, bringing users to entangled reality travel.
 * @class
 * @description The scene contains a dynamically clock, gradually displayed guidance text and mouse follow effect.
 * Click the screen to gradually display the text, and after the guidance is completed, it will switch to the time rewind scene.
 */
class MainScene {
  constructor() {
    this.hourLength = 150;   
    this.minuteLength = 200; 
    this.clockRadius = 250;  
    this.textAlpha = [0, 0, 0, 0];
    this.ticktock = 0;
    this.time = 0;         
  }

  display() {
    background(255, 200, 150);
    this.drawClock();
    this.drawMainTexts();
    this.drawMouseInteraction();
    this.time += 0.002;  
  }

  drawClock() {
    push();
    translate(width / 2, height / 2);
    
    // Draw the outline of the clock
    noFill();
    strokeWeight(2);
    for (let i = 0; i < 6; i++) {
      stroke(255, 150, 100, 150 - i * 20);
      ellipse(0, 0, this.clockRadius + i * 20);
    }

    // Draw the clock ticks
    for (let i = 0; i < 12; i++) {
      let angle = i * TWO_PI / 12;
      push();
      rotate(angle);
      stroke(255, 150, 100);
      strokeWeight(3);
      line(this.clockRadius - 30, 0, this.clockRadius - 10, 0);
      pop();
    }
   

    // Draw minute length
    push();
    rotate(this.time);
    stroke(255, 100, 50);
    strokeWeight(4);
    line(0, 0, 0, -this.minuteLength);
    pop();

    // draw hour length
    push();
    rotate(this.time * 0.5);
    stroke(255, 50, 0);
    strokeWeight(6);
    line(0, 0, 0, -this.hourLength);
    pop();
    
    // draw clock center
    fill(255, 100, 50);
    noStroke();
    ellipse(0, 0, 20);
    pop();
  }

  drawMainTexts() {
    textSize(40);
    let texts = ["Time is running.","But......","Do you believe in time travel?", "Or have you ever seen an entangled world?"];
    let colors = [
      [234, 84, 85],    
      [255, 107, 107],  
      [226, 83, 83],    
      [214, 69, 65]     
    ];
    
    let yOffset = height * 0.75;
    
    for (let i = 0; i < 4; i++) {
      if (this.textAlpha[i] > 0) {
        push();
        fill(0, 0, 0, this.textAlpha[i] * 0.2);  
        text(texts[i], width / 2 + 2, yOffset + i * 60 - 88);  
        
        fill(colors[i][0], colors[i][1], colors[i][2], this.textAlpha[i]);
        text(texts[i], width / 2, yOffset + i * 60 - 90);
        pop();
      }
    }
  }

  /* 
  Create a dynamic pointer effect that follows the mouse movement
  */
  drawMouseInteraction() {
    push();
    translate(mouseX, mouseY);
    
    noFill();
    for (let i = 0; i < 3; i++) {
      let alpha = map(sin(frameCount * 0.05 + i), -1, 1, 50, 150);
      stroke(255, 150, 100, alpha);
      strokeWeight(2);
      let size = 15 + i * 10;
      ellipse(0, 0, size, size);
    }
    
    stroke(255, 100, 50);
    strokeWeight(3);
    
    line(-5, 0, 20, 0);
    
    line(20, 0, 15, -5);
    line(20, 0, 15, 5);
    
    noStroke();
    fill(255, 100, 50);
    ellipse(-5, 0, 6, 6);
    
    pop();
  }

  /*
   Handle mouse click events. Control text display and scene transition
   */
  handleClick() {
    this.ticktock++;
    if (this.ticktock <= 4) {
      this.textAlpha[this.ticktock - 1] = 255;  
    } else {
      currentScene = scenes.timeRewind;
      tickSound.stop();
      hourglassSound.play();
    }
  }
}

/**
 * TimeRewindScene: The second scene of the project.
 * @class
 * @description This scene create a particle(sand) system wioth a hourglass and a dynamic background to let people get into 
 * the time rewind scene.
 */
class TimeRewindScene {
  constructor() {
    // Particle system configuration
    this.particles = [];
    this.numParticles = 300;
    
    // Time warp effect configuration
    this.timeWarp = [];
    this.numWarpLines = 50;
    this.warpAngle = 0;
    this.warpSpeed = 0.02;
    
    // Hourglass configuration
    this.hourglassWidth = 200;
    this.neckWidth = 20;
    this.neckHeight = 40;
    
    // Background gradient colors
    this.gradientColors = {
      top: color(0, 12, 36),      
      bottom: color(15, 32, 80)   
    };
    
    this.initialize();
  }

  initialize() {
    // Initialize particles
    this.particles = [];
    for (let i = 0; i < this.numParticles; i++) {
      this.particles.push(this.createParticle());
    }
    
    // Initialize time warp effect
    this.timeWarp = [];
    for (let i = 0; i < this.numWarpLines; i++) {
      this.timeWarp.push({
        radius: random(100, max(width, height)),
        angle: random(TWO_PI),
        speed: random(0.01, 0.03),
        thickness: random(1, 3),
        color: color(
          random(150, 200),  
          random(180, 220), 
          random(230, 255), 
          random(130, 180)
        )
      });
    }
  }

  display() {
    this.drawBackground();
    this.drawTimeWarp();
    this.drawHourglass();
    this.drawSand();
    this.drawMouseHint(); 
    this.warpAngle += this.warpSpeed;
  }

  drawBackground() {
    for (let y = 0; y < height; y++) {
      let inter = map(y, 0, height, 0, 1);
      let c = lerpColor(this.gradientColors.top, this.gradientColors.bottom, inter);
      stroke(c);
      line(0, y, width, y);
    }
    
    for (let i = 0; i < 150; i++) {
      let x = random(width);
      let y = random(height);
      let size = random(1, 3);
      let alpha = map(sin(frameCount * random(0.02, 0.05) + i), -1, 1, 50, 255);
      
      let starColor = color(255, 255, random(200, 255));
      fill(starColor.levels[0], starColor.levels[1], starColor.levels[2], alpha * 0.5);
      noStroke();
      ellipse(x, y, size * 2);  
      
      fill(starColor.levels[0], starColor.levels[1], starColor.levels[2], alpha);
      ellipse(x, y, size);     
    }
  }

  drawTimeWarp() {
    push();
    translate(width/2, height/2);
    
    // Draw spiral of space-time distortions
    for (let warpLine of this.timeWarp) {
      stroke(warpLine.color);
      strokeWeight(warpLine.thickness);
      noFill();
      
      beginShape();
      for (let a = 0; a < TWO_PI * 2; a += 0.1) {
        let xoff = cos(a + this.warpAngle * warpLine.speed) * warpLine.radius;
        let yoff = sin(a + this.warpAngle * warpLine.speed) * warpLine.radius;
        let distort = sin(a * 3 + this.warpAngle) * 50 + cos(a * 2) * 25;
        vertex(xoff + distort, yoff + distort);
      }
      endShape();
      
      warpLine.radius += sin(this.warpAngle * 0.5) * 2;
      warpLine.radius = constrain(warpLine.radius, 50, max(width, height));
    }
    pop();
  }

  drawHourglass() {
    push();
    translate(width/2, height/2);
    
    // create glow effect layer for hourglass
    noFill();
    for (let i = 3; i > 0; i--) {
      strokeWeight(i);
      stroke(100, 150, 255, 50/i);  
      
      beginShape();
      vertex(-this.hourglassWidth/2, -200);
      vertex(this.hourglassWidth/2, -200);
      vertex(0, 0);
      endShape(CLOSE);
      
      beginShape();
      vertex(-this.hourglassWidth/2, 200);
      vertex(this.hourglassWidth/2, 200);
      vertex(0, 0);
      endShape(CLOSE);
    }
    
    // main hourglass--solid outline
    strokeWeight(2);
    stroke(150, 180, 255, 150);
    
    beginShape();
    vertex(-this.hourglassWidth/2, -200);
    vertex(this.hourglassWidth/2, -200);
    vertex(0, 0);
    endShape(CLOSE);
    
    beginShape();
    vertex(-this.hourglassWidth/2, 200);
    vertex(this.hourglassWidth/2, 200);
    vertex(0, 0);
    endShape(CLOSE);
    
    // draw neck connection
    fill(100, 150, 255, 100);
    noStroke();
    rect(-this.neckWidth/2, -this.neckHeight/2, this.neckWidth, this.neckHeight);
    pop();
  }

  drawSand() {
    push();
    translate(width/2, height/2);
    
    for (let particle of this.particles) {
      // Draw particle glow effect
      for (let i = 3; i > 0; i--) {
        noStroke();
        let glowSize = particle.size * (i * 1.5);
        let glowAlpha = 100 / i;
        fill(255, 220, 150, glowAlpha); 
        ellipse(particle.x, particle.y, glowSize);
      }
      
      fill(255, 220, 150);
      ellipse(particle.x, particle.y, particle.size);
      
      particle.y -= particle.speed * 2;
      
      // Slow down particles in neck area
      if (particle.y < this.neckHeight/2 && particle.y > -this.neckHeight/2) {
        particle.speed = max(particle.speed * 0.9, 0.5);
      }
      
      // Reset particles that reach the top
      if (particle.y < -height/2) {
        Object.assign(particle, this.createParticle(true));
      }
      this.constrainToHourglass(particle);
    }
    pop();
  }

  createParticle(atBottom = false) {
    let x = random(-this.hourglassWidth/2, this.hourglassWidth/2);
    let y = atBottom ? height/2 : random(-height/2, height/2);
    return {
      x,
      y,
      speed: random(3, 6), 
      size: random(2, 5)
    };
  }

  drawMouseHint() {
    push();
    let pulseAlpha = map(sin(frameCount * 0.05), -1, 1, 100, 255);
    
    noFill();
    for (let i = 3; i > 0; i--) {
        strokeWeight(i);
        stroke(150, 180, 255, pulseAlpha/i);
        circle(mouseX, mouseY, 30);
    }
  
    fill(150, 180, 255, pulseAlpha);
    noStroke();
    circle(mouseX, mouseY, 10);
    pop();
}

  constrainToHourglass(particle) {
    let currentWidth = map(abs(particle.y), 0, height/2, this.neckWidth, this.hourglassWidth);
    
    // Constrain particles within hourglass shape
    if (abs(particle.x) > currentWidth/2) {
      particle.x = sign(particle.x) * currentWidth/2;
      particle.speed = random(3, 6); 
    }
  }

  handleClick() {
    currentScene = scenes.oldPhoto;
    hourglassSound.stop();
    oldPhotoSound.play();
  }
}

function sign(x) {
  return x > 0 ? 1 : -1;
}


/**
 * OldPhotoScene: The third scene of the project
 * @class
 * @description An old photo with a ripple effect guide people to recall and enter the entangled reality.
 * Each click will produce a ripple effect on the  photo, while displaying a text about memory.
 */
class OldPhotoScene {
  constructor() {
    this.transitionAlpha = 0;
    this.ripples = [];
    this.clickCount = 0;
    this.currentMessage = "";
    this.messages = [
      "Is the memory fading away?",
      "Is there something you could not forget?",
      "Are you entangled with the past?"
    ];
    
    this.mouseGlowSize = 40;
    this.mouseGlowOpacity = 60;
  }

  display() {
    if (this.transitionAlpha < 255) {
      scenes.timeRewind.display();
      tint(255, this.transitionAlpha);
      image(oldPhotoImage, 0, 0, width, height);
      this.transitionAlpha += 3;
    } else {
      image(oldPhotoImage, 0, 0, width, height);
      this.drawRipples();
      this.drawMouseGlow(); 
      this.displayMessage();
    }
  }

  drawMouseGlow() {
    push();
    blendMode(SCREEN); 
    noStroke();
    
    for (let i = this.mouseGlowSize; i > 0; i -= 1.5) {
      let alpha = map(i, 0, this.mouseGlowSize, 0, this.mouseGlowOpacity);
      fill(180, 160, 140, alpha);
      circle(mouseX, mouseY, i);
    }
    
    for (let i = this.mouseGlowSize * 0.6; i > 0; i -= 1.5) {
      let alpha = map(i, 0, this.mouseGlowSize * 0.6, 0, this.mouseGlowOpacity * 1.2);
      fill(200, 180, 160, alpha);
      circle(mouseX, mouseY, i);
    }
    fill(255, 240, 220, this.mouseGlowOpacity * 1.5);
    circle(mouseX, mouseY, 4);
    
    pop();
  }


  handleClick() {
    this.ripples.push(new Ripple(mouseX, mouseY));
    this.clickCount++;
    
    if (this.clickCount <= this.messages.length) {
      this.currentMessage = this.messages[this.clickCount - 1];
    }

    if (this.clickCount > this.messages.length) {
      oldPhotoSound.stop();
      flowFieldSound.loop();
      currentScene = scenes.flowField;  
    }
  }

  drawRipples() {
    for (let i = this.ripples.length - 1; i >= 0; i--) {
      this.ripples[i].display();
      this.ripples[i].update();
      if (this.ripples[i].isFinished()) {
        this.ripples.splice(i, 1);
      }
    }
  }

  displayMessage() {
    if (this.currentMessage) {
      fill(255);
      textSize(36);
      text(this.currentMessage, width / 2, height / 2);
    }
  }
}

class Ripple {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.diameter = 0;
    this.maxDiameter = min(width, height) * 0.8;
    this.opacity = 255;
  }

  display() {
    noFill();
    stroke(255, this.opacity);
    ellipse(this.x, this.y, this.diameter);
  }

  update() {
    this.diameter += 5;
    this.opacity -= 3;
  }

  isFinished() {
    return this.opacity <= 0 || this.diameter >= this.maxDiameter;
  }
}

/**
 * FlowFieldScene: The fourth scene of the project
 * @class
 * @description Create a dynamic particle flow field to visualize the flow of time and memory.
 * Particles move in a field generated by Perlin noise, 
 * and people can change the activity of particles by pressing specific keyboards and clicking mouse.
 */
class FlowFieldScene {

  constructor() {
      this.particles = [];
      this.flowField = [];
      this.cols = 50;
      this.rows = 50;
      this.flowFieldAngle = 0;
      this.particleCount = 1000;
      this.fadeAmount = 0;
      
      this.mousePressed = false;
      this.mouseDragForce = 5;
      this.baseSpeed = 0.8;  
      this.timeSpeed = this.baseSpeed;
      this.colorMode = 'default';
      this.noiseScale = 0.02;
      
      // keyboard control
      this.keys = {
        speedUp: false,    
        slowDown: false,   
        attract: false,    
        repel: false      
      };
      
      // transition related
      this.transitionStarted = false;
      this.transitionProgress = 0;
      this.transitionSpeed = 0.005;
      this.spiralProgress = 0;
      
      this.showPrompt = false;
      this.promptAlpha = 0;
      this.promptTimer = 0;
      this.promptDelay = 300;  
  
      this.centerText = "Flow with the field of time";
      this.subText = "Watch as moments drift by";
      this.isFirstKeyPressed = false;
      
      this.initialize();
    }
  
    initialize() {
      for (let y = 0; y < this.rows; y++) {
        this.flowField[y] = [];
        for (let x = 0; x < this.cols; x++) {
          this.flowField[y][x] = 0;
        }
      }
  
      for (let i = 0; i < this.particleCount; i++) {
        this.particles.push(this.createParticle(random(width), random(height)));
      }
      
      window.addEventListener('keydown', this.handleKeyDown.bind(this));
      window.addEventListener('keyup', this.handleKeyUp.bind(this));
    }
  
    createParticle(x, y) {
      return {
        x: x,
        y: y,
        speed: random(2, 5),
        size: random(2, 4),
        color: this.getParticleColor(),
        age: 0,
        maxAge: random(200, 400),
        initialAngle: 0,
        initialRadius: 0
      };
    }
  
    getParticleColor() {
      switch(this.colorMode) {
        case 'rainbow':
          return color(random(360), 80, 80);
        case 'monochrome':
          let blueBase = random(180, 220);
          return color(
            blueBase * 0.3,
            blueBase * 0.5,
            blueBase,
            random(150, 200)
          );
        default:
          let brightness = random(200, 255);
          return color(
            brightness,
            brightness * random(0.8, 1),
            brightness * random(0.9, 1.1),
            random(100, 150)
          );
      }
    }
  
    display() {
      if (this.transitionStarted) {
        this.drawTransition();
      } else {
        this.handleTimeControl();
        
        if (this.fadeAmount < 255) {
          background(0, this.fadeAmount);
          this.fadeAmount += 2;
        } else {
          background(0, 10);
        }
  
        this.updateFlowField();
        this.updateAndDrawParticles();
        this.displayControlText();
        this.displayCenterText();
  
        this.promptTimer++;
        if (this.promptTimer > this.promptDelay) {
          this.showTransitionPrompt();
        }
      }
    }
  
    displayControlText() {
      fill(255, min(this.fadeAmount * 2, 255));
      textSize(16);
      textAlign(LEFT, TOP);
      text(`
        Controls:
        W/S - Attract/Repel 
        A/D - Speed up/Slow down time
        R/M/C - Rainbow/Blue Monochrome/Soft White colors
        P - Change flow pattern
        CLICK - Create new memory
      `, 20, 20);
    }
  
    displayCenterText() {
      push();
      textAlign(CENTER, CENTER);
      textSize(32);
      fill(255, min(this.fadeAmount * 2, 255));
      
      if (!this.isFirstKeyPressed) {
        text(this.centerText, width/2, height/2);
        textSize(24);
        text(this.subText, width/2, height/2 + 40);
      } else {
        text(this.centerText, width/2, height/2);
      }
      pop();
    }
  
    updateCenterText(newText) {
      this.isFirstKeyPressed = true;
      this.centerText = newText;
    }
  
    updateAndDrawParticles() {
      for (let i = this.particles.length - 1; i >= 0; i--) {
        let particle = this.particles[i];
        
        let flowForce = this.getFlowForce(particle);
        let mouseForce = this.getMouseForce(particle);
        
        particle.x += flowForce.x + mouseForce.x;
        particle.y += flowForce.y + mouseForce.y;
        
        this.handleBoundary(particle);
        
        particle.age++;
        
        if (particle.age < particle.maxAge) {
          let alpha = map(particle.age, 0, particle.maxAge, 150, 0);
          
          if (this.colorMode === 'monochrome') {
            let glowSize = particle.size * 2;
            noStroke();
            fill(100, 150, 255, alpha * 0.3);
            ellipse(particle.x, particle.y, glowSize);
          }
          else if (this.colorMode === 'default') {
            let glowSize = particle.size * 1.5;
            noStroke();
            fill(255, 255, 255, alpha * 0.2);
            ellipse(particle.x, particle.y, glowSize);
          }
          
          fill(red(particle.color), green(particle.color), blue(particle.color), alpha);
          noStroke();
          ellipse(particle.x, particle.y, particle.size);
        } else {
          this.particles[i] = this.createParticle(random(width), random(height));
        }
      }
    }
  
   showTransitionPrompt() {
      if (!this.showPrompt) {
        this.showPrompt = true;
      }
  
      if (this.promptAlpha < 255) {
        this.promptAlpha += 2;
      }
  
      push();
      textAlign(CENTER, BOTTOM);
      textSize(20);
      fill(255, this.promptAlpha);
      text("Press ENTER to look into your memories", width/2, height - 30);
      pop();
    }
  
    updateFlowField() {
      let xoff = 0;
      for (let x = 0; x < this.cols; x++) {
        let yoff = 0;
        for (let y = 0; y < this.rows; y++) {
          let noiseVal = noise(
            xoff, 
            yoff, 
            frameCount * 0.005 * this.timeSpeed
          );
          this.flowField[y][x] = noiseVal * TWO_PI;
          yoff += this.noiseScale;
        }
        xoff += this.noiseScale;
      }
    }
    
    getFlowForce(particle) {
      let col = floor(particle.x / width * this.cols);
      let row = floor(particle.y / height * this.rows);
      col = constrain(col, 0, this.cols - 1);
      row = constrain(row, 0, this.rows - 1);
      
      let angle = this.flowField[row][col];
      return {
        x: cos(angle) * particle.speed,
        y: sin(angle) * particle.speed
      };
    }
    
    getMouseForce(particle) {
      let force = { x: 0, y: 0 };
      
      if (this.keys.attract || this.keys.repel) {
        let dx = mouseX - particle.x;
        let dy = mouseY - particle.y;
        let distance = sqrt(dx * dx + dy * dy);
        
        if (distance < 100) {
          let strength = map(distance, 0, 100, this.mouseDragForce, 0);
          force.x = (dx / distance) * strength * (this.keys.attract ? 1 : -1);
          force.y = (dy / distance) * strength * (this.keys.attract ? 1 : -1);
        }
      }
      
      return force;
    }
    
    handleBoundary(particle) {
      if (particle.x < 0) {
        particle.x = 0;
        particle.speed *= -0.5;
      }
      if (particle.x > width) {
        particle.x = width;
        particle.speed *= -0.5;
      }
      if (particle.y < 0) {
        particle.y = 0;
        particle.speed *= -0.5;
      }
      if (particle.y > height) {
        particle.y = height;
        particle.speed *= -0.5;
      }
    }
    
    handleTimeControl() {
      if (this.keys.speedUp) {  
        this.timeSpeed = 3; 
      } else if (this.keys.slowDown) {  
        this.timeSpeed = 0.2;  
      } else {
        this.timeSpeed = this.baseSpeed;  
      }
    }
  
    drawTransition() {
      this.transitionProgress += this.transitionSpeed;
      this.spiralProgress += 0.02;
  
      push();
      background(0, 20);
      translate(width/2, height/2);
  
      for (let particle of this.particles) {
        let angle = this.spiralProgress + particle.initialAngle;
        let radius = map(this.transitionProgress, 0, 1, particle.initialRadius, 0);
        
        particle.x = cos(angle) * radius;
        particle.y = sin(angle) * radius;
  
        fill(particle.color.levels[0], particle.color.levels[1], particle.color.levels[2], 
             map(this.transitionProgress, 0.5, 1, 255, 0));
        noStroke();
        ellipse(particle.x, particle.y, particle.size);
      }
      
      if (this.transitionProgress > 0.3) {
        let textAlpha = map(this.transitionProgress, 0.3, 0.7, 0, 255);
        textAlign(CENTER, CENTER);
        textSize(40);
        fill(255, textAlpha);
        text("Memories await...", 0, 0);
      }
      pop();
  
      if (this.transitionProgress >= 1) {
        currentScene = scenes.transition;
        flowFieldSound.stop();
      }
    }
  
    initializeTransition() {
      this.transitionStarted = true;
      
      for (let particle of this.particles) {
        particle.initialAngle = atan2(particle.y - height/2, particle.x - width/2);
        particle.initialRadius = dist(particle.x, particle.y, width/2, height/2);
      }
    }
  
    handleKeyDown(event) {
      switch(event.key.toLowerCase()) {
        case 'w': 
          this.keys.attract = true;
          this.updateCenterText("The memories attract you...");
          break;
        case 's': 
          this.keys.repel = true;
          this.updateCenterText("The memories you want to forget...");
          break;
        case 'a': 
          this.keys.speedUp = true;
          this.updateCenterText("Flash Back!");
          break;
        case 'd': 
          this.keys.slowDown = true;
          this.updateCenterText("Look Back!");
          break;
        case 'r': 
          this.colorMode = 'rainbow';
          this.updateCenterText("The most colorful memory is...");
          break;
        case 'm': 
          this.colorMode = 'monochrome';
          this.updateCenterText("Deep in the blue memory...");
          break;
        case 'c': 
          this.colorMode = 'default';
          this.updateCenterText("Memories flow in your mind...");
          break;
        case 'p': 
          this.noiseScale = random(0.05, 0.2);
          this.updateCenterText("Memories flow in different ways...");
          break;
        case 'enter': 
          if (!this.transitionStarted) {
            this.initializeTransition();
          }
          break;
      }
    }
    
    handleKeyUp(event) {
      switch(event.key.toLowerCase()) {
        case 'w': this.keys.attract = false; break;
        case 's': this.keys.repel = false; break;
        case 'a': this.keys.speedUp = false; break;
        case 'd': this.keys.slowDown = false; break;
      }
    }
  
    handleClick() {
      if (!this.transitionStarted) {
      
        this.updateCenterText("Add new memory");
        
        for (let i = 0; i < 20; i++) {
          this.particles.push(this.createParticle(mouseX, mouseY));
        }
        
        while (this.particles.length > this.particleCount + 100) {
          this.particles.shift();
        }
      }
    }
  }
  
  
  
/**
 * TransitionScene: the fifth scene of the project
 * @class
 * @description The transition from the previous scene to the next delayed video scene, 
 * allows people to clearly know what will happen in the next scene, without being confused
 * or thinking it is a technical failure after watching the delayed video.
 */
class TransitionScene {
  constructor() {
    this.messageOpacity = 0;
    this.fadeInComplete = false;
    this.fadeOutStarted = false;
    this.timer = 0;
    this.transitionDuration = 180; 
    this.messages = [
      "Time bends, reality shifts...",
      "In the next scene,",
      "you will see yourself",
      "from 1 second  ago...",
      "Are you ready to meet your past self?"
    ];
    this.currentMessageIndex = 0;
    this.messageTimer = 0;
    this.messageInterval = 90; 
    
    this.particles = [];
    this.particleCount = 100;
    this.rotationAngle = 0;
    this.spiralRadius = 0;
    this.enterPressed = false;
    
    window.addEventListener('keydown', this.handleKeyDown.bind(this));
    window.addEventListener('keyup', this.handleKeyUp.bind(this));
    
    this.initializeParticles();
  }

  initializeParticles() {
    for (let i = 0; i < this.particleCount; i++) {
      this.particles.push({
        angle: random(TWO_PI),
        radius: random(50, 200),
        speed: random(0.01, 0.03),
        size: random(3, 8),
        color: color(255, random(150, 255), random(200, 255)),
        pulsePhase: random(TWO_PI)
      });
    }
  }

  display() {
    background(0);
    
    this.timer++;
    this.messageTimer++;

    // Handle message transitions
    if (this.messageTimer >= this.messageInterval) {
      this.messageTimer = 0;
      if (this.currentMessageIndex < this.messages.length - 1) {
        this.currentMessageIndex++;
      }
    }

    //background
    this.drawTransitionEffects();

    //text
    push();
    textAlign(CENTER, CENTER);
    textSize(36);
    
    // Display previous messages with reducing opacity
    for (let i = 0; i <= this.currentMessageIndex; i++) {
      let messageY = height/2 - (this.currentMessageIndex - i) * 50;
      let opacity = map(i, this.currentMessageIndex - 2, this.currentMessageIndex, 50, 255);
      opacity = constrain(opacity, 50, 255);
      
      fill(255, opacity);
      text(this.messages[i], width/2, messageY);
    }

    // Create a pulsing effect for the last message
    if (this.currentMessageIndex === this.messages.length - 1) {
      let pulseOpacity = map(sin(frameCount * 0.05), -1, 1, 150, 255);
      fill(255, pulseOpacity);
      textSize(24);
      
      if (this.timer < this.transitionDuration) {
        text("Wait...", width/2, height/2 + 100);
      } else {
        text("Press ENTER to continue...", width/2, height/2 + 100);
      }
    }
    pop();
  }

  /* 
  Render geometric transition effects using a particle system
   */
  drawTransitionEffects() {
    push();
    translate(width/2, height/2);
    
    this.rotationAngle += 0.01;
    
    this.spiralRadius = map(sin(frameCount * 0.02), -1, 1, 100, 200);
    
    for (let particle of this.particles) {
      particle.angle += particle.speed;
      
      let r = particle.radius + this.spiralRadius;
      let x = cos(particle.angle + this.rotationAngle) * r;
      let y = sin(particle.angle + this.rotationAngle) * r;
      
      let pulse = map(sin(frameCount * 0.1 + particle.pulsePhase), -1, 1, 0.5, 1.5);
      let size = particle.size * pulse;
      
      let alpha = map(sin(frameCount * 0.05 + particle.pulsePhase), -1, 1, 100, 200);
      
      noStroke();
      fill(red(particle.color), green(particle.color), blue(particle.color), alpha);
      
      ellipse(x, y, size);
      
      for (let i = 1; i <= 2; i++) {
        let trailX = x - cos(particle.angle + this.rotationAngle) * (i * 3);
        let trailY = y - sin(particle.angle + this.rotationAngle) * (i * 3);
        let trailAlpha = alpha / (i * 2.5);
        let trailSize = size * (1 - i * 0.3);
        
        fill(red(particle.color), green(particle.color), blue(particle.color), trailAlpha);
        ellipse(trailX, trailY, trailSize);
      }
    }
    
    pop();
  }

  handleKeyDown(event) {
    if (event.code === 'Enter') {
      this.enterPressed = true;
      if (this.timer >= this.transitionDuration) {
        currentScene = scenes.delayedVideo;
        if (scenes.delayedVideo.activate) {
          scenes.delayedVideo.activate();
        }
      }
    }
  }

  handleKeyUp(event) {
    if (event.code === 'Enter') {
      this.enterPressed = false;
    }
  }
}



class Memory {
  constructor(text) {
    this.text = text;
    this.x = random(width * 0.1, width * 0.9);
    this.y = random(height * 0.3, height * 0.7);
    this.opacity = 0;
    this.createdAt = millis();
    this.lifespan = 4000; 
    this.fadeInDuration = 1000;
    this.fadeOutDuration = 1000;
  }

  update() {
    const currentTime = millis() - this.createdAt;
    
    if (currentTime < this.fadeInDuration) {
      this.opacity = map(currentTime, 0, this.fadeInDuration, 0, 255);
    } 
    else if (currentTime > this.lifespan - this.fadeOutDuration) {
      this.opacity = map(currentTime, 
        this.lifespan - this.fadeOutDuration, 
        this.lifespan, 
        255, 0);
    } 
    else {
      this.opacity = 255;
    }

    this.y -= 0.3;
    this.x += sin(frameCount * 0.02) * 0.5;
  }

  display() {
    push();
    textAlign(CENTER, CENTER);
    textSize(30);
    fill(0, this.opacity * 0.5);
    text(this.text, this.x + 2, this.y + 2);
    fill(255, this.opacity);
    text(this.text, this.x, this.y);
    pop();
  }

  isAlive() {
    return millis() - this.createdAt < this.lifespan;
  }
}

/**
 * DelayedVideoScene: The sixth scene of the project
 * @class
 * @description It is a scene that can capture and display delayed video, 
 * allowing the user to interact with their past self 
 * and recall and reflect based on the background music and the text that appears on the screen. 
 * This scene creates a contemplative space for the user through time displacement.
 */
class DelayedVideoScene {
  constructor() {
    this.delayedFrames = [];
    this.maxDelay = 60;  
    this.memories = [];
    this.videoLoaded = false;
    this.capture = null;
    this.frameBuffer = null;
    this.lastFrameTime = 0;
    this.frameInterval = 1000 / 24;
    this.initializationStarted = false;

    this.thoughtPrompts = [
      "What was I thinking then?",
      "If I could talk to my past self...",
      "This expression looks so familiar...",
      "Is this really how I look?",
      "Where has all the time gone...",
      "Have those dreams come true?",
      "In this moment, I'm talking to the past",
      "Is this me from another dimension?"
    ];
    this.lastPromptTime = 0;
    this.promptInterval = 5000;
    this.currentPrompt = "";
    this.promptOpacity = 0;

    this.reflections = [];
    this.inputBox = null;
    this.submitButton = null;
    this.endButton = null;
    this.showEnding = false;
  }

  activate() {
    if (!this.initializationStarted) {
      this.initializationStarted = true;
      this.initializeVideo();
      this.createInputElements();
      if (!delayedSceneMusic.isPlaying()) {
        delayedSceneMusic.loop();
      }
    }
  }

  initializeVideo() {
    const constraints = {
      video: {
        width: { ideal: 640 },
        height: { ideal: 480 },
        frameRate: { ideal: 24 }
      },
      audio: false
    };
    
    try {
      this.capture = createCapture(constraints, (stream) => {
        this.videoLoaded = true;
        this.frameBuffer = createGraphics(640, 480);
        for (let i = 0; i < this.maxDelay; i++) {
          this.delayedFrames.push(createImage(640, 480));
        }
      });
      this.capture.hide();
    } catch (error) {
      console.error("Error initializing video:", error);
    }
  }

  createInputElements() {
    this.inputBox = createInput('');
    this.inputBox.attribute('placeholder', 'Write your thoughts...');
    this.inputBox.style('width', '300px');
    this.inputBox.style('padding', '8px');
    this.inputBox.style('font-size', '16px');
    this.inputBox.style('border-radius', '4px');
    this.inputBox.style('border', '1px solid rgba(255, 255, 255, 0.2)');
    this.inputBox.style('background', 'rgba(0, 0, 0, 0.5)');
    this.inputBox.style('color', 'white');
    this.inputBox.position(width/2 - 150, height - 100);

    this.submitButton = createButton('Save Thought');
    this.submitButton.style('padding', '8px 16px');
    this.submitButton.style('font-size', '16px');
    this.submitButton.style('border-radius', '4px');
    this.submitButton.style('background', 'rgba(255, 255, 255, 0.2)');
    this.submitButton.style('color', 'white');
    this.submitButton.style('border', 'none');
    this.submitButton.style('cursor', 'pointer');
    this.submitButton.position(width/2 + 160, height - 100);
    this.submitButton.mousePressed(() => this.handleSubmitReflection());
  }

  handleSubmitReflection() {
    const text = this.inputBox.value().trim();
    if (text !== "") {
      this.reflections.push({
        text: text,
        timestamp: Date.now()
      });
      
      this.memories.push(new Memory(text));
      this.inputBox.value('');
      
      if (this.reflections.length >= 3 && !this.endButton) {
        this.createEndButton();
      }
    }
  }

  createEndButton() {
    this.endButton = createButton('End This Journey');
    this.endButton.style('padding', '8px 16px');
    this.endButton.style('font-size', '16px');
    this.endButton.style('border-radius', '4px');
    this.endButton.style('background', 'none');
    this.endButton.style('color', 'rgba(255, 255, 255, 0.7)');
    this.endButton.style('border', '1px solid rgba(255, 255, 255, 0.3)');
    this.endButton.style('cursor', 'pointer');
    this.endButton.position(width/2 - 70, height - 50);
    this.endButton.mousePressed(() => this.triggerEnding());
  }

  display() {
    if (this.showEnding) {
      this.displayEnding();
      return;
    }

    background(0);
    
    if (this.videoLoaded) {
      this.updateVideo();
      this.displayVideo();
    }

    this.updatePrompts();
    this.displayInterface();
    this.updateAndDrawMemories();
  }

  updateVideo() {
    const currentTime = millis();
    if (currentTime - this.lastFrameTime >= this.frameInterval) {
      this.lastFrameTime = currentTime;
      
      try {
        this.frameBuffer.image(this.capture, 0, 0, 640, 480);
        let oldFrame = this.delayedFrames.shift();
        if (oldFrame) {
          oldFrame.copy(this.frameBuffer, 0, 0, 640, 480, 0, 0, 640, 480);
          this.delayedFrames.push(oldFrame);
        }
      } catch (error) {
        console.error('Error updating video:', error);
      }
    }
  }

  displayVideo() {
    if (this.delayedFrames.length > 0) {
      push();
      imageMode(CENTER);
      let scale = min(width / 640, height / 480);
      tint(255, 180);
      image(this.delayedFrames[0], width/2, height/2, 640 * scale, 480 * scale);
      pop();
    }
  }

  updatePrompts() {
    const currentTime = millis();
    if (currentTime - this.lastPromptTime > this.promptInterval) {
      this.currentPrompt = random(this.thoughtPrompts);
      this.promptOpacity = 0;
      this.lastPromptTime = currentTime;
    }
    
    if (this.promptOpacity < 255) {
      this.promptOpacity += 5;
    }
  }

  displayInterface() {
    push();
    textAlign(CENTER, CENTER);
    textSize(28);
    fill(255);
    text("You're watching yourself from 1 second ago", width/2, 30);
    
    if (this.currentPrompt) {
      textSize(24);
      fill(255, this.promptOpacity);
      text(this.currentPrompt, width/2, 80);
    }
    pop();
  }

  updateAndDrawMemories() {
    for (let i = this.memories.length - 1; i >= 0; i--) {
      const memory = this.memories[i];
      if (memory && typeof memory.update === 'function') {
        memory.update();
        memory.display();
        if (!memory.isAlive()) {
          this.memories.splice(i, 1);
        }
      }
    }
  }

  displayEnding() {
    background(0, 10);
    
    push();
    textAlign(CENTER, CENTER);
    textSize(30);
    fill(255);
    text("During this journey through time and space...", width/2, height/3);
    
    let y = height/2;
    this.reflections.forEach((reflection, index) => {
      textSize(28);
      fill(255, map(index, 0, this.reflections.length, 255, 180));
      text(reflection.text, width/2, y + index * 40);
    });
    
    text("Thank you for meeting your past self", width/2, height * 0.8);
    pop();
  }

  triggerEnding() {
    this.showEnding = true;
    this.cleanup();
    
    setTimeout(() => {
      currentScene = scenes.main;
      if (delayedSceneMusic.isPlaying()) {
        delayedSceneMusic.stop();
      }
    }, 5000);
  }

  cleanup() {
    if (this.inputBox) this.inputBox.remove();
    if (this.submitButton) this.submitButton.remove();
    if (this.endButton) this.endButton.remove();
    
    if (this.capture) {
      this.capture.remove();
      this.capture = null;
    }
    
    if (this.frameBuffer) {
      this.frameBuffer.remove();
      this.frameBuffer = null;
    }
    
    this.delayedFrames.forEach(frame => {
      if (frame && frame.remove) frame.remove();
    });
    this.delayedFrames = [];
    
    this.videoLoaded = false;
    this.initializationStarted = false;
  }

  handleResize() {
    if (this.frameBuffer) {
      this.frameBuffer.resizeCanvas(640, 480);
    }
    
    if (this.inputBox) {
      this.inputBox.position(width/2 - 150, height - 100);
    }
    if (this.submitButton) {
      this.submitButton.position(width/2 + 160, height - 100);
    }
    if (this.endButton) {
      this.endButton.position(width/2 - 70, height - 50);
    }
  }

  handleClick() {
    if (!this.showEnding && !this.isClickInInputArea()) {
      this.memories.push(new Memory(random(this.thoughtPrompts)));
    }
  }

  isClickInInputArea() {
    return mouseY > height - 120 && mouseY < height - 20;
  }
}

function keyTyped() {
  if (key === " ") {
    saveCanvas("thumbnail.png");
  }
}
