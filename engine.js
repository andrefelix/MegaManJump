// global vars
var canvas, ctx, HEIGHT, WIDTH, frames = 0, maxJumps = 3, currentState, record,
    imgSheet, imgJump, runIndex = 0, sndJump, sndColision, sndDestroyed,

    states = {
        play: 0,
        playing: 1,
        lose: 2
    },

    floor = {
        y: 550,
        x: 0,
        height: 550,

        update: function() {
            if (currentState == states.playing) {
                this.x -= 6;

                if (this.x <= -spriteFloor.width)
                    this.x = 0;
            }
        },

        draw: function() {
            spriteFloor.draw(imgSheet, this.x, this.y);
            spriteFloor.draw(imgSheet, this.x + spriteFloor.width, this.y);
        }
    },

    box = {
        x: 50,
        y: 0,
        width: _spriteRun[0].width,
        height: _spriteRun[0].height,
        gravity: 1.6,
        speed: 0,
        jumpForce: 23.6,
        qntJumps: 0,
        score: 0,
        jumping: false,
        life: 3,
        colision: false,
        rotation: 0,

        update: function() {
            // clear last width and height area of the box
            // brefore the update setings
            ctx.clearRect(this.x, this.y, this.width, this.height);

            this.speed += this.gravity;
            this.y += this.speed;

            if (this.y > floor.y - this.height && currentState != states.lose) {
                this.y = floor.y - this.height;
                this.qntJumps = 0;
                this.speed = 0;
                this.jumping = false;
            }

            if (this.rotation > 0 && this.rotation <= 7)
                this.rotation += Math.PI / 180 * 9;
            else
                this.rotation = 0;

            if (this.jumping) {
                this.width = spriteJump.width;
                this.height = spriteJump.height;
            }
            else if (currentState == states.playing && frames % 5 == 0) {
                runIndex += 1;

                if (runIndex > 3)
                    runIndex = 1;

                this.width = _spriteRun[runIndex].width;
                this.height = _spriteRun[runIndex].height;
            }
        },

        reset: function() {
            this.speed = 0;
            this.y = 0;
            this.width = _spriteRun[0].width;
            this.height = _spriteRun[0].height;
            this.life = 3;
            runIndex = 0;
            this.rotation = 0;

            if (this.score > record) {
                localStorage.setItem("record", this.score);
                record = this.score;
            }

            this.score = 0;
        },

        jump: function() {
            this.jumping = true;

            if (this.qntJumps < maxJumps) {
                this.speed = -this.jumpForce;
                this.qntJumps += 1;
                sndJump.play();
            }
        },

        draw: function() {
            //ctx.fillStyle = this.color;
            //ctx.fillRect(this.x, this.y, this.height, this.width);
            ctx.save();
            ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
            ctx.rotate(this.rotation);
            if (this.jumping)
                spriteJump.draw(imgJump, -this.width / 2, -this.height / 2);
            else
                _spriteRun[runIndex].draw(imgRunning, -this.width / 2, -this.height / 2);
            ctx.restore();
        }
    },

    obstacles = {
        _obs: [],
        _colors: ["#ffbc1c", "#ff1c1c", "#ff85e1", "#52a7ff", "#78ff5d"],
        speed: 6,
        insertTime: 0,
        timer: 50,

        insert: function() {
            // _obs store objects
            this._obs.push({
                x: WIDTH,
                //width: 30 + Math.floor(21 * Math.random()),
                width: 50,
                height: 30 + Math.floor(Math.random() * 121),
                color: this._colors[Math.floor(Math.random() * 5)],
                verifyScore: false,
            });

            this.insertTime = this.timer + Math.floor(Math.random() * 21);
        },

        update: function() {
            if (this.insertTime == 0)
                this.insert();
            else
                this.insertTime -= 1;
            
            for (var i = 0, len = this._obs.length; i < len; i++) {
                var obs = this._obs[i];

                obs.x -= this.speed; 

                if (!box.colision && 
                    box.x < obs.x + obs.width &&
                    box.x + box.width >= obs.x &&
                    box.y + box.height >= floor.y - obs.height)
                {
                    box.colision = true;

                    setTimeout(function() {
                        box.colision = false;
                    }, 500);

                    if (box.life >= 1) {
                        box.life -= 1;
                        box.rotation += Math.PI / 180 * 9;
                        sndColision.play();
                    }
                    else {
                        currentState = states.lose;
                        box.jumping = true;
                        sndDestroyed.play();
                    }

                }
                else if (obs.x <= -obs.width) {
                    this._obs.splice(i, 1);
                    i -= 1;
                    len -= 1;
                }
                else if (obs.x <= 0 && !(obs.verifyScore)) {
                    // when obs.x <= 0, the colision is not possible
                    // then, sum the score var
                    box.score += 1;
                    obs.verifyScore = true;
                }
            }
        },

        clean: function() {
            this._obs = [];
            this.speed = 6;
        },

        draw: function() {
            for (var i = 0, len = this._obs.length; i < len; i++) {
                var obs = this._obs[i];
                ctx.fillStyle = obs.color;
                ctx.fillRect(obs.x, floor.y - obs.height, obs.width, obs.height);
            }
        }
    }
