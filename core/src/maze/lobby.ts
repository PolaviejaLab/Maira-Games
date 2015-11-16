
class Lobby
{
	// Called when the present client receives a start request
	public onStart: () => boolean;
	
	// Called when a new client list arrives
	public onUpdateClients: (clients: any[]) => void;
			
	private ws: WebSocket;
	private server: string = "ws://maira-server.champalimaud.pt:8001";
	
	private status: string;
	
	// Name of the client
	private name: string;
	
	// Determines whether this is the master server
	//   or a game client
	private master: boolean;	
	private timerId: number;
	
	private clients: any[];

	private watchDogId: number;
		

	constructor(name: string, master: boolean)
	{
		this.name = name;
		this.master = master;
		
		if(this.master)
			this.status = "unavailable";
		else
			this.status = "available";

		this.ws = new WebSocket(this.server);
		this.ws.onopen = this.onopen.bind(this);						
		this.ws.onmessage = this.onmessage.bind(this);
		
		this.watchDogId = setInterval(function() {
			if(this.ws.readyState == this.ws.CLOSED) {
				this.ws = new WebSocket(this.server);
				this.ws.onopen = this.onopen.bind(this);						
				this.ws.onmessage = this.onmessage.bind(this);
			}
		}.bind(this), 1000);
	}	
	
	/**
	 * Close WebSocket when object is destroyed
	 */
	destroy()
	{
		if(this.ws)
			this.ws.close();
			
		if(this.timerId !== undefined)
			clearInterval(this.timerId);
			
		if(this.watchDogId !== undefined)
			clearInterval(this.watchDogId);			
	}		
	
	
	/**
	 * WebSocket onopen callback
	 */
	onopen(evt: Event)
	{
		var msg = {
			"type": "register",
			"name": this.name,
			"status": this.status,
			"master": this.master
		};
		
		// Send registration message
		this.ws.send(JSON.stringify(msg));
		
		// Clear keepalive timer if present
		if(this.timerId !== undefined)
			clearInterval(this.timerId);
		
		// Periodically send keepalive message
		this.timerId = setInterval(function() {
			let msg = {
				"type": "keepalive",
				"name": this.name,
				"status": this.status,
				"master": this.master	
			};
			//console.log("Sending", msg);
			this.ws.send(JSON.stringify(msg));
		}.bind(this), 10 * 1000);
	}
	
	
	/**
	 * WebSocket onmessage callback
	 */
	onmessage(evt: MessageEvent) 
	{
		var msg = JSON.parse(evt.data);
		
		//console.log("onmessage(", msg, ")");
		
		if(msg.type == "client_list") {
			this.clients = <any[]> msg.clients;
			if(this.onUpdateClients)
				this.onUpdateClients(this.clients);
		} else if(msg.type == "start") {
			//console.log("Start message received");
			if(msg.name == this.name && this.onStart)
				this.onStart();
		}
	}
		
	
	/**
	 * Send start-message to specific client
	 */
	startClient(name: string)
	{
		var msg = {
			"type": "start",
			"name": name
		};
		
		this.ws.send(JSON.stringify(msg));
	}
	
	
	/**
	 * Send start-message to multiple clients
	 */
	startClients(names: string[])
	{
		names.forEach(function(name) {
			this.startClient(name);
		}.bind(this));
	}
}