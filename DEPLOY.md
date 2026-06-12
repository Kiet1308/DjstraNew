# Deploy lên VPS (site tĩnh + room-server tự host)

Phòng điều khiển chung chạy hoàn toàn trên hạ tầng của bạn — không broker
bên thứ ba. Hai thành phần:

1. **Site tĩnh** — thư mục `dist/` sau khi build.
2. **room-server** — relay WebSocket nhỏ (`server/room-server.mjs`),
   nghe cổng 9100 (đổi bằng env `ROOM_PORT`), path `/room`.
   Mặc định chỉ bind `127.0.0.1` — bên ngoài bắt buộc đi qua nginx
   (TLS + CSP), không ai gõ thẳng `ws://VPS:9100` được. Nếu room-server
   chạy khác máy với nginx mới cần `ROOM_HOST=0.0.0.0` + tự lo firewall.

Trình duyệt kết nối `wss://<domain>/room` — **cùng origin với site**,
nginx proxy về room-server.

## 1. Build

```bash
npm ci
npm run build        # ra dist/
```

## 2. Chạy room-server (systemd)

`/etc/systemd/system/tdnn-room.service`:

```ini
[Unit]
Description=Room server - Tim duong ngan nhat
After=network.target

[Service]
WorkingDirectory=/var/www/tdnn        # thư mục chứa repo (cần server/ + node_modules/ws)
ExecStart=/usr/bin/node server/room-server.mjs
Environment=ROOM_PORT=9100
Restart=always
RestartSec=2
User=www-data

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable --now tdnn-room
curl http://127.0.0.1:9100/room/health    # phải ra "ok 0 phong"
```

## 3. Nginx

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.example;
    # ... ssl_certificate / ssl_certificate_key (certbot) ...

    root /var/www/tdnn/dist;
    index index.html;

    location / {
        try_files $uri /index.html;
    }

    # WebSocket phòng → room-server
    location /room {
        proxy_pass http://127.0.0.1:9100;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_read_timeout 1h;     # heartbeat 5s giữ dây, nhưng cứ rộng tay
        proxy_send_timeout 1h;
    }
}
```

## 4. Content-Security-Policy (QUAN TRỌNG)

Nếu nginx/host của bạn đang gắn CSP kiểu `connect-src 'none'` thì WebSocket
bị chặn (đây chính là lỗi từng gặp). Vì mọi kết nối giờ là cùng origin,
chỉ cần:

```
connect-src 'self'
```

(Safari bản cũ hiểu `'self'` không gồm wss — nếu nhóm có người dùng Safari,
ghi rõ: `connect-src 'self' wss://your-domain.example`.)

## 5. HTTPS

Nên bật (certbot). Đồng bộ phòng chạy được cả trên HTTP thường, nhưng nút
"Sao chép mã" dùng clipboard API — trình duyệt chỉ cho phép trên HTTPS.

## Kiểm tra sau deploy

1. `curl https://your-domain.example/room/health` → `ok N phong`.
2. Mở site ở 2 trình duyệt/2 máy: một bên Tạo phòng, bên kia nhập mã —
   bấm mũi tên ở máy này, máy kia phải chạy theo.

## Ghi chú vận hành

- room-server không lưu gì xuống đĩa; restart là phòng biến mất —
  host bấm "Mở lại phòng" (mã cũ giữ trong tab) là mọi người tự nối lại.
- Deploy bản build mới: chỉ cần thay `dist/`; room-server không cần restart
  trừ khi `server/room-server.mjs` đổi.
- Test cục bộ trên máy dev: `npm run build` rồi `node tools/smoke-room.mjs`
  và `node tools/smoke-reconnect.mjs` (tự bật room-server cổng 9100).
  Chạy tay: `npm run room-server` + `npm run preview` (proxy /room có sẵn
  trong vite.config.ts).
