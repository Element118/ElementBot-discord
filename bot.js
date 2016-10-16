var Discord = require("discord.js");
var bot = new Discord.Client();
var Command = function(config) {
	this.word = config.word;
	this.execute = config.execute || function(message, parsedMessage) { send(message, "Not implemented yet."); };
	this.description = config.description || "No description available."
};
Command.prefix = "~";
Command.check = function(command) {
	return Command.prefix == command.substr(0, Command.prefix.length);
};
var send = function(message, toSend) {
	message.channel.sendMessage(toSend).then(function() {
		console.log("Message sent.");
	}).catch(function() {
		console.log("Failed to send message.");
	});
}
var parseTime = function(milliseconds) {
	var seconds = Math.floor(milliseconds/1000); milliseconds %= 1000;
	var minutes = Math.floor(seconds/60); seconds %= 60;
	var hours = Math.floor(minutes/60); minutes %= 60;
	var days = Math.floor(hours/24); hours %= 24;
	var written = false;
	return (days?(written=true,days+" days"):"")+(written?", ":"")
		+(hours?(written=true,hours+" hours"):"")+(written?", ":"")
		+(minutes?(written=true,minutes+" minutes"):"")+(written?", ":"")
		+(seconds?(written=true,seconds+" seconds"):"")+(written?", ":"")
		+(milliseconds?milliseconds+" milliseconds":"");
};
var evaluationMemory = {}; // limited to 1024 characters per string.
var safeFunctions = {
	"+": { arity: 2, run: function(a, b) { return a+b; }, toString: function() { return "add"; } },
	"-": { arity: 2, run: function(a, b) { return a-b; }, toString: function() { return "subtract"; } },
	"*": { arity: 2, run: function(a, b) { return a*b; }, toString: function() { return "multiply"; } },
	"/": { arity: 2, run: function(a, b) { return a/b; }, toString: function() { return "divide"; } },
	"%": { arity: 2, run: function(a, b) { return a%b; }, toString: function() { return "modulus"; } },
	"^": { arity: 2, run: function(a, b) { return a^b; }, toString: function() { return "xor"; } },
	"&": { arity: 2, run: function(a, b) { return a&b; }, toString: function() { return "bitwise and"; } },
	"|": { arity: 2, run: function(a, b) { return a|b; }, toString: function() { return "bitwise or"; } },
	"!": { arity: 1, run: function(a) { return !a; }, toString: function() { return "logical not"; } },
	"~": { arity: 1, run: function(a) { return ~a; }, toString: function() { return "bitwise not"; } },
	"substring": { arity: 3, run: function(a, b, c) { return a.substring(b, c); }, toString: function() { return "substring"; } },
	"substr": { arity: 3, run: function(a, b, c) { return a.substr(b, c); }, toString: function() { return "substr"; } },
	"true": { arity: 0, run: function() { return true; }, valueOf: function() { return 1; }, toString: function() { return "true"; } },
	"false": { arity: 0, run: function() { return false; }, valueOf: function() { return 0; }, toString: function() { return "false"; } },
	"=": { arity: 2, run: function(a, b) {
		if (typeof b == "string") b = b.substr(0, 1024);
		return evaluationMemory[a] = b;
	}, toString: function() { return "assign"; } },
	"get": { arity: 1, run: function(a) { return evaluationMemory[a]; }, toString: function() { return "get"; } },
	",": { arity: 2, run: function(a, b) { return b; }, toString: function() { return "comma"; } },
	"pow": { arity: 2, run: function(a, b) { return Math.pow(a, b); }, toString: function() { return "power"; } },
	"sin": { arity: 1, run: function(a) { return Math.sin(a); }, toString: function() { return "sin"; } },
	"cos": { arity: 1, run: function(a) { return Math.cos(a); }, toString: function() { return "cos"; } },
	"tan": { arity: 1, run: function(a) { return Math.tan(a); }, toString: function() { return "tan"; } },
	"asin": { arity: 1, run: function(a) { return Math.asin(a); }, toString: function() { return "asin"; } },
	"acos": { arity: 1, run: function(a) { return Math.acos(a); }, toString: function() { return "acos"; } },
	"atan": { arity: 1, run: function(a) { return Math.atan(a); }, toString: function() { return "atan"; } },
	"atan2": { arity: 2, run: function(a, b) { return Math.atan2(a, b); }, toString: function() { return "atan2"; } },
	"pi": { arity: 0, run: function() { return Math.PI; }, toString: function() { return "pi"; } },
	"e": { arity: 0, run: function() { return Math.E; }, toString: function() { return "e"; } },
	"round": { arity: 1, run: function(a) { return Math.round(a); }, toString: function() { return "round"; } },
	"floor": { arity: 1, run: function(a) { return Math.floor(a); }, toString: function() { return "floor"; } },
	"ceil": { arity: 1, run: function(a) { return Math.ceil(a); }, toString: function() { return "ceil"; } },
	"abs": { arity: 1, run: function(a) { return Math.ceil(a); }, toString: function() { return "abs"; } },
	"sqrt": { arity: 1, run: function(a) { return Math.ceil(a); }, toString: function() { return "sqrt"; } },
	"random": { arity: 0, run: function() { return Math.random(); }, toString: function() { return "random"; } },
	"space": { arity: 0, run: function() { return " "; }, toString: function() { return "space"; } },
};
// Reverse polish interpreter. Simple.
var evaluate = function(code) {
	var tokens = code.split(" ");
	var stack = [];
	evaluationMemory = {}; // clean memory
	for (var i=0;i<tokens.length;i++) {
		if (tokens[i] !== "") {
			if (!isNaN(tokens[i])) {
				stack.push(+tokens[i]); // convert to number
			} else if (safeFunctions[tokens[i]]) {
				var f = safeFunctions[tokens[i]];
				var stk = [];
				var args = [];
				if (stack.length < f.arity) {
					stack.push(f.toString());
					continue;
					/**return {
						message: "Oops. Evaluation failed.",
						stack: stack,
						commandsLeft: tokens.slice(i)
					};**/
				}
				for (var j=0;j<f.arity;j++) {
					stk.push(stack.pop());
				}
				while (stk.length) {
					args.push(stk.pop());
				}
				stack.push(f.run.apply(null, args));
			} else {
				stack.push(tokens[i]); // it's a string!
			}
		}
	}
	return {
		stack: stack
	};
};
var memory = {}; // for remember and recall
var accessedMemory = {};
var commands = [
	new Command({
		word: "help",
		description: "Need help?",
		execute: function(message, parsedMessage) {
			if (parsedMessage === "") {
				var helpText = "Here are the commands you can use:\n```";
				helpText += Command.prefix + commands[0].word;
				for (var i=1;i<commands.length;i++) {
					helpText += ", " + Command.prefix + commands[i].word;
				}
				helpText += "```\nSay `~help command` to get help about a specific command.";
				send(message, helpText);
			} else {
				for (var i=0;i<commands.length;i++) {
					if (parsedMessage === commands[i].word) {
						send(message, commands[i].word + ": " + commands[i].description);
						return; // done
					}
				}
				// command not found
				send(message, "Sorry. I do not know that command.");
			}
		}
	}), new Command({
		word: "echo",
		description: "A test command to repeat what you say.",
		execute: function(message, parsedMessage) {
			send(message, parsedMessage);
		}
	}), new Command({
		word: "apologise",
		description: "A test command to apologise. In case the bot is acting up.",
		execute: function(message, parsedMessage) {
			send(message, "Sorry.");
		}
	}), new Command({
		word: "periodictable",
		description: "Well, I won't be an ElementBot if I didn't know this.",
		execute: function(message, parsedMessage) {
			send(message, "Earth, Fire, Air, Water\n...wait, are these the wrong elements?");
		}
	}), new Command({
		word: "thanks",
		description: "Did I make your day?",
		execute: function(message, parsedMessage) {
			send(message, "You are welcome.");
		}
	}), new Command({
		word: "exit",
		description: "Erm...this is embarrassing...",
		execute: function(message, parsedMessage) {
			if (message.author.username === "Element118") {
				message.channel.sendMessage("Goodbye.").then(function() {
					console.log("Goodbye.");
					process.exit(0);
				}).catch(function() {
					console.log("What? I'm still here!");
				});
			} else {
				send(message, "Are you embarrassed now!?");
			}
		}
	}), new Command({
		word: "tsundere",
		description: "Baka! Why are you using this command?",
		execute: function(message, parsedMessage) {
			send(message, "Baka! Why are you using this command? You know it does nothing, don't you?");
		}
	}), new Command({
		word: "uptime",
		description: "I'm just waiting...",
		execute: function(message, parsedMessage) {
			send(message, "I have existed here continually for "+parseTime(bot.uptime));
		}
	}), new Command({
		word: "time",
		description: "Need to know the time?",
		execute: function(message, parsedMessage) {
			send(message, "The time now is: " + new Date().toUTCString());
		}
	}), new Command({
		word: "author",
		description: "Of course Element118 programmed me.",
		execute: function(message, parsedMessage) {
			send(message, "Visit their profile here: https://www.khanacademy.org/profile/Element118"
				+"\nAlso, you can subscribe here: https://www.khanacademy.org/computer-programming/-/4642089130393600");
		}
	}), new Command({
		word: "ping",
		description: "Ping for fun!",
		execute: function(message, parsedMessage) {
			send(message, "pong");
		}
	}), new Command({
		word: "random",
		description: "Can't decide which command? This command allows you to execute any command! How fun is that?",
		execute: function(message, parsedMessage) {
			var randomCommand = commands[Math.floor(Math.random()*commands.length)];
			message.channel.sendMessage(Command.prefix + randomCommand.word).then(function() {
				console.log("Let the randomness go!");
			}).catch(function() {
				console.log("Oops. We failed at random.");
			});
		}
	}), new Command({
		word: "eval",
		description: (function() {
			var answer = "Evaluate some postfix code! Here there be commands:\n";
			for (var i in safeFunctions) {
				answer += i + " with arity " + safeFunctions[i].arity + "\n";
			}
			answer += "Try `~eval 1 1 +` for 1+1, `~eval hello world +` for helloworld.";
			return answer;
		})(),
		execute: function(message, parsedMessage) {
			// code in parsedMessage
			var result = evaluate(parsedMessage);
			if (result.error) {
				send(message, result.error + "\nStack:" + result.stack.join(",") + "\nCommands left:" + result.commandsLeft.join(","));
			} else {
				send(message, "Your code evaluates to: " + result.stack.join(","));
			}
		}
	}), new Command({
		word: "remember",
		description: "Remember something. Used with ~recall to retrieve it back.\nSyntax: ~remember identifier data",
		execute: function(message, parsedMessage) {
			var tokens = parsedMessage.split(" ");
			memory[tokens[0]] = tokens.slice(1).join(" ");
			send(message, "Stored: " + memory[tokens[0]]);
		}
	}), new Command({
		word: "recall",
		description: "Recall something you told me to ~remember.\nSyntax: ~recall identifier",
		execute: function(message, parsedMessage) {
			if (accessedMemory[parsedMessage]) {
				send(message, "Oops, we are in a loop!");
				accessedMemory = {}; // allow for more loops?
			} else {
				send(message, memory[parsedMessage]);
				if (message.author.client === bot) accessedMemory[parsedMessage] = true;
			}
		}
	}), new Command({
		word: "clear",
		description: "Clears messages. Especially bot spam.",
		execute: function(message, parsedMessage) {
			if (message.author.username === "Element118") {
				// Credit to Eytukan
				let messageCount = parseInt(parsedMessage);
				message.channel.fetchMessages({limit: messageCount}).then(messages => message.channel.bulkDelete(messages)).catch(function() {
					console.log("Failed to clear.");
				});
			} else {
				send(message, "Only Element118 can do this.");
			}
		}
	})
];
commands.sort(function(a, b) {
	if (a.word < b.word) return -1;
	if (a.word > b.word) return 1;
	return 0;
});
var detectCommand = function(message) {
	var tokens = message.content.split(" ");
	if (!Command.check(tokens[0])) return;
	var restOfMessage = tokens.slice(1).join(" ");
	for (var i=0;i<commands.length;i++) {
		if (tokens[0] === Command.prefix + commands[i].word) {
			commands[i].execute(message, restOfMessage);
			return true;
		}
	}
	send(message, "Sorry, that was not a valid command.");
	return false;
};
bot.login("[TOKEN REDACTED]").then(function() {
	console.log("Logged in!");
	bot.on("message", function(message) {
		detectCommand(message);
	});
}).catch(function() {
	console.log("Cannot log in!");
});
