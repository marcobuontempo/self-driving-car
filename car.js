class Car {
    constructor(x,y,width,height,controlType,maxSpeed=3) {
        this.x = x; // x position
        this.y = y; // y position
        this.width = width; // car width
        this.height = height; // car height

        this.speed = 0; // current speed of car
        this.acceleration = 0.2; // acceleration value (i.e. change car speed by 0.2 with each key press)
        this.maxSpeed = maxSpeed; // cap the max speed
        this.friction = 0.05; // friction to slow down car
        this.angle = 0; // angle of the car
        this.damaged = false; // whether car is damaged

        this.useBrain = controlType=="AI";

        if(controlType!="DUMMY") {
            this.sensor = new Sensor(this); // car sensors
            this.brain = new NeuralNetwork(
                [this.sensor.rayCount,6,4]
            );
        }
        this.controls = new Controls(controlType); // u/d/l/r key inputs
    }

    // check whether car is damaged
    #assessDamage(roadBorders,traffic) {
        for(let i=0; i<roadBorders.length; i++) {
            if(polyIntersect(this.polygon, roadBorders[i])) {
                return true;
            }
        }
        for(let i=0; i<traffic.length; i++) {
            if(polyIntersect(this.polygon, traffic[i].polygon)) {
                return true;
            }
        }
        return false;
    }

    // get corner points of car
    #createPolygon() {
        const points = [];
        const rad = Math.hypot(this.width,this.height)/2;
        const alpha = Math.atan2(this.width,this.height);
        points.push({
            x: this.x-Math.sin(this.angle-alpha)*rad,
            y: this.y-Math.cos(this.angle-alpha)*rad,
        });
        points.push({
            x: this.x-Math.sin(this.angle+alpha)*rad,
            y: this.y-Math.cos(this.angle+alpha)*rad,
        });
        points.push({
            x: this.x-Math.sin(Math.PI+this.angle-alpha)*rad,
            y: this.y-Math.cos(Math.PI+this.angle-alpha)*rad,
        });
        points.push({
            x: this.x-Math.sin(Math.PI+this.angle+alpha)*rad,
            y: this.y-Math.cos(Math.PI+this.angle+alpha)*rad,
        });
        return points;
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

    // update the car's state
    update(roadBorders,traffic) {
        if(!this.damaged) {
            this.#move();
            this.polygon=this.#createPolygon();
            this.damaged = this.#assessDamage(roadBorders,traffic);
        }
        if(this.sensor) {
            this.sensor.update(roadBorders,traffic);
            const offsets = this.sensor.readings.map(
                s => s==null?0:1-s.offset
            );
            const outputs = NeuralNetwork.feedForward(offsets, this.brain)

            if(this.useBrain) {
                this.controls.forward = outputs[0];
                this.controls.left = outputs[1];
                this.controls.right = outputs[2];
                this.controls.reverse = outputs[3];
            }
        }
    }

    // draw rectangle of car and sensors
    draw(ctx, colour, drawSensor=false) {
        if(this.damaged) {
            ctx.fillStyle = "grey";
        } else {
            ctx.fillStyle = colour;
        }

        ctx.beginPath();
        ctx.moveTo(this.polygon[0].x, this.polygon[0].y);
        for(let i=1; i<this.polygon.length; i++) {
            ctx.lineTo(this.polygon[i].x, this.polygon[i].y)
        }
        ctx.fill();
        
        if(this.sensor && drawSensor) {
            this.sensor.draw(ctx);
        }
    }
}