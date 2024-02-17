var osc = require("osc"),
	express = require("express"),
	WebSocket = require("ws")

// Bind to a UDP socket to listen for incoming OSC events.
var udpPort = new osc.UDPPort({
	// This is the port we're listening on.
	localAddress: "127.0.0.1",
	localPort: 57121,

	// This is where pureData is listening for OSC messages.
	remoteAddress: "127.0.0.1",
	remotePort: 57120,
	metadata: true,
})

udpPort.on("ready", function () {
	console.log("To start the demo, go to http://localhost:8081 in your web browser.")
})

udpPort.open()

// Create an Express-based Web Socket server to which OSC messages will be relayed.
var appResources = __dirname + "/web",
	app = express(),
	server = app.listen(8081),
	wss = new WebSocket.Server({
		server: server,
	})

app.use("/", express.static(appResources))

wss.on("connection", function (socket) {
	console.log("A Web Socket connection has been established!")

	// Create an OSC WebSocket port for each connection
	var socketPort = new osc.WebSocketPort({
		socket: socket,
	})

	// Listen for messages on the WebSocket port
	socketPort.on("message", function (oscMessage) {
		console.log("Received OSC message from client:", oscMessage)

		// Transform the received message
		const transformedMessage = transformOSCMessage(oscMessage)

		console.log(
			"Sending transformed message",
			transformedMessage.address,
			transformedMessage.args,
			"to",
			udpPort.options.remoteAddress + ":" + udpPort.options.remotePort
		)

		// Send the transformed OSC message over UDP
		udpPort.send(transformedMessage)
	})

	// Log any errors that occur on the WebSocket port
	socketPort.on("error", function (error) {
		console.error("WebSocket port error:", error)
	})

	// Log when the WebSocket port is closed
	socketPort.on("close", function () {
		console.log("WebSocket port closed")
	})
})

function transformOSCMessage(oscMessage) {
	// Initialize an array to hold the transformed arguments
	const transformedArgs = []

	// Iterate over the original arguments and transform each one
	for (const arg of oscMessage.args) {
		transformedArgs.push({
			type: varType(arg), // Assuming all arguments are floats
			value: arg,
		})
	}

	// Create the transformed message object
	const transformedMessage = {
		address: oscMessage.address,
		args: transformedArgs,
	}

	return transformedMessage
}

function varType(variable) {
	if (typeof variable == "number") {
		if (variable % 1 === 0) {
			return "i"
		} else {
			return "f"
		}
	} else if (typeof variable == "string") {
		return "s"
	}
}
