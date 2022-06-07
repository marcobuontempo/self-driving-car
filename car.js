class Car {
    constructor(x,y,width,height) {
        this.x = x; // x position
        this.y = y; // y position
        this.width = width; // car width
        this.height = height; // car height

        this.speed = 0; // current speed of car
        this.acceleration = 0.2; // acceleration value (i.e. change car speed by 0.2 with each key press)
        this.maxSpeed = 3; // cap the max speed
        this.friction = 0.05; // friction to slow down car

        this.angle = 0; // angle of the car

        this.sensor = new Sensor(this);

        this.controls = new Controls(); // u/d/l/r key inputs
    }

    // update the car's state
    update(roadBorders) {
        this.#move();
        this.sensor.update(roadBorders);
    }

    // logic for car's movement
    #move() {
        // accelerate car on u/d key press
        if(this.controls.forward) {
            this.speed += this.acceleration;
        }
        if(this.controls.reverse) {
            this.speed -= this.acceleration;
        }

        // turn car on l/r key press

        if(this.speed != 0) {
            const flip = this.speed>0 ? 1 : -1; // to ensure correct direction when reversing
            if(this.controls.left) {
                this.angle += 0.03 * flip;
            }
            if(this.controls.right) {
                this.angle -= 0.03 * flip;
            }
        }

        // capped max speed (reverse max speed is halved, as it should reverse slower)
        // nb. negative speed just refers to the direction
        if(this.speed > this.maxSpeed) {
            this.speed = this.maxSpeed;
        }
        if(this.speed < -this.maxSpeed/2) {
            this.speed = -this.maxSpeed/2;
        }

        // adjust speed for friction
        if(this.speed > 0) {
            this.speed -= this.friction;
        }
        if(this.speed < 0) {
            this.speed += this.friction;
        }
        // stop moving car if speed is less than friction (and therefore friction should have no effect)
        if(Math.abs(this.speed) < this.friction) {
            this.speed = 0;
        }

        // update car
        // nb. the window takes negative values as moving up, hence -= and not +=
        // & a unit circle is used to help calculate the movements of the car
        this.x -= Math.sin(this.angle)*this.speed;
        this.y -= Math.cos(this.angle)*this.speed;
    }

    // draw rectangle of car and sensors
    draw(ctx) {
        ctx.save();
        ctx.translate(this.x,this.y);
        ctx.rotate(-this.angle);
        
        ctx.beginPath();
        ctx.rect(
            -this.width/2,
            -this.height/2,
            this.width,
            this.height
        )
        ctx.fill();

        ctx.restore();
        
        this.sensor.draw(ctx);
    }
}