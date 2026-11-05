import webbrowser

import uvicorn


class LocalServer(uvicorn.Server):
    async def startup(self, sockets=None):
        # Open the browser only after Uvicorn has successfully bound the port.
        await super().startup(sockets=sockets)
        if not self.started:
            return

        url = f"http://{self.config.host}:{self.config.port}/docs"
        try:
            opened = webbrowser.open(url)
        except (webbrowser.Error, OSError):
            opened = False
        if not opened:
            print(f"Open Swagger UI in your browser: {url}", flush=True)


if __name__ == "__main__":
    try:
        LocalServer(
            uvicorn.Config("backend.main:app", host="127.0.0.1", port=8000)
        ).run()
    except KeyboardInterrupt:
        pass
