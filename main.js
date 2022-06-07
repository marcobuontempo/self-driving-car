// Setup canvas to draw car and road in
const carCanvas = document.querySelector("#carCanvas")
carCanvas.width = 200;
const networkCanvas = document.querySelector("#networkCanvas")
networkCanvas.width = 300;

const carCtx = carCanvas.getContext("2d");
const networkCtx = networkCanvas.getContext("2d");

// Create car and road
const road = new Road(carCanvas.width/2, carCanvas.width*0.9);

const N = 1;
const cars = generateCars(N);
let bestCar = cars[0];
if(localStorage.getItem("bestBrain")) {
    for(let i=0; i<cars.length; i++) {
        cars[i].brain = JSON.parse(
            localStorage.getItem("bestBrain"))
        if(i!=0) {
            NeuralNetwork.mutate(cars[i].brain,0.1)
        }
    }
}

// Create traffic
const traffic = [
    new Car(road.getLaneCenter(1),-100,30,50,"DUMMY",2),
    new Car(road.getLaneCenter(0),-300,30,50,"DUMMY",2),
    new Car(road.getLaneCenter(2),-300,30,50,"DUMMY",2),
    new Car(road.getLaneCenter(0),-500,30,50,"DUMMY",2),
    new Car(road.getLaneCenter(1),-500,30,50,"DUMMY",2),
    new Car(road.getLaneCenter(1),-700,30,50,"DUMMY",2),
    new Car(road.getLaneCenter(2),-700,30,50,"DUMMY",2),
]

// Animate canvas
animate();

// saves the best car to local storage
function save() {
    localStorage.setItem("bestBrain",
    JSON.stringify(bestCar.brain))
}

// discards best car from storage
function discard() {
    localStorage.removeItem("bestBrain");
}

// creates N number of AI cars
function generateCars(N) {
    const cars = [];
    for(let i=1; i<=N; i++) {
        cars.push(new Car(road.getLaneCenter(1),100,30,50,"AI"))
    }
    return cars;
}

function animate(time) {
    for(let i=0; i<traffic.length; i++) {
        traffic[i].update(road.borders,[]);
    }

    for(let i=0; i<cars.length; i++) {
        cars[i].update(road.borders,traffic);
    }

    // find best car by finding lowest y value of all cars
    bestCar = cars.find(
        c => c.y==Math.min(
            ...cars.map(c=>c.y)
        )
    )

    carCanvas.height = window.innerHeight; //Ensures canvas is cleared and re-rendered after each animation call
    networkCanvas.height = window.innerHeight;

    carCtx.save();
    carCtx.translate(0, -bestCar.y + carCanvas.height*0.7);

    road.draw(carCtx);
    for(let i=0; i<traffic.length; i++) {
        traffic[i].draw(carCtx, "red");
    }

    carCtx.globalAlpha = 0.2;
    for(let i=0; i<cars.length; i++) {
        cars[i].draw(carCtx, "blue");
    }
    carCtx.globalAlpha = 1;
    bestCar.draw(carCtx, "blue", true) // main car

    carCtx.restore();

    networkCtx.lineDashOffset = -time/50;
    Visualiser.drawNetwork(networkCtx, bestCar.brain);

    requestAnimationFrame(animate);
}