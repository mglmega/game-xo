window.addEventListener("load", function () {
  const startBtn = document.getElementById("startBtn");

  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const collisionCanvas = document.getElementById("collision");
  const collisionCtx = collisionCanvas.getContext("2d");
  collisionCanvas.width = window.innerWidth;
  collisionCanvas.height = window.innerHeight;

  ctx.font = "24px Arial";

  const gameOverImage = document.getElementById("gameoverImg");
  const gameOverSound = document.getElementById("eviljestAudio");
  const winnerSound = document.getElementById("welldoneAudio");

  let lives,
    totalMg,
    maxMgDisplay,
    mgs,
    timeToNextMg,
    mgInterval,
    lastTime,
    gameOver,
    explosions;

  function startScreen() {
    lives = 3;
    totalMg = 100;
    maxMgDisplay = 1;
    mgs = [];

    timeToNextMg = 0;
    mgInterval = 500;
    lastTime = 0;
    gameOver = false;

    explosions = [];

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    collisionCtx.clearRect(0, 0, canvas.width, canvas.height);

    startBtn.style.display = "block";
  }

  class Mg {
    constructor(markSenser = false) {
      this.spriteWidth = 220;
      this.spriteHeight = 320;

      this.sizeModifier = markSenser ? 0.3 : Math.random() * 0.6 + 0.4;
      this.width = this.spriteWidth * this.sizeModifier;
      this.height = this.spriteHeight * this.sizeModifier;
      this.x = canvas.width;
      this.y = Math.random() * (canvas.height - this.height);
      this.directionX = Math.random() * 5 + 3;
      this.directionY = Math.random() * 5 - 2.5;
      this.markDeletion = false;
      this.randomColor = [
        Math.floor(Math.random() * 255),
        Math.floor(Math.random() * 255),
        Math.floor(Math.random() * 255),
      ];
      this.color = `rgb(${this.randomColor[0]},${this.randomColor[1]},${this.randomColor[2]})`;

      this.image = document.getElementById("mgImg");
      this.frame = 0;
      this.maxFrame = 5;

      this.timeSinceLastFrame = 0;
      this.frameInterval = 50;

      this.markSenser = markSenser;
      // this.markSenser = true;
    }

    update(deltaTime) {
      this.timeSinceLastFrame += deltaTime;

      if (this.timeSinceLastFrame > this.frameInterval) {
        if (this.frame >= this.maxFrame) this.frame = 0;
        else this.frame++;
        this.timeSinceLastFrame = 0;
      }

      if (this.y < 0 || canvas.height < this.y + this.height) {
        this.directionY = this.directionY * -1;
      }

      this.x -= this.directionX;
      this.y += this.directionY;

      // if (this.markSenser) {
      //   canvas.addEventListener("mouseover", (e) => {
      //     // console.log(e);
      //     if (
      //       e.offsetX >= this.x &&
      //       e.offsetX <= this.x + this.width &&
      //       e.offsetY >= this.y &&
      //       e.offsetY <= this.y + this.height
      //     ) {
      //       console.log(e);
      //     }
      //   });
      // }

      if (this.x + this.width < 0) {
        this.markDeletion = true;
        lives--;

        if (lives === 0) gameOver = true;
      }
    }

    draw() {
      collisionCtx.fillStyle = this.color;
      collisionCtx.fillRect(this.x, this.y, this.width, this.height);

      ctx.drawImage(
        this.image,
        this.frame * this.spriteWidth,
        0,
        this.spriteWidth,
        this.spriteHeight,
        this.x,
        this.y,
        this.width,
        this.height
      );
    }
  }

  class Explosion {
    constructor(x, y, size) {
      this.image = document.getElementById("boomImg");
      this.spriteWidth = 200;
      this.spriteHeight = 179;
      this.size = size;
      this.x = x;
      this.y = y;
      this.frame = 0;
      this.sound = document.getElementById("zombieAudio");
      this.timeSinceLastFrame = 0;
      this.frameInterval = 200;
      this.markDeletion = false;
    }

    update(deltaTime) {
      if (this.frame === 0) this.sound.play();

      this.timeSinceLastFrame += deltaTime;

      if (this.timeSinceLastFrame > this.frameInterval) {
        this.frame++;
        this.timeSinceLastFrame = 0;
        if (this.frame > 5) this.markDeletion = true;
      }
    }
    draw() {
      ctx.drawImage(
        this.image,
        this.frame * this.spriteWidth,
        0,
        this.spriteWidth,
        this.spriteHeight,
        this.x,
        this.y,
        this.size,
        this.size
      );
    }
  }

  function drawMgLeft() {
    ctx.textAlign = "left";
    ctx.fillStyle = "black";
    ctx.fillText(`Үлдсэн : ${totalMg}`, 50, 75);
    ctx.fillStyle = "white";
    ctx.fillText(`Үлдсэн : ${totalMg}`, 48, 73);
  }

  function drawLives() {
    const heartImg = document.getElementById("heartImg");

    const sizeModifier = 3;
    const imgWidth = 106 / sizeModifier;
    const imgHeight = 100 / sizeModifier;
    const gap = 3;

    let startX = 50;

    for (i = lives; i > 0; i--) {
      ctx.drawImage(
        heartImg,
        startX,
        canvas.height - imgHeight - 20,
        imgWidth,
        imgHeight
      );
      startX += imgWidth + gap;
    }
  }

  window.addEventListener("click", function (e) {
    const detectPixelColor = collisionCtx.getImageData(e.x, e.y, 3, 3);
    const pc = detectPixelColor.data;

    mgs.forEach((object) => {
      if (
        object.randomColor[0] === pc[0] &&
        object.randomColor[1] === pc[1] &&
        object.randomColor[2] === pc[2]
      ) {
        if (object.markSenser) {
          if (object.directionY < 0) {
            if (object.height + 50 < e.y) {
              object.y = e.y - object.height - 30;
            } else {
              object.y = e.y + 30;
              object.directionY *= -1;
            }
          } else {
            if (canvas.height > e.y + object.height + 50) {
              object.y = e.y + 30;
            } else {
              object.directionY *= -1;
              object.y = e.y - object.height - 30;
            }
          }
        } else {
          object.markDeletion = true;
          explosions.push(new Explosion(object.x, object.y, object.width));
        }
      }
    });
  });

  startBtn.addEventListener("click", (e) => {
    e.target.style.display = "none";
    gameLoop(0);
  });

  function gameLoop(timeStamp) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    collisionCtx.clearRect(0, 0, canvas.width, canvas.height);

    let deltaTime = timeStamp - lastTime;
    lastTime = timeStamp;

    timeToNextMg += deltaTime;

    // dispaly max count tulsan ued interval 0
    if (maxMgDisplay === mgs.length) mgInterval = 0;

    if (timeToNextMg > mgInterval && maxMgDisplay > mgs.length && totalMg > 0) {
      mgs.push(new Mg(totalMg <= lives));
      timeToNextMg = 0;
      totalMg--;
      mgs.sort((a, b) => a.width - b.width);
    }

    if (totalMg % 10 === 0) {
      maxMgDisplay += 1;
    }

    drawMgLeft();
    drawLives();

    [...mgs, ...explosions].forEach((object) => object.update(deltaTime));
    [...mgs, ...explosions].forEach((object) => object.draw());
    mgs = mgs.filter((object) => !object.markDeletion);
    explosions = explosions.filter((object) => !object.markDeletion);

    if (!mgs.length && totalMg === 0) {
      gameOver = true;
    }

    if (!gameOver) {
      requestAnimationFrame(gameLoop);
    } else {
      drawGameOver();
    }
  }

  function drawGameOver() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    collisionCtx.clearRect(0, 0, canvas.width, canvas.height);

    if (lives <= 0) {
      gameOverSound.play();

      ctx.drawImage(
        gameOverImage,
        (canvas.width - 354) / 2,
        (canvas.height - 500) / 2,
        354,
        500
      );
    } else {
      winnerSound.play();
      ctx.font = "48px Arial";
      ctx.textAlign = "center";
      ctx.fillStyle = "black";
      ctx.fillText("Сайн юмаа. Та яллаа.", canvas.width / 2, canvas.height / 2);

      ctx.fillStyle = "white";
      ctx.fillText(
        "Сайн юмаа. Та яллаа.",
        canvas.width / 2 - 3,
        canvas.height / 2 - 3
      );
    }

    setTimeout(startScreen, 8000);
  }

  startScreen();
});
