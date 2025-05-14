export default class Ground {
  constructor(ctx, width, height, speed, scaleRatio) {
    this.ctx = ctx;
    this.canvas = ctx.canvas;
    this.width = width;
    this.height = height;
    this.speed = speed;
    this.scaleRatio = scaleRatio;

    this.x = 0;
    this.y = this.canvas.height - this.height - 1; // patch: prevent clipping off bottom

    this.groundImage = new Image();
    this.groundImage.src = "images/ground.png";
    this.imageLoaded = false;
    this.groundImage.onload = () => {
      this.imageLoaded = true;
    };

    // fallback debug color fill if image not loading
    this.debugFallback = false;
  }

  update(gameSpeed, frameTimeDelta) {
    this.x -= gameSpeed * frameTimeDelta * this.speed * this.scaleRatio;
    if (this.x < -this.width) {
      this.x = 0;
    }
  }

  draw() {
    if (this.imageLoaded) {
      this.ctx.drawImage(this.groundImage, this.x, this.y, this.width, this.height);
      this.ctx.drawImage(this.groundImage, this.x + this.width, this.y, this.width, this.height);
    } else if (this.debugFallback) {
      this.ctx.fillStyle = "#888";
      this.ctx.fillRect(this.x, this.y, this.width, this.height);
      this.ctx.fillRect(this.x + this.width, this.y, this.width, this.height);
    }
  }

  reset() {
    this.x = 0;
  }
}
