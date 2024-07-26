function render(canvas) {
    const ctx = canvas.getContext("2d");
  
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  
  onconnect = (event) => {
    event.ports[0].addEventListener("message", ({ data }) => {
      if (data?.type === "init") {
        render(data.canvas);
      }
    });
    event.ports[0].start();
  };
  