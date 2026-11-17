#!/usr/bin/env python3
"""Extract inline JavaScript from index.html and syntax-check it with Node."""
from html.parser import HTMLParser
from pathlib import Path
import subprocess
import tempfile

class Scripts(HTMLParser):
    def __init__(self):
        super().__init__()
        self.inline = []
        self.current = None
        self.external = False

    def handle_starttag(self, tag, attrs):
        if tag.lower() != "script":
            return
        attrs = dict(attrs)
        self.external = "src" in attrs
        self.current = [] if not self.external else None

    def handle_data(self, data):
        if self.current is not None:
            self.current.append(data)

    def handle_endtag(self, tag):
        if tag.lower() == "script":
            if self.current is not None:
                body = "".join(self.current).strip()
                if body:
                    self.inline.append(body)
            self.current = None
            self.external = False

html = Path("index.html").read_text(encoding="utf-8")
parser = Scripts()
parser.feed(html)
if not parser.inline:
    raise SystemExit("No se encontraron scripts JavaScript inline para validar.")

for number, source in enumerate(parser.inline, start=1):
    with tempfile.NamedTemporaryFile("w", suffix=".js", encoding="utf-8") as tmp:
        tmp.write(source)
        tmp.flush()
        result = subprocess.run(["node", "--check", tmp.name], text=True, capture_output=True)
        if result.returncode:
            print(result.stdout, end="")
            print(result.stderr, end="")
            raise SystemExit(f"Error de sintaxis en el script inline #{number}.")

print(f"OK: {len(parser.inline)} script(s) inline superan node --check.")
