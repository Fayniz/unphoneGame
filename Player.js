export default class Player {
  WALK_ANIMATION_TIMER = 200;
  walkAnimationTimer = this.WALK_ANIMATION_TIMER;

  jumpPressed = false;
  jumpInProgress = false;
  falling = false;
  JUMP_SPEED = 0.6;
  GRAVITY = 0.4;

  constructor(ctx, width, height, minJumpHeight, maxJumpHeight, scaleRatio, x, runImagePaths) {
    this.ctx = ctx;
    this.canvas = ctx.canvas;
    this.width = width;
    this.height = height;
    this.minJumpHeight = minJumpHeight;
    this.maxJumpHeight = maxJumpHeight;
    this.scaleRatio = scaleRatio;

    this.x = x;
    this.y = this.canvas.height - this.height - 1.5 * this.scaleRatio;
    this.yStandingPosition = this.y;

    this.standingStillImage = new Image();
    this.standingStillImage.src = "images/standing_still.png";
    this.image = this.standingStillImage;

    this.dinoRunImages = runImagePaths.map(src => {
      const img = new Image();
      img.src = src;
      return img;
    });

    this.currentRunImage = 0;
  }

  update(frameTimeDelta) {
    if (this.jumpPressed && !this.jumpInProgress) {
      this.jumpInProgress = true;
      this.jumpStartY = this.y;
      this.jumpVelocity = this.JUMP_SPEED * this.scaleRatio;
    }

    if (this.jumpInProgress) {
      this.y -= this.jumpVelocity;
      this.jumpVelocity -= this.GRAVITY * this.scaleRatio;

      if (this.y > this.yStandingPosition) {
        this.y = this.yStandingPosition;
        this.jumpInProgress = false;
        this.jumpVelocity = 0;
      }
    }

    this.walkAnimationTimer -= frameTimeDelta;
    if (this.walkAnimationTimer <= 0) {
      this.walkAnimationTimer = this.WALK_ANIMATION_TIMER;
      this.currentRunImage = (this.currentRunImage + 1) % this.dinoRunImages.length;
    }

    this.jumpPressed = false;
  }

  draw() {
    const imageToDraw = this.jumpInProgress ? this.standingStillImage : this.dinoRunImages[this.currentRunImage];
    this.ctx.drawImage(imageToDraw, this.x, this.y, this.width, this.height);
  }
}