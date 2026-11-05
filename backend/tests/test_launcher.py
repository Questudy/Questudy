import asyncio
from unittest.mock import AsyncMock, Mock

import pytest
import uvicorn

from backend.__main__ import LocalServer


def test_browser_opens_after_startup(monkeypatch):
    server = LocalServer(uvicorn.Config("backend.main:app", port=8000))
    events = []

    async def startup(self, sockets=None):
        events.append("ready")
        self.started = True

    def open_browser(url):
        events.append(url)
        return True

    monkeypatch.setattr(uvicorn.Server, "startup", startup)
    monkeypatch.setattr("backend.__main__.webbrowser.open", open_browser)
    asyncio.run(server.startup())
    assert events == ["ready", "http://127.0.0.1:8000/docs"]


def test_startup_failure_does_not_open_browser(monkeypatch):
    server = LocalServer(uvicorn.Config("backend.main:app"))
    browser = Mock()
    monkeypatch.setattr(uvicorn.Server, "startup", AsyncMock(side_effect=SystemExit(1)))
    monkeypatch.setattr("backend.__main__.webbrowser.open", browser)
    with pytest.raises(SystemExit):
        asyncio.run(server.startup())
    browser.assert_not_called()


@pytest.mark.parametrize("failure", [False, OSError("No browser available")])
def test_browser_failure_keeps_server_available(monkeypatch, capsys, failure):
    server = LocalServer(uvicorn.Config("backend.main:app"))
    server.started = True
    browser = Mock(return_value=False)
    if isinstance(failure, OSError):
        browser.side_effect = failure
    monkeypatch.setattr(uvicorn.Server, "startup", AsyncMock())
    monkeypatch.setattr("backend.__main__.webbrowser.open", browser)
    asyncio.run(server.startup())
    assert server.started
    assert "http://127.0.0.1:8000/docs" in capsys.readouterr().out
