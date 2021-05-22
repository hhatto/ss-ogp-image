import { Image } from "https://deno.land/x/imagescript@1.2.6/mod.ts";

async function handleRequest(request: Request) {
  const { pathname } = new URL(request.url);

  const binary = await fetch(new URL("base.png", import.meta.url));
  const baseImage = await Image.decode(binary.body);

  const binaryFont = await fetch(new URL("Roboto-Regular.ttf", import.meta.url));
  const font = binaryFont.body;

  const helloText = Image.renderText(font, 120, "hello", 0xffffffff);
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
