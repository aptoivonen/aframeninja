var el = document.querySelector("a-entity");

el.emit("anEvent");
el.setAttribute("log", { event: "anotherEvent", message: "Hello, new event!" });
el.emit("anotherEvent");
el.emit("anotherEvent");
el.emit("anotherEvent");
el.removeAttribute("log");
el.emit("anotherEvent");