;
// end global vars

function main() {
    HEIGHT = window.innerHeight;
    WIDTH = window.innerWidth;

    if (WIDTH >= 500) {
        WIDTH = 600;
        HEIGHT = 600;
    }

    canvas = document.createElement("canvas");
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
    canvas.style.border = "1px solid #000";

    ctx = canvas.getContext("2d");
    document.body.appendChild(canvas);

    document.addEventListener("mousedown", click);

    document.addEventListener("keydown", keyboard);

    currentState = states.play;
    record = localStorage.getItem("record");

    if (record == null)
        record = 0;

    // paths for images sprites
    imgSheet = new Image();
    imgSheet.src = "images/sheet.png";

    imgJump = new Image();
    imgJump.src = "images/jump.png";

    imgRunning = new Image();
    imgRunning.src = "images/running.png";

    // paths for the sounds
    sndJump = new Audio("sounds/jumping/jump_07.wav");
    sndColision = new Audio("sounds/jumping/jump_04.wav");
    sndDestroyed = new Audio("sounds/lose/destroyed.mp3");

    loop();
}

function keyboard(event) {
    if (event.key == "ArrowUp") {
        if (currentState == states.playing)
            box.jump();
        else if (currentState == states.play)
            currentState = states.playing;
        else if (currentState == states.lose && box.y > 2 * HEIGHT) {
            currentState = states.play;
            obstacles.clean();
            box.reset();
        }
    }
}

function click(event) {
    if (currentState == states.playing)
        box.jump();
    else if (currentState == states.play)
        currentState = states.playing;
    else if (currentState == states.lose && box.y > 2 * HEIGHT) {
        currentState = states.play;
        obstacles.clean();
        box.reset();
    }
}

function loop() {
    update();
    draw();

    window.requestAnimationFrame(loop);
}

function update() {
    frames += 1;

    if (currentState == states.playing)
        obstacles.update();
    
    box.update();
    floor.update();
}

function draw() {
    // draw background color
    //ctx.fillStyle = "#50daff";
    //ctx.fillRect(0, 0, WIDTH, HEIGHT);
    spriteBg.draw(imgSheet, 0, 0);
    floor.draw();
    box.draw();

    // draw score
    ctx.fillStyle = "#fff";
    ctx.font = "50px Arial";
    ctx.fillText(box.score, 30, 60);
    ctx.fillText(box.life, 540, 60);

    // the mega-man is stoped
    if (currentState == states.play) {
        //ctx.fillStyle = "green";
        //ctx.fillRect(WIDTH / 2 - 50, HEIGHT / 2 - 50, 100, 100);
        spritePlay.draw(imgSheet, WIDTH / 2 - spritePlay.width / 2,
                        HEIGHT / 2 - spritePlay.height / 2);
    }
    else if (currentState == states.lose) {
        //ctx.fillStyle = "red";
        //ctx.fillRect(WIDTH / 2 - 50, HEIGHT / 2 - 50, 100, 100);
        spriteLose.draw(imgSheet, WIDTH / 2 - spriteLose.width / 2,
                        HEIGHT / 2 - spriteLose.height /2 - spriteRecord.height / 2);
        
        spriteRecord.draw(imgSheet, WIDTH / 2 - spriteRecord.width / 2,
                          HEIGHT / 2 + spriteLose.height / 2 - spriteRecord.height / 2
                          - 25); // -25 only for inner the images

        ctx.fillStyle = "#fff";

        // draw text in center of the frame
        /*ctx.save();
        ctx.translate(WIDTH / 2, HEIGHT/ 2);
        ctx.fillStyle = "#fff";
        var widthScore = ctx.measureText(box.score).width / 2;
        var widthRecord = ctx.measureText(record).width / 2;
        */

        if (box.score > record) {
            //var widthText = ctx.measureText("New Record!").width / 2;
            //ctx.fillText("New Record!", -widthText, -65);
            spriteNew.draw(imgSheet, WIDTH / 2 - 180, HEIGHT / 2 + 30);
            ctx.fillText(box.score, 420, 470);
        }
        else {
            //var text = "Record " + record;
            //var widthText = ctx.measureText(text).width / 2;
            //ctx.fillText(text, -widthText, -65);
            ctx.fillText(box.score, 375, 390);
            ctx.fillText(record, 420, 470);
        }

        //ctx.fillText(box.score, -widthScore, 19);
        //ctx.restore();
    }
    // the mega-man is running
    else if (currentState == states.playing)
        obstacles.draw();
}

// inicialize the game
main();
