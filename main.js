const { devicePixelRatio } = window;
const canvas = document.querySelector("canvas");
canvas.width = canvas.offsetWidth * devicePixelRatio;
canvas.height = canvas.offsetHeight * devicePixelRatio;

const worker = new SharedWorker(new URL("./worker.js", import.meta.url), {
  type: "module",
});
const offscreen = canvas.transferControlToOffscreen();

worker.port.start();
worker.port.postMessage(
  {
    type: "init",
    canvas: offscreen,
  },
  [offscreen]
);
