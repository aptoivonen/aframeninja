AFRAME.registerComponent("log", {
  schema: {
    event: { type: "string", default: "" },
    message: { type: "string", default: "Hello, World!!!" },
  },

  multiple: true,

  init: function () {
    console.log("init");
    // Closure to access fresh `this.data` from event handler context.
    var self = this;

    // .init() is a good place to set up initial state and variables.
    // Store a reference to the handler so we can later remove it.
    this.eventHandlerFn = function () {
      console.log(self.data.message);
    };
  },

  update: function (oldData) {
    const { data, el } = this;

    console.log("update", data.event, oldData);
    // `event` updated. Remove the previous event listener if it exists.
    if (oldData.event && data.event !== oldData.event) {
      el.removeEventListener(oldData.event, this.eventHandlerFn);
    }

    if (data.event) {
      // This will log the `message` when the entity emits the `event`.
      el.addEventListener(data.event, this.eventHandlerFn);
    } else {
      // `event` not specified, just log the message.
      console.log("event not specified, message:", data.message);
    }
  },

  remove: function () {
    const { data, el } = this;

    // Remove event listener.
    if (data.event) {
      el.removeEventListener(data.event, this.eventHandlerFn);
    }
  },
});

AFRAME.registerComponent("box", {
  schema: {
    width: { type: "number", default: 1 },
    height: { type: "number", default: 1 },
    depth: { type: "number", default: 1 },
    color: { type: "color", default: "#AAA" },
  },

  init: function () {
    const { data, el } = this;

    // Create geometry.
    this.geometry = new THREE.BoxBufferGeometry(
      data.width,
      data.height,
      data.depth
    );

    // Create material.
    this.material = new THREE.MeshStandardMaterial({ color: data.color });

    // Create mesh.
    this.mesh = new THREE.Mesh(this.geometry, this.material);

    // Set mesh on entity.
    el.setObject3D("mesh", this.mesh);
  },

  update: function (oldData) {
    const { data, el } = this;

    // If `oldData` is empty, then this means we're in the initialization process.
    // No need to update.
    if (Object.keys(oldData).length === 0) {
      return;
    }

    // Geometry-related properties changed. Update the geometry.
    if (
      data.width !== oldData.width ||
      data.height !== oldData.height ||
      data.depth !== oldData.depth
    ) {
      el.getObject3D("mesh").geometry = new THREE.BoxBufferGeometry(
        data.width,
        data.height,
        data.depth
      );
    }

    // Material-related properties changed. Update the material.
    if (data.color !== oldData.color) {
      el.getObject3D("mesh").material.color = new THREE.Color(data.color);
    }
  },

  remove: function () {
    this.el.removeObject3D("mesh");
  },
});

AFRAME.registerComponent("follow", {
  schema: {
    target: { type: "selector" },
    speed: { type: "number" },
  },

  init: function () {
    this.directionVec3 = new THREE.Vector3();
  },

  tick: function (time, timeDelta) {
    var directionVec3 = this.directionVec3;

    // Grab position vectors (THREE.Vector3) from the entities' three.js objects.
    var targetPosition = this.data.target.object3D.position;
    var currentPosition = this.el.object3D.position;

    // Subtract the vectors to get the direction the entity should head in.
    directionVec3.copy(targetPosition).sub(currentPosition);

    // Calculate the distance.
    var distance = directionVec3.length();

    // Don't go any closer if a close proximity has been reached.
    if (distance < 1) {
      return;
    }

    // Scale the direction vector's magnitude down to match the speed.
    var factor = this.data.speed / distance;
    ["x", "y", "z"].forEach(function (axis) {
      directionVec3[axis] *= factor * (timeDelta / 1000);
    });

    // Translate the entity in the direction towards the target.
    this.el.setAttribute("position", {
      x: currentPosition.x + directionVec3.x,
      y: currentPosition.y + directionVec3.y,
      z: currentPosition.z + directionVec3.z,
    });
  },
});

AFRAME.registerComponent("change-color-on-hover", {
  schema: {
    color: { default: "red" },
  },

  init: function () {
    var data = this.data;
    var el = this.el; // <a-box>
    var defaultColor = el.getAttribute("material").color;

    el.addEventListener("mouseenter", function () {
      el.setAttribute("color", data.color);
    });

    el.addEventListener("mouseleave", function () {
      el.setAttribute("color", defaultColor);
    });
  },
});
