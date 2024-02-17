// Create an instance of WebSocketPort
var oscPort = new osc.WebSocketPort({
	url: "ws://localhost:8081",
})

// Listen for events
oscPort.on("open", function () {
	console.log("WebSocket connection opened")
})
/*
oscPort.on("data", function (data) {
	console.log("Received data:", data)
	// Parse and handle the received OSC data
})
*/
oscPort.on("message", function (oscMessage) {
	console.log("message", oscMessage)
})

oscPort.on("ready", function () {
	setInterval(function () {
		var msg = {
			address: "/hello/from/oscjs",
			args: [
				{ type: "f", value: Math.random() },
				{ type: "f", value: Math.random() },
			],
		}

		//console.log("Sending message", msg.address, msg.args)

		//oscPort.send(JSON.stringify(msg)) // Sending as JSON string
		oscPort.send(msg)
	}, 1000)
})

oscPort.on("close", function () {
	console.log("WebSocket connection closed")
})

oscPort.on("error", function (error) {
	console.error("WebSocket error:", error)
})

// Open the WebSocket connection
oscPort.open()
