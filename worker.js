let adapter;
let device;
let pipeline;
let vertexBuffer;

const shaderTemplate = `
@vertex
fn vertexMain(@location(0) pos: vec2f) -> @builtin(position) vec4f {
  return vec4f(pos, 0, 1);
}

@fragment
fn fragmentMain() -> @location(0) vec4f {
  return vec4f(1, 0, 0, 1);
}
`;

async function setupContext() {
  if (adapter) {
    return;
  }

  adapter = await navigator.gpu.requestAdapter();
  device = await adapter.requestDevice();

  const vertexBufferLayout = {
    arrayStride: 8,
    attributes: [
      {
        format: "float32x2",
        offset: 0,
        shaderLocation: 0,
      },
    ],
  };

  const vertices = new Float32Array([
    -1.0, -1.0, 1.0, -1.0, 1.0, 1.0,

    -1.0, -1.0, 1.0, 1.0, -1.0, 1.0,
  ]);
  vertexBuffer = device.createBuffer({
    label: "Cell vertices",
    size: vertices.byteLength,
    usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
  });
  device.queue.writeBuffer(vertexBuffer, 0, vertices);

  const shaderModule = device.createShaderModule({
    label: "Shader Module",
    code: shaderTemplate,
  });

  pipeline = device.createRenderPipeline({
    label: "Render Pipeline",
    layout: "auto",
    vertex: {
      module: shaderModule,
      entryPoint: "vertexMain",
      buffers: [vertexBufferLayout],
    },
    fragment: {
      module: shaderModule,
      entryPoint: "fragmentMain",
      targets: [
        {
          format: navigator.gpu.getPreferredCanvasFormat(),
        },
      ],
    },
  });
}

async function render(canvas) {
  if (!adapter) {
    await setupContext();
  }

  const context = canvas.getContext("webgpu");
  context.configure({
    device,
    format: navigator.gpu.getPreferredCanvasFormat(),
  });

  const commandEncoder = device.createCommandEncoder();
  const renderPass = commandEncoder.beginRenderPass({
    colorAttachments: [
      {
        view: context.getCurrentTexture().createView(),
        loadOp: "clear",
        clearValue: [0, 0, 0, 1],
        storeOp: "store",
      },
    ],
  });

  renderPass.setPipeline(pipeline);
  renderPass.setVertexBuffer(0, vertexBuffer);
  renderPass.draw(6);
  renderPass.end();

  device.queue.submit([commandEncoder.finish()]);
}

onconnect = (event) => {
  event.ports[0].addEventListener("message", ({ data }) => {
    if (data?.type === "init") {
      render(data.canvas);
    }
  });
  event.ports[0].start();
};
