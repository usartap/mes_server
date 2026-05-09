const http = require("http");
const { Server } = require("socket.io");

const server = http.createServer();
const io = new Server(server, {
  cors: { origin: "*" },
});

let users = {}; // socket.id -> username

io.on("connection", (socket) => {
  console.log("Connected:", socket.id);

  // user join olduqda
  socket.on("join", (username) => {
    users[socket.id] = username;
    io.emit("user_list", users); // bütün client-lərə user list göndər
  });

  // private mesaj
  socket.on("send_private", (data) => {
    const { to, message, from } = data;

    // yalnız hədəf user varsa göndər
    if (users[to]) {
      io.to(to).emit("receive_private", {
        message,
        from,
      });
    }
  });

  // disconnect
  socket.on("disconnect", () => {
    console.log("Disconnected:", socket.id);
    delete users[socket.id]; // user-i listdən sil
    io.emit("user_list", users); // bütün client-lərə update
  });
});

server.listen(3000, () => {
  console.log("Server running on port 3000");
});