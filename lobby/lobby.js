
var ws = require("nodejs-websocket")

/**
 * List of clients connected to the server
 */
var clients = {}


function removeClient(name, reason)
{
  console.log("Removing client", name, "because of", reason);
  delete clients[name];
}


/**
 * Remove clients if lastseen expired
 */
function cleanupClients()
{
  var changed = false;
  var limit = Date.now() - 20 * 1000 * 1000;

  for(key in clients) {
    if(clients[key].lastseen < limit) {
      removeClient(key, "timeout has been reached");
      changed = true;
    }
  }

  return changed;
}


/**
 * Send list of clients to all connections
 */
function broadcastClients()
{
  var client_list = {};

  for(var key in clients)
  {
    var client = clients[key];

    client_list[key] = {
      name: client.name,
      status: client.status
    };
  }

  var msg = {
    "type": "client_list",
    "clients": client_list
  };

  for(var key in clients) {
    var client = clients[key];
    try {
      client.conn.sendText(JSON.stringify(msg));
    } catch(e) {
      removeClient(key, "transmission failed");
    }
  }
}


/**
 * Periodically clean-up clients and broadcast updated list
 *  in case clients were removed
 */
setInterval(function() {
  if(cleanupClients())
    broadcastClients();
}, 2 * 1000);


/**
 * Update client information
 *
 *  conn - connection
 *  msg - message with client information
 */
function updateClient(conn, msg)
{
  changed = false;

  if(!(msg.name in clients)) {
    console.log("New client", msg.name);

    changed = true;
    clients[msg.name] = {
      conn: conn,
      name: msg.name,
      master: msg.master
    }
  }

  if(clients[msg.name].status != msg.status)
    changed = true;

  clients[msg.name].status = msg.status;
  clients[msg.name].lastseen = Date.now();

  return changed;
}


var server = ws.createServer(function (conn)
{
  conn.on("text", function (str) {
    var msg = JSON.parse(str);

    /**
     * Update client information on register or keepalive
     */
    if(msg.type == "register" || msg.type == "keepalive")
    {
      if(updateClient(conn, msg))
        broadcastClients();
    }

    /**
     * Relay start message to relevant client
     */
    if(msg.type == "start")
    {
      console.log("Starting client", msg.name);
      for(var key in clients) {
        var client = clients[key];
        console.log("Checking", key);
        if(client.name == msg.name) {
          client.conn.sendText(JSON.stringify({ type: "start", name: msg.name }));
        }
      }
    }

    if(cleanupClients())
      broadcastClients();
  })

  conn.on("close", function (code, reason) {
    for(key in clients) {
      var client = clients[key];

      if(client.conn = conn) {
        //removeClient(key, "connection closed");
        break;
      }
    }

    broadcastClients();
  })
}).listen(8001)
