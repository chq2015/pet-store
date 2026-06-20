import http.server
import socketserver
import threading

class FrontendHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/':
            self.path = '/index.html'
        return super().do_GET()

class BackendHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/':
            self.path = '/admin.html'
        return super().do_GET()

def serve(port, handler_cls, name):
    with socketserver.TCPServer(("", port), handler_cls) as httpd:
        print(f"  {name} → http://localhost:{port}")
        httpd.serve_forever()

t1 = threading.Thread(target=serve, args=(8080, FrontendHandler, "前台"), daemon=True)
t2 = threading.Thread(target=serve, args=(8081, BackendHandler, "后台"), daemon=True)

print("启动服务中...")
t1.start()
t2.start()
print("服务已启动：")
print(f"  前台 → http://localhost:8080")
print(f"  后台 → http://localhost:8081")
print("按 Ctrl+C 停止所有服务")

try:
    t1.join()
    t2.join()
except KeyboardInterrupt:
    print("\n服务已停止")
