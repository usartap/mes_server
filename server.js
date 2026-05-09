const http = require("http");
const { Server } = require("socket.io");

const server = http.createServer();
const io = new Server(server, {
  cors: { origin: "*" }
});

let users = {};

io.on("connection", (socket) => {
  console.log(`✅ Bağlandı: ${socket.id}`);

  socket.on("join", (username) => {
    users[socket.id] = username;
    io.emit("user_list", users);
    console.log(`📌 ${username} qoşuldu. İstifadəçilər:`, Object.values(users));
  });

  // Bütün hadisələri izlə
  socket.onAny((event, ...args) => {
    console.log(`📨 Hadisə: ${event}`, JSON.stringify(args));
  });

  socket.on("send_private", (rawData) => {
    console.log("🔵 send_private daxil oldu:", rawData);
    let data;
    try {
      data = JSON.parse(rawData);
    } catch (e) {
      data = rawData;
    }
    const { to, message, from } = data;
    if (to && message && from) {
      console.log(`💬 ${from} -> ${to}: ${message}`);
      io.to(to).emit("receive_private", { from, message });
    } else {
      console.log("❌ səhv format:", data);
    }
  });

  socket.on("disconnect", () => {
    delete users[socket.id];
    io.emit("user_list", users);
    console.log(`❌ Ayrıldı: ${socket.id}`);
  });
});

server.listen(3000, "0.0.0.0", () => {
  console.log("🚀 Server 3000-ci portda işləyir");
});