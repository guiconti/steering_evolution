// Vehicle class
var mutationRate = 0.1; // arbitrary mutation rate // 10% chance of mutation

function Vehicle(x, y, dna) {
  this.acceleration = createVector(0, 0);
  this.velocity = createVector(0, -2);
  this.position = createVector(x, y);
  this.size = 4;
  this.maxspeed = 5;
  this.maxForce = 0.5;

  this.health = 1.0;

  this.dna = [];
  if (dna === undefined) {
    this.dna.foodWeight = random(-2, 2);
    this.dna.poisonWeight = random(-2, 2);
    this.dna.foodPerception = random(10, 100);
    this.dna.poisonPerception = random(10, 100);
  } else {
    //  Rewrite this in a more descritive way
    this.dna.foodWeight = dna.foodWeight + random(-0.2, 0.2);
    this.dna.poisonWeight = dna.poisonWeight + random(-0.2, 0.2);
    this.dna.foodPerception = constrain(dna.foodPerception + random(-10, 10), 0, 100);
    this.dna.poisonPerception = constrain(dna.poisonPerception + random(-10, 10), 0, 100);
  }

  // Method to update location
  this.update = function() {
    // Update velocity
    this.velocity.add(this.acceleration);
    this.velocity.limit(this.maxspeed);
    this.position.add(this.velocity);
    // Reset acceleration to 0 each cycle
    this.acceleration.mult(0);

    // Slowly dies
    this.health -= 0.002;
  };

  // A function to handle multiple beaviors
  this.applyBehaviors = function(good, bad) {
    var steerG = this.eat(good, 0.06, this.dna.foodPerception);
    var steerB = this.eat(bad, -0.5, this.dna.poisonPerception);

    //  Weightning forces based on vehicle's DNA
    steerG.mult(this.dna.foodWeight);
    steerB.mult(this.dna.poisonWeight);

    this.applyForce(steerG);
    this.applyForce(steerB);
  }

  this.applyForce = function(force) {
    // We could add mass here if we want A = F / M
    this.acceleration.add(force);
  };

  this.clone = function() {
    var r = random(1);
    if (r < 0.001 && this.health > 0.5) { //chaches for a vehicle to reproduce itself are determined by probability and health status
      return new Vehicle(this.position.x, this.position.y, this.dna);
    } else {
      return null;
    }
  }

  this.repopulate = function() {
      return new Vehicle(random(boundariesLimit * 2, width - boundariesLimit * 2), random(boundariesLimit * 2, height - boundariesLimit * 2), this.dna);
  }

  // A method that calculates a steering force towards a target
  // STEER = DESIRED MINUS VELOCITY
  this.seek = function(target) {
    var desired = p5.Vector.sub(target, this.position); // A vector pointing from this object's position to the target
    // Scale to maximum speed
    desired.setMag(this.maxspeed);
    // Steering = Desired minus velocity
    var steer = p5.Vector.sub(desired, this.velocity);
    steer.limit(this.maxForce); // Limit to maximum steering force
;
    return steer;
  };

  // STEER = DESIRED MINUS VELOCITY
  this.eat = function(list, reward, perception) { 
    var record = Infinity;
    var closest = null;
    for (var i = list.length - 1; i >= 0; i--) {
      var distance = p5.Vector.dist(list[i], this.position); // going through all the food pieces finding our which one is the closest one
      if (distance < this.maxspeed) { // this.maxspeed = 5; I use maxspeed correspondent value to prevent vehicle "jumping" the food/poison piece
        list.splice(i, 1);
        this.health += reward;
      } else if (distance < record && distance < perception) {
        record = distance;
        closest = list[i];
      }
    }
    if (closest != null) {
      return this.seek(closest); // will also exit the function
    }
    return createVector(0, 0);
  };

  // a function to determine is a vehicle is dead
  this.isdead = function() {
    return (this.health < 0);
  }

  /// utility methods
  this.boundaries = function() {
    var desired = null;

    if (this.position.x < boundariesLimit) {
      desired = createVector(this.maxspeed, this.velocity.y);
    } else if (this.position.x > width - boundariesLimit) {
      desired = createVector(-this.maxspeed, this.velocity.y);
    }
    if (this.position.y < boundariesLimit) {
      desired = createVector(this.velocity.x, this.maxspeed);
    } else if (this.position.y > height - boundariesLimit) {
      desired = createVector(this.velocity.x, -this.maxspeed);
    }
    if (desired !== null) {
      desired.normalize();
      desired.mult(this.maxspeed);
      var steer = p5.Vector.sub(desired, this.velocity);
      steer.limit(this.maxForce);
      this.applyForce(steer);
    }
  };

  this.show = function() {
    // Draw a triangle rotated in the direction of velocity
    var angle = this.velocity.heading() + PI / 2; // https://p5js.org/reference/#/p5.Vector/heading

    // Color based on health
    var green = color(0, 255, 0);
    var red = color(255, 0, 0);
    var col = lerpColor(red, green, this.health); // https://p5js.org/reference/#/p5/lerpColor
    var alphy = lerp(50, 100, this.health); // https://p5js.org/reference/#/p5/lerp

    fill(col);
    noStroke();
    strokeWeight(1);
    push();
    translate(this.position.x, this.position.y);
    rotate(angle);
    beginShape();
    vertex(0, -this.size * 2);
    vertex(-this.size, this.size * 2);
    vertex(this.size, this.size * 2);
    endShape(CLOSE);
    if (debug) {
      // drawing the lines to see the DNA of this vehicle
      noFill();
      strokeWeight(4);
      stroke(0, 255, 0, alphy);
      line(0, 0, 0, -this.dna.foodWeight * 15); // visulaizing FOOD Steer force for this vehicle
      ellipse(0, 0, this.dna.foodPerception * 2); // visulaizing FOOD perception range
      strokeWeight(2);
      stroke(255, 0, 0, alphy);
      line(0, 0, 0, -this.dna.poisonWeight * 15); // visulaizing POISON Steer force for this vehicle
      ellipse(0, 0, this.dna.poisonPerception * 2); // visulaizing POISON perception range
    }
    pop();
  };

  this.bounceedges = function() {
    if (this.position.x < 0 || this.position.x > width) {
      this.velocity.x *= -1;
    }
    if (this.position.y < 0 || this.position.y > height) {
      this.position.y *= -1;
    }
  };

  this.wrapedges = function() {
    if (this.position.x > width) this.position.x = 0;
    if (this.position.x < 0) this.position.x = width;
    if (this.position.y > height) this.position.y = 0;
    if (this.position.y < 0) this.position.y = height;
  };

}