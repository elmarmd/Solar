// Canvas
const canvasDiv = document.querySelector("#canvas-div");
const canvas = document.createElement("canvas");
const context = canvas.getContext("2d");
const canvasWidth = 1000;
const canvasHeight = 650;
const celestialBodies = [];
let coords = [];
let z;
let collision = false;
let collisionX;
let collisionY;
let explosionR;

// Form elements
const form = document.querySelector(".form");
const inputMass = document.querySelector(".form__input--mass");
const inputSpeed = document.querySelector(".form__input--speed");
const inputRotation = document.querySelector(".form__input--rotation");
const inputColor = document.querySelector(".form__input--color");
const submitBtn = document.querySelector(".submit-btn");

class CelestialBody {
  #mass;
  radius;
  x;
  y;
  #color;

  constructor(mass, x, y, color) {
    this.#mass = mass;
    this.x = x;
    this.y = y;
    this.radius = mass;
    this.#color = color;
  }

  _drawBody() {
    context.beginPath();
    context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
    context.stroke();
    context.fillStyle = this.#color;
    context.fill();
  }
}

class Sun extends CelestialBody {
  constructor(mass, x, y, color) {
    super(mass, x, y, color);
  }

  _rotate() {
    this._drawBody();
    return {
      x: this.x,
      y: this.y,
      r: this.radius,
    };
  }
}

class Planet extends CelestialBody {
  #orbitR;
  #speed;
  #clockwise;
  #angle = 0;

  constructor(mass, x, y, speed, clockwise, color) {
    super(mass, x, y, color);
    this.#speed = speed;
    this.#clockwise = clockwise;
    z = 1;
    explosionR = 30;
  }

  _calculateOrbit(x, y) {
    this.#orbitR = Math.sqrt(
      (x - canvasWidth / 2) ** 2 + (y - canvasHeight / 2) ** 2
    );
    this._calculateAngle();
  }

  _calculateAngle() {
    if (this.#clockwise) {
      this.#angle = Math.acos((this.x - canvasWidth / 2) / this.#orbitR);
      if (this.y < canvasHeight / 2) {
        this.#angle = -this.#angle;
      }
    } else {
      this.#angle = Math.acos((this.x - canvasWidth / 2) / this.#orbitR);
      if (this.y < canvasHeight / 2) {
        this.#angle = -this.#angle;
      }
    }
  }

  _rotate() {
    // Update coordinates
    this.x = canvasWidth / 2 + this.#orbitR * Math.cos(this.#angle);
    this.y = canvasHeight / 2 + this.#orbitR * Math.sin(this.#angle);

    // Update angle
    if (this.#clockwise) {
      if (this.#angle < 3.1415) this.#angle += 0.02 * this.#speed;
      else this.#angle = -3.1415;
    } else {
      if (this.#angle > -3.1415) this.#angle -= 0.02 * this.#speed;
      else this.#angle = 3.1415;
    }

    // Re-draw object
    this._drawBody();

    return {
      x: this.x,
      y: this.y,
      r: this.radius,
    };
  }
}

class GUI {
  x;
  y;

  constructor() {
    canvas.addEventListener("click", this._getClickCoords.bind(this));
    form.addEventListener("submit", this._gatherFormInputs.bind(this));
  }

  static _buildCanvas() {
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    canvasDiv.appendChild(canvas);
  }

  _renderCanvas() {
    // Clear the canvas
    context.fillStyle = "rgb(33, 33, 33)";
    context.fillRect(0, 0, canvasWidth, canvasHeight);

    // Calculate rotation of each object and draw it
    celestialBodies.forEach((body, index) => {
      coords[index] = body._rotate();
    });

    let distanceBetweenPlanets;

    // If planets collide
    for (let i = 0; i < coords.length; i++) {
      for (let j = 0; j < coords.length; j++) {
        distanceBetweenPlanets = Math.sqrt(
          (coords[i].x - coords[j].x) ** 2 + (coords[i].y - coords[j].y) ** 2
        );
        if (coords[i].r + coords[j].r >= distanceBetweenPlanets && i != j) {
          collision = true;
          collisionX = coords[j].x;
          collisionY = coords[j].y;

          // Remove planets in case of collision (if not the sun)
          if (i != 0) {
            celestialBodies.splice(i, 1);
            coords.splice(i, 1);
            celestialBodies.splice(j - 1, 1);
            coords.splice(j - 1, 1);
          } else {
            celestialBodies.splice(j, 1);
            coords.splice(j, 1);
          }
        }
      }
    }
    if (collision == true) {
      // Explosion effect
      context.beginPath();
      context.arc(collisionX, collisionY, explosionR, 0, 2 * Math.PI);
      context.stroke();
      context.fillStyle = `rgba(255, 0, 0, ${z})`;
      context.fill();
      z -= 0.01;
      explosionR += 0.5;

      if (z < 0.1) collision = false;
    }
    window.requestAnimationFrame(gui._renderCanvas);
  }

  _getClickCoords(event) {
    // Get coordinates of where the mouse was clicked on canvas
    this.x = event.offsetX;
    this.y = event.offsetY;

    // Show object specification form on the sidebar
    form.classList.remove("hidden");
  }

  _gatherFormInputs(e) {
    e.preventDefault();

    const mass = +inputMass.value;
    const speed = +inputSpeed.value / 100;
    const rotation = inputRotation.value;
    const color = inputColor.value;

    const clockwise = rotation === "clockwise" ? true : false;

    const planet = new Planet(mass, this.x, this.y, speed, clockwise, color);
    celestialBodies.push(planet);
    planet._calculateOrbit(this.x, this.y);

    // Reset inputs and hide the form
    inputMass.value = 10;
    inputSpeed.value = 50;
    inputRotation.value = "clockwise";
    inputColor.value = "#ffffff";
    form.classList.add("hidden");
  }
}

const gui = new GUI();
GUI._buildCanvas();

const sun = new Sun(50, canvasWidth / 2, canvasHeight / 2, "yellow");
celestialBodies.push(sun);
sun._drawBody();
// sun._rotate();
gui._renderCanvas();
