// Custom server with Socket.io for real-time multiplayer
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOSTNAME || '0.0.0.0';
const port = parseInt(process.env.PORT || '3000', 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// In-memory game state (for real-time sync)
const gameRooms = new Map(); // roomId -> room state
const playerSockets = new Map(); // socketId -> { userId, roomId }
const userSockets = new Map(); // userId -> socketId

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
    transports: ['websocket', 'polling'],
  });

  // Socket.io event handlers
  io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);

    // User authentication/registration
    socket.on('register', ({ userId, userName, avatar }) => {
      playerSockets.set(socket.id, { userId, userName, avatar, roomId: null });
      userSockets.set(userId, socket.id);
      console.log(`User registered: ${userName} (${userId})`);
    });

    // Create a new room
    socket.on('create-room', ({ room, user }) => {
      const roomId = room.id;

      // Initialize room state
      gameRooms.set(roomId, {
        ...room,
        jogadores: [{
          id: user.id,
          nome: user.nome,
          avatar: user.avatar,
          fichas: user.fichas,
          posicao: 0,
          cartas: [],
          online: true,
        }],
        partidaAtual: null,
      });

      // Join socket to room
      socket.join(roomId);

      // Update player's room
      const playerData = playerSockets.get(socket.id);
      if (playerData) {
        playerData.roomId = roomId;
      }

      // Broadcast room created to all
      io.emit('room-created', gameRooms.get(roomId));

      console.log(`Room created: ${room.nome} (${roomId})`);
    });

    // Get all available rooms
    socket.on('get-rooms', () => {
      const rooms = Array.from(gameRooms.values()).filter(
        (room) => room.status !== 'jogando' && room.jogadores.length < 4
      );
      socket.emit('rooms-list', rooms);
    });

    // Join an existing room
    socket.on('join-room', ({ roomId, user }) => {
      const room = gameRooms.get(roomId);

      if (!room) {
        socket.emit('error', { message: 'Sala não encontrada' });
        return;
      }

      if (room.jogadores.length >= 4) {
        socket.emit('error', { message: 'Sala cheia' });
        return;
      }

      if (room.aposta > user.fichas) {
        socket.emit('error', { message: 'Fichas insuficientes' });
        return;
      }

      // Check if user is already in room
      const existingPlayer = room.jogadores.find((j) => j.id === user.id);
      if (existingPlayer) {
        // Reconnection - update online status
        existingPlayer.online = true;
        socket.join(roomId);

        const playerData = playerSockets.get(socket.id);
        if (playerData) {
          playerData.roomId = roomId;
        }

        io.to(roomId).emit('player-reconnected', { playerId: user.id, room });
        return;
      }

      // Add new player
      const newPlayer = {
        id: user.id,
        nome: user.nome,
        avatar: user.avatar,
        fichas: user.fichas,
        posicao: room.jogadores.length,
        cartas: [],
        online: true,
      };

      room.jogadores.push(newPlayer);

      // Update room status
      if (room.jogadores.length >= 4) {
        room.status = 'cheia';
      }

      // Join socket to room
      socket.join(roomId);

      const playerData = playerSockets.get(socket.id);
      if (playerData) {
        playerData.roomId = roomId;
      }

      // Notify all players in room
      io.to(roomId).emit('player-joined', { player: newPlayer, room });

      // Broadcast updated rooms list
      io.emit('rooms-updated', Array.from(gameRooms.values()));

      console.log(`${user.nome} joined room ${room.nome}`);
    });

    // Leave room
    socket.on('leave-room', ({ roomId, userId }) => {
      const room = gameRooms.get(roomId);

      if (!room) return;

      // Remove player from room
      const playerIndex = room.jogadores.findIndex((j) => j.id === userId);
      if (playerIndex !== -1) {
        room.jogadores.splice(playerIndex, 1);

        // Reassign positions
        room.jogadores.forEach((j, i) => {
          j.posicao = i;
        });

        room.status = 'aguardando';
      }

      // Leave socket room
      socket.leave(roomId);

      const playerData = playerSockets.get(socket.id);
      if (playerData) {
        playerData.roomId = null;
      }

      // If room is empty, delete it
      if (room.jogadores.length === 0) {
        gameRooms.delete(roomId);
        io.emit('room-deleted', roomId);
      } else {
        // Notify remaining players
        io.to(roomId).emit('player-left', { playerId: userId, room });
      }

      // Broadcast updated rooms list
      io.emit('rooms-updated', Array.from(gameRooms.values()));
    });

    // Start game
    socket.on('start-game', ({ roomId }) => {
      const room = gameRooms.get(roomId);

      if (!room || room.jogadores.length < 4) {
        socket.emit('error', { message: 'Precisa de 4 jogadores para iniciar' });
        return;
      }

      // Import game logic (will be implemented)
      const { distribuirCartas } = require('./src/lib/truco-logic-server');
      const { maos, vira } = distribuirCartas(4);

      // Assign cards to players
      room.jogadores.forEach((jogador, index) => {
        jogador.cartas = maos[index];
      });

      // Initialize game state
      room.status = 'jogando';
      room.partidaAtual = {
        id: `partida-${Date.now()}`,
        times: {
          A: { id: 'A', jogadores: [room.jogadores[0].id, room.jogadores[2].id], pontos: 0 },
          B: { id: 'B', jogadores: [room.jogadores[1].id, room.jogadores[3].id], pontos: 0 },
        },
        maoAtual: {
          numero: 1,
          vira,
          rodadas: [{ numero: 1, cartasJogadas: [], manilha: vira }],
          valorAposta: 1,
        },
        jogadorDaVez: room.jogadores[0].id,
        status: 'em_andamento',
        turnTimer: 30,
      };

      // Send game state to each player (with only their own cards visible)
      room.jogadores.forEach((jogador) => {
        const socketId = userSockets.get(jogador.id);
        if (socketId) {
          const playerGameState = {
            ...room.partidaAtual,
            jogadores: room.jogadores.map((j) => ({
              ...j,
              cartas: j.id === jogador.id ? j.cartas : j.cartas.map(() => ({ hidden: true })),
            })),
            minhasCartas: jogador.cartas,
          };
          io.to(socketId).emit('game-started', playerGameState);
        }
      });

      // Broadcast updated rooms list
      io.emit('rooms-updated', Array.from(gameRooms.values()));

      console.log(`Game started in room ${room.nome}`);
    });

    // Play a card
    socket.on('play-card', ({ roomId, playerId, card }) => {
      const room = gameRooms.get(roomId);

      if (!room || !room.partidaAtual) return;
      if (room.partidaAtual.jogadorDaVez !== playerId) {
        socket.emit('error', { message: 'Não é sua vez' });
        return;
      }

      const jogador = room.jogadores.find((j) => j.id === playerId);
      if (!jogador) return;

      // Remove card from player's hand
      const cardIndex = jogador.cartas.findIndex((c) => c.id === card.id);
      if (cardIndex === -1) return;
      jogador.cartas.splice(cardIndex, 1);

      // Add card to current round
      const maoAtual = room.partidaAtual.maoAtual;
      const rodadaAtual = maoAtual.rodadas[maoAtual.rodadas.length - 1];

      rodadaAtual.cartasJogadas.push({
        jogadorId: playerId,
        carta: card,
        timestamp: Date.now(),
      });

      // Determine next player
      const currentIndex = room.jogadores.findIndex((j) => j.id === playerId);
      const nextIndex = (currentIndex + 1) % 4;
      room.partidaAtual.jogadorDaVez = room.jogadores[nextIndex].id;

      // Check if round is complete (4 cards played)
      if (rodadaAtual.cartasJogadas.length === 4) {
        // Determine round winner
        const { determinarVencedorRodada, determinarVencedorMao } = require('./src/lib/truco-logic-server');
        const vencedorCarta = determinarVencedorRodada(rodadaAtual, maoAtual.vira);

        // Determine the team of the winning player based on position
        let vencedor = 'empate';
        if (vencedorCarta && vencedorCarta.jogadorId) {
          const jogadorVencedor = room.jogadores.find((j) => j.id === vencedorCarta.jogadorId);
          if (jogadorVencedor) {
            vencedor = jogadorVencedor.posicao % 2 === 0 ? 'A' : 'B';
          }
        }
        rodadaAtual.vencedor = vencedor;

        // Check if hand is complete
        const vencedorMao = determinarVencedorMao(maoAtual.rodadas);

        if (vencedorMao) {
          // Update points
          room.partidaAtual.times[vencedorMao].pontos += maoAtual.valorAposta;
          maoAtual.vencedor = vencedorMao;

          // Check if game is complete (12 points)
          if (room.partidaAtual.times[vencedorMao].pontos >= 12) {
            room.partidaAtual.status = 'finalizada';
            room.partidaAtual.vencedor = vencedorMao;
            room.status = 'aguardando';

            // Broadcast game over
            io.to(roomId).emit('game-over', {
              vencedor: vencedorMao,
              times: room.partidaAtual.times,
            });
          } else {
            // Start new hand
            const { distribuirCartas } = require('./src/lib/truco-logic-server');
            const { maos, vira: novoVira } = distribuirCartas(4);

            room.jogadores.forEach((jogador, index) => {
              jogador.cartas = maos[index];
            });

            room.partidaAtual.maoAtual = {
              numero: maoAtual.numero + 1,
              vira: novoVira,
              rodadas: [{ numero: 1, cartasJogadas: [], manilha: novoVira }],
              valorAposta: 1,
            };

            // Notify players of new hand
            room.jogadores.forEach((jogador) => {
              const socketId = userSockets.get(jogador.id);
              if (socketId) {
                io.to(socketId).emit('new-hand', {
                  maoAtual: room.partidaAtual.maoAtual,
                  minhasCartas: jogador.cartas,
                  times: room.partidaAtual.times,
                });
              }
            });
          }
        } else if (maoAtual.rodadas.length < 3) {
          // Start new round
          maoAtual.rodadas.push({
            numero: maoAtual.rodadas.length + 1,
            cartasJogadas: [],
            manilha: maoAtual.vira,
          });

          // Winner of round starts next round - use the actual winning player
          if (vencedorCarta && vencedorCarta.jogadorId) {
            room.partidaAtual.jogadorDaVez = vencedorCarta.jogadorId;
          }
        }
      }

      // Broadcast card played
      io.to(roomId).emit('card-played', {
        playerId,
        card,
        jogadorDaVez: room.partidaAtual.jogadorDaVez,
        rodadaAtual: maoAtual.rodadas[maoAtual.rodadas.length - 1],
        times: room.partidaAtual.times,
      });
    });

    // Call Truco
    socket.on('call-truco', ({ roomId, playerId }) => {
      const room = gameRooms.get(roomId);

      if (!room || !room.partidaAtual || room.partidaAtual.status !== 'em_andamento') return;

      const jogador = room.jogadores.find((j) => j.id === playerId);
      if (!jogador) return;

      const timeDoJogador = jogador.posicao % 2 === 0 ? 'A' : 'B';
      const maoAtual = room.partidaAtual.maoAtual;

      // Calculate next value
      const valores = [1, 3, 6, 9, 12];
      const indexAtual = valores.indexOf(maoAtual.valorAposta);
      if (indexAtual >= valores.length - 1) return; // Already at max

      room.partidaAtual.status = 'truco_pedido';
      maoAtual.timeQuePediu = timeDoJogador;
      maoAtual.valorPedido = valores[indexAtual + 1];

      // Broadcast truco call
      io.to(roomId).emit('truco-called', {
        playerId,
        playerName: jogador.nome,
        timeQuePediu: timeDoJogador,
        valorPedido: maoAtual.valorPedido,
        valorAtual: maoAtual.valorAposta,
      });
    });

    // Respond to Truco
    socket.on('respond-truco', ({ roomId, aceitar, playerId: _playerId }) => {
      const room = gameRooms.get(roomId);

      if (!room || !room.partidaAtual || room.partidaAtual.status !== 'truco_pedido') return;

      const maoAtual = room.partidaAtual.maoAtual;

      if (aceitar) {
        // Accept truco
        maoAtual.valorAposta = maoAtual.valorPedido;
        room.partidaAtual.status = 'em_andamento';
        delete maoAtual.timeQuePediu;
        delete maoAtual.valorPedido;

        io.to(roomId).emit('truco-accepted', {
          novoValor: maoAtual.valorAposta,
        });
      } else {
        // Decline truco - team that called wins the hand
        const timeVencedor = maoAtual.timeQuePediu;
        room.partidaAtual.times[timeVencedor].pontos += maoAtual.valorAposta;

        // Check if game over
        if (room.partidaAtual.times[timeVencedor].pontos >= 12) {
          room.partidaAtual.status = 'finalizada';
          room.partidaAtual.vencedor = timeVencedor;
          room.status = 'aguardando';

          io.to(roomId).emit('game-over', {
            vencedor: timeVencedor,
            times: room.partidaAtual.times,
            motivo: 'Truco recusado',
          });
        } else {
          // Start new hand
          const { distribuirCartas } = require('./src/lib/truco-logic-server');
          const { maos, vira: novoVira } = distribuirCartas(4);

          room.jogadores.forEach((jogador, index) => {
            jogador.cartas = maos[index];
          });

          room.partidaAtual.maoAtual = {
            numero: maoAtual.numero + 1,
            vira: novoVira,
            rodadas: [{ numero: 1, cartasJogadas: [], manilha: novoVira }],
            valorAposta: 1,
          };
          room.partidaAtual.status = 'em_andamento';

          room.jogadores.forEach((jogador) => {
            const socketId = userSockets.get(jogador.id);
            if (socketId) {
              io.to(socketId).emit('truco-declined', {
                timeVencedor,
                times: room.partidaAtual.times,
                maoAtual: room.partidaAtual.maoAtual,
                minhasCartas: jogador.cartas,
              });
            }
          });
        }
      }
    });

    // Chat message
    socket.on('chat-message', ({ roomId, message, user }) => {
      io.to(roomId).emit('chat-message', {
        id: `msg-${Date.now()}`,
        jogadorId: user.id,
        jogadorNome: user.nome,
        conteudo: message,
        timestamp: new Date(),
        tipo: 'mensagem',
      });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      const playerData = playerSockets.get(socket.id);

      if (playerData && playerData.roomId) {
        const room = gameRooms.get(playerData.roomId);

        if (room) {
          const jogador = room.jogadores.find((j) => j.id === playerData.userId);
          if (jogador) {
            jogador.online = false;

            // Notify other players
            io.to(playerData.roomId).emit('player-disconnected', {
              playerId: playerData.userId,
              playerName: jogador.nome,
            });

            // Set timeout to remove player if they don't reconnect
            setTimeout(() => {
              const currentRoom = gameRooms.get(playerData.roomId);
              if (currentRoom) {
                const player = currentRoom.jogadores.find((j) => j.id === playerData.userId);
                if (player && !player.online) {
                  // Remove player
                  currentRoom.jogadores = currentRoom.jogadores.filter((j) => j.id !== playerData.userId);

                  if (currentRoom.jogadores.length === 0) {
                    gameRooms.delete(playerData.roomId);
                    io.emit('room-deleted', playerData.roomId);
                  } else {
                    io.to(playerData.roomId).emit('player-removed', {
                      playerId: playerData.userId,
                      room: currentRoom,
                    });
                  }

                  io.emit('rooms-updated', Array.from(gameRooms.values()));
                }
              }
            }, 30000); // 30 second timeout
          }
        }
      }

      if (playerData) {
        userSockets.delete(playerData.userId);
      }
      playerSockets.delete(socket.id);

      console.log(`Client disconnected: ${socket.id}`);
    });
  });

  server.listen(port, hostname, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
    console.log(`> Socket.io server running`);
    console.log(`> Environment: ${dev ? 'development' : 'production'}`);
  });
});
