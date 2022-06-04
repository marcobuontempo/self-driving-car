// Setup canvas to draw car and road in
const canvas = document.querySelector("#myCanvas")
canvas.width = 200;

// Create car object
const road = new Road(canvas.width/2, canvas.width*0.9);
const car = new Car(road.getLaneCenter(1),100,30,50);

// Draw canvas
const ctx = canvas.getContext("2d");
car.draw(ctx);

// Animate canvas
animate();

function animate() {
    car.update();
    canvas.height = window.innerHeight; //Ensures canvas is cleared and re-rendered after each animation call

    ctx.save();
    ctx.translate(0, -car.y + canvas.height*0.7);

    road.draw(ctx);
    car.draw(ctx);

    ctx.restore();
    requestAnimationFrame(animate);
}