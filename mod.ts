import { Image } from "https://deno.land/x/imagescript@1.2.6/mod.ts";

async function handleRequest(request: Request) {
  const { pathname } = new URL(request.url);

  console.log(import.meta.url);
  const binaryURL = new URL("base.png", import.meta.url);
  const binary = await fetch(binaryURL).then(resp => resp.body)
    .then(body => {
      const reader = body?.getReader();

      return new ReadableStream({
        start(controller) {
          return pump();

          function pump(): any {
            return reader?.read().then(({ done, value }) => {
              // When no more data needs to be consumed, close the stream
              if (done) {
                controller.close();
                return;
              }

              // Enqueue the next data chunk into our target stream
              controller.enqueue(value);
              return pump();
            });
          }
        }
      })
    });
  const baseImage = await Image.decode(binary);

  const binaryFontURL = new URL("Roboto-Regular.ttf", import.meta.url);
  const binaryFont = await fetch(binaryFontURL).then(res => res.arrayBuffer());
  // const font = await binaryFont.getReader().read();

  const helloText = Image.renderText(new Uint8Array(binaryFont), 120, "hello", 0xffffffff);
  baseImage.composite(helloText, 30, 100);

  const encoded = await baseImage.encode(1);

  return new Response(
    encoded,
    {
      headers: {
        "content-type": "image/png",
      },
    },
  );
}

addEventListener("fetch", (event) => {
  event.respondWith(handleRequest(event.request));
})
