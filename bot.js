var Discord = require("discord.js");
var evaluator = require("./evaluator");
var pt = require("./periodicTable");
var fs = require('fs');
var zeroWidthSpace = "\u200b"; // at front of safe bot things
var token = "";
// get token from other file
fs.readFile(__dirname + "/token.txt", "utf8", function (err, data) {
	if (err) {
		return console.log(err);
	}
	token = data;
	console.log("Obtained token!");
	bot.login(token).then(function() {
		console.log("Logged in!");
		bot.on("message", function(message) {
			detectCommand(message);
		});
		/*bot.setStatus("online", "with generic games", function(err) {
			console.log("Failed to play game.");
		});*/
	}).catch(function(err) {
		console.log("Cannot log in!");
		console.log(err);
	});
});
// get memory from file
var memory = {}; // for remember and recall
fs.readFile(__dirname + "/memory.txt", "utf8", function(err, data) {
	if (err) {
		return console.log(err);
	}
	var tokens = data.split("\n");
	for (var i=0;i<tokens.length;i++) {
		if (tokens[i] !== "") {
			var spaceTokens = tokens[i].split(" ");
			memory[spaceTokens[0]] = spaceTokens.slice(1).join(" ").replace("\\n", "\n");
		}
	}
	console.log("Obtained memory!");
});

process.stdin.on('data', function(data) {
	data = (data+"").trim();
	if (data == "exit" || data == "logout") {
		console.log("Trying to save...");
		var memoryString = "";
		for (var i in memory) {
			if (i && memory[i]) {
				memoryString += i+" "+memory[i].replace("\n", "\\n")+"\n";
			}
		}
		fs.writeFile(__dirname + "/memory.txt", memoryString, function(err) {
			if (err) {
				console.log(err);
				return;
			}
			console.log("Done!");
			process.exit();
		});
	} else {
		console.log("Noted "+data.length+" characters: \""+data+"\".");
	}
});

var bot = new Discord.Client();
var Command = function(config) {
	this.word = config.word;
	this.execute = config.execute || function(message, parsedMessage) { send(message, "Not implemented yet."); };
	this.description = config.description || "No description available."
};
Command.prefix = "~E~"; //"@ElementBot#1420 "; // best prefix
Command.check = function(command) {
	return command.startsWith(Command.prefix);
};
var send = function(message, toSend) {
	message.channel.sendMessage(toSend).then(function() {
		console.log("Message sent.");
	}).catch(function() {
		console.log("Failed to send message.");
	});
};
var sendDM = function(message, toSend) {
	message.author.sendMessage(toSend).then(function() {
		console.log("DM sent.");
	}).catch(function() {
		console.log("Failed to send DM.");
	});
};
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
				helpText += "```\nSay `"+Command.prefix+"help command` to get help about a specific command.";
				sendDM(message, helpText); // send help as DM
			} else {
				for (var i=0;i<commands.length;i++) {
					if (parsedMessage === commands[i].word) {
						sendDM(message, Commands.prefix + commands[i].word + ": " + commands[i].description);
						return; // done
					}
				}
				// command not found
				sendDM(message, "Sorry. I do not know that command.");
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
			var el = pt.getElement(parsedMessage);
			if (el) {
				send(message, pt.parseElement(el));
			} else {
				send(message, "Try typing the name of an element, the symbol or the atomic number.");
			}
		}
	}), new Command({
		word: "thanks",
		description: "Did I make your day?",
		execute: function(message, parsedMessage) {
			sendDM(message, "You are welcome.");
		}
	}), new Command({
		word: "tsundere",
		description: "Baka! Why are you using this command?",
		execute: function(message, parsedMessage) {
			sendDM(message, "Baka! Why are you using this command? You know it does nothing, don't you?");
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
			sendDM(message, "Visit their profile here: https://www.khanacademy.org/profile/Element118"
				+"\nAlso, you can subscribe here: https://www.khanacademy.org/computer-programming/-/4642089130393600");
		}
	}), new Command({
		word: "github",
		description: "Oh, you want to know more about me? I'm flattered...",
		execute: function(message, parsedMessage) {
			sendDM(message, "Visit me on GitHub: https://github.com/Element118/ElementBot-discord/tree/master");
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
			for (var i in evaluator.safeFunctions) {
				answer += i + " with arity " + evaluator.safeFunctions[i].arity + "\n";
			}
			answer += "Try `"+Command.prefix+"eval 1 1 +` for 1+1, `"+Command.prefix+"eval hello world +` for helloworld.";
			return answer;
		})(),
		execute: function(message, parsedMessage) {
			// code in parsedMessage
			var result = evaluator.evaluate(parsedMessage);
			if (result.error) {
				send(message, result.error + "\nStack:" + result.stack.join(",") + "\nCommands left:" + result.commandsLeft.join(","));
			} else {
				send(message, "Your code evaluates to: " + result.stack.join(","));
			}
		}
	}), new Command({
		word: "remember",
		description: "Remember something. Used with "+Command.prefix+"recall to retrieve it back.\nSyntax: "+Command.prefix+"remember identifier data",
		execute: function(message, parsedMessage) {
			var tokens = parsedMessage.split(" ");
			memory[tokens[0]] = tokens.slice(1).join(" ").substring(0, 64); // prevent too much echo spam
			message.channel.sendMessage("Stored: " + memory[tokens[0]]).then(function() {
				console.log("memory."+tokens[0]+" = "+memory[tokens[0]]);
			}).catch(function() {
				console.log("Memory not modified.");
			});
		}
	}), new Command({
		word: "recall",
		description: "Recall something you told me to "+Command.prefix+"remember.\nSyntax: "+Command.prefix+"recall identifier",
		execute: function(message, parsedMessage) {
			if (message.author.client !== bot) accessedMemory = {}; // allow for more loops
			if (accessedMemory[parsedMessage]) {
				send(message, "Oops, we are in a loop!");
				accessedMemory = {}; // allow for more loops
			} else {
				send(message, memory[parsedMessage]);
				if (message.author.client === bot) accessedMemory[parsedMessage] = true;
			}
		}
	}), new Command({
		word: "clear",
		description: "Clears messages. Especially bot spam.",
		execute: function(message, parsedMessage) {
			// Credit to Eytukan
			if (message.author.id === "104219409991626752") {
				let messageCount = parseInt(parsedMessage);
				message.channel.fetchMessages({limit: messageCount}).then(messages => message.channel.bulkDelete(messages)).catch(function(error) {
					console.log("Failed to fetch.");
					console.log(error);
				});
			} else {
				sendDM(message, "Shhh, only Element118 can do this. Don't tell anyone.");
			}
		}
	}), new Command({
		word: "tellme",
		description: "Legacy DM test. Left it here for fun.",
		execute: function(message, parsedMessage) {
			sendDM(message, "You are beautiful. Don't let anyone tell you otherwise.");
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
	var commandSpaces = Command.prefix.length - Command.prefix.replace(" ", "").length;
	var instruction = tokens.slice(0, commandSpaces+1).join(" ");
	if (!Command.check(instruction)) return;
	var restOfMessage = tokens.slice(commandSpaces+1).join(" ");
	for (var i=0;i<commands.length;i++) {
		if (instruction === Command.prefix + commands[i].word) {
			commands[i].execute(message, restOfMessage);
			return true;
		}
	}
	send(message, "Sorry, that was not a valid command.");
	return false;
};
