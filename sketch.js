var vehicles = [];
var vehiclesAmount = 10;
var food = [];
var poison = [];
var foodPieces = 40;
var poisonPieces = 20;

var timer;
var nextTimer = 0;
var longevityRecord = 0;
var godMode = false;

var boundariesLimit = 25; // boundaries limit within the canvas borders
var generationCount = 0; // keep track of generations

var debug = false;

function setup() {
  createCanvas(windowWidth, windowHeight);

  for (var i = 0; i < vehiclesAmount; i++) {
    vehicles[i] = new Vehicle(random(boundariesLimit * 2, width - boundariesLimit * 2), random(boundariesLimit * 2, height - boundariesLimit * 2));
  }
  for (var i = 0; i < foodPieces; i++) {
    food.push(createVector(random(width), random(height)));
  }
  for (var i = 0; i < poisonPieces; i++) {
    poison.push(createVector(random(width), random(height)));
  }
  generationCount += 1;
  console.log("Generation: " + generationCount);
}

function draw() {
  background(51);
  timer = round(millis() / 1000) - nextTimer;
  if (!godMode) {
    if (random(1) < 0.10) { //  10% probability to drop more food
      food.push(createVector(random(width), random(height)));
    }

    if (random(1) < 0.01) { //  1% probability to drop more poison
      poison.push(createVector(random(width), random(height)));
    }
  }

  for (var i = 0; i < food.length; i++) {
    noStroke();
    fill(0, 255, 0);
    ellipse(food[i].x, food[i].y, 6, 6);
  }

  for (var i = 0; i < poison.length; i++) {
    noStroke();
    fill(255, 0, 0);
    ellipse(poison[i].x, poison[i].y, 6, 6);
  }

  for (var i = vehicles.length - 1; i >= 0; i--) {
    vehicles[i].applyBehaviors(food, poison);
    vehicles[i].boundaries();
    vehicles[i].update();
    vehicles[i].show();

    var newVehicle = vehicles[i].clone();
    if (newVehicle != null) {
      vehicles.push(newVehicle);
    }

    if (vehicles[i].isdead()) {
      if (vehicles.length <= 1) {
        regenerate(vehicles[i]);
      }
      food.push(createVector(vehicles[i].position.x, vehicles[i].position.y));
      vehicles.splice(i, 1);
    }
  }
  fill(255, 100);
  text("Press CTRL to toggle debug on/off - MousePress to add new vehicles", 10, 30);
  if (!godMode) {
    fill(255, 100);
    text("Press ALT to enter 'god mode'" , 10, 50);
  } else {
    fill(255, 255);
    text("MousePress + 'F' to add food - MousePress + 'P' to add poison. Press ALT to exit 'god mode'", 10, 50);
  }
  fill(255, 255);
  text("Generation: " + generationCount, 10, 70);
  text("Longevity score: " + timer, 10, 90);
  if (generationCount > 1) {
    fill(255, 100)
    text("Longevity record: " + longevityRecord, 10, 110);
  }
}

function mousePressed() {
  if (godMode && keyIsPressed === true && key === 'f') { // f
    food.push(createVector(mouseX, mouseY));
    console.log("Adding food");
  } else if (godMode && keyIsPressed === true && key === 'p') { // p
    poison.push(createVector(mouseX, mouseY));
    console.log("Adding poison");
  } else {
    vehicles.push(new Vehicle(mouseX, mouseY));
  }
}

function keyPressed() {
  if (keyCode == CONTROL) {
    debug = !debug;
    console.log(debug);
  } else if (keyCode == ALT) {
    godMode = !godMode;
    console.log(godMode);
  }
}

function regenerate(champion) {
  console.log("Repopulating");
  var newRecord = timer;
  if (newRecord > longevityRecord) {
    longevityRecord = timer;
  }
  nextTimer += timer;
  for (n = 0; n < vehiclesAmount; n++) {
    vehicles.push(champion.repopulate());
  }
  /* // Reset all poison/food pieces positions
  console.log("resetting");
  food.splice(0, food.length-1);
  poison.splice(0, poison.length-1);
  for (var i = 0; i < foodPieces; i++) {
    food.push(createVector(random(width), random(height)));
  }
  for (var i = 0; i < poisonPieces; i++) {
    poison.push(createVector(random(width), random(height)));
  }
  */
  generationCount += 1;
  console.log("Generation: " + generationCount);
};

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
};