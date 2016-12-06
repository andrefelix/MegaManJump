function sprite(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;

    this.draw = function(img, xCanvas, yCanvas) {
        ctx.drawImage(img, this.x, this.y, this.width, this.height,
                      xCanvas, yCanvas, this.width, this.height);
    }
}

// srpites from the image sheet.png
var spriteBg = new sprite(0, 0, 600, 600),
    spriteBall = new sprite(618, 16, 87, 87),
    spriteLose = new sprite(603, 478, 397, 358),
    spritePlay = new sprite(603, 127, 397, 347),
    spriteNew = new sprite(68, 721, 287, 93),
    spriteRecord = new sprite(28, 879, 441, 95),
    spriteFloor = new sprite(0, 604, 600, 54);

// sprites from the image jump.png
var spriteJump = new sprite(0, 0, 50, 54);

// sprites from the image running.png
var _spriteRun = [];
    _spriteRun[0] = new sprite(0, 0, 45, 54);
    _spriteRun[1] = new sprite(52, 0, 55, 54);
    _spriteRun[2] = new sprite(113, 0, 34, 54);
    _spriteRun[3] = new sprite(148, 0, 48, 54);
