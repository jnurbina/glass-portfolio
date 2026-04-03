const GRAVITY = 1.0; // snappier fall

function mod(n: number, m: number): number {
  return ((n % m) + m) % m;
}

export interface SpriteConfig {
  context: CanvasRenderingContext2D;
  image: HTMLImageElement;
  position: { x: number; y: number };
  scale?: number;
  framesMax?: number;
  offset?: { x: number; y: number };
  direction?: 'left' | 'right';
  noRepeat?: boolean;
  flipOffsetX?: number; // source-pixel offset to compensate for asymmetric sprite frames when flipped
}

export class Sprite {
  context: CanvasRenderingContext2D;
  image: HTMLImageElement;
  position: { x: number; y: number };
  scale: number;
  framesMax: number;
  framesCurrent: number;
  framesElapsed: number;
  framesHold: number;
  offset: { x: number; y: number };
  direction: 'left' | 'right';
  noRepeat: boolean;
  flipOffsetX: number;
  width: number;
  height: number;
  patternCanvas: HTMLCanvasElement | null;

  constructor({
    context,
    image,
    position,
    scale = 1,
    framesMax = 1,
    offset = { x: 0, y: 0 },
    direction = 'right',
    noRepeat = true,
    flipOffsetX = 0,
  }: SpriteConfig) {
    this.context = context;
    this.image = image;
    this.position = position;
    this.scale = scale;
    this.framesMax = framesMax;
    this.framesCurrent = 0;
    this.framesElapsed = 0;
    this.framesHold = 5; // fast animation for smooth sprite movement
    this.offset = offset;
    this.direction = direction;
    this.noRepeat = noRepeat;
    this.flipOffsetX = flipOffsetX;
    this.width = image.width;
    this.height = image.height;
    this.patternCanvas = null;

    if (!this.noRepeat) {
      this.createPatternCanvas();
    }
  }

  createPatternCanvas() {
    this.patternCanvas = document.createElement('canvas');
    const drawWidth = (this.width / this.framesMax) * this.scale;
    const repeatX = Math.ceil(this.context.canvas.width / drawWidth) * 2;
    this.patternCanvas.width = this.image.width * repeatX;
    this.patternCanvas.height = this.image.height;
    const patternContext = this.patternCanvas.getContext('2d')!;

    for (let i = 0; i < repeatX; i++) {
      patternContext.drawImage(
        this.image,
        0,
        0,
        this.image.width,
        this.image.height,
        i * this.image.width,
        0,
        this.image.width,
        this.image.height
      );
    }
  }

  draw() {
    const frameWidth = this.image.width / this.framesMax;
    const frameHeight = this.image.height;
    const drawWidth = (this.width / this.framesMax) * this.scale;
    const drawHeight = this.height * this.scale;

    if (this.direction === 'left') {
      this.context.save();
      // Flip: mirror the frame, then shift by flipOffsetX to compensate for asymmetric padding
      const dx = this.position.x - this.offset.x;
      const dy = this.position.y - this.offset.y;
      const flipCompensation = this.flipOffsetX * this.scale;
      this.context.translate(dx + drawWidth - flipCompensation, 0);
      this.context.scale(-1, 1);
      this.context.drawImage(
        this.image,
        this.framesCurrent * frameWidth,
        0,
        frameWidth,
        frameHeight,
        0,
        dy,
        drawWidth,
        drawHeight
      );
      this.context.restore();
    } else if (!this.noRepeat && this.patternCanvas) {
      const drawX = mod(-this.position.x, this.image.width);
      this.context.drawImage(
        this.patternCanvas,
        drawX,
        0,
        this.patternCanvas.width,
        this.patternCanvas.height,
        0,
        this.position.y,
        this.patternCanvas.width * this.scale,
        this.patternCanvas.height * this.scale
      );
    } else {
      this.context.drawImage(
        this.image,
        this.framesCurrent * frameWidth,
        0,
        frameWidth,
        frameHeight,
        this.position.x - this.offset.x,
        this.position.y - this.offset.y,
        drawWidth,
        drawHeight
      );
    }
  }

  animateFrames() {
    this.framesElapsed++;
    if (this.framesElapsed % this.framesHold === 0) {
      this.framesCurrent =
        this.framesCurrent < this.framesMax - 1
          ? this.framesCurrent + 1
          : 0;
    }
  }

  update() {
    this.draw();
    this.animateFrames();
  }
}

export interface SpriteSet {
  img: HTMLImageElement;
  framesMax: number;
}

export interface AvatarConfig extends SpriteConfig {
  velocity: { x: number; y: number };
  sprites: { idle: SpriteSet; walk: SpriteSet };
}

export class Avatar extends Sprite {
  velocity: { x: number; y: number };
  lastKey: string | null;
  sprites: { idle: SpriteSet; walk: SpriteSet };

  constructor(config: AvatarConfig) {
    super(config);
    this.velocity = config.velocity;
    this.lastKey = null;
    this.sprites = config.sprites;
  }

  update() {
    this.draw();
    this.animateFrames();
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;

    // Gravity — ground at canvas height minus small margin for the street
    const groundLevel = this.context.canvas.height - 17;
    if (this.position.y + this.height + this.velocity.y >= groundLevel) {
      this.velocity.y = 0;
      this.position.y = groundLevel - this.height;
    } else {
      this.velocity.y += GRAVITY;
    }
  }

  switchSprite(sprite: 'idle' | 'walk' | 'jump') {
    const target =
      sprite === 'walk' ? this.sprites.walk : this.sprites.idle;
    if (this.image !== target.img) {
      this.image = target.img;
      this.width = target.img.width;
      this.framesMax = target.framesMax;
      this.framesCurrent = 0;
    }
  }
}
