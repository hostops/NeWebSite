/**
 * Enum for all kind of directions. 
 * @enum {number}
 */
const Direction = Object.freeze({
	/** Direction left. */
	LEFT: 0,
	/** Direction up. */
	UP:	1,
	/** Direction right. */
	RIGHT: 2,
	/** Direction down. */
	DOWN: 3,
	/** The entity is not moving */
	NOWHERE: 4,
	/**
	 * Get inverse direction of given direction
	 *
	 * @param {Direction} direction	Direction you want to find an inverse to 
	 */
	inverse: function(direction) {
		return (direction == Direction.NOWHERE) ? Direction.NOWHERE : (direction + 2) % 4;
	}
});

/**
 * Object for 'constants' about door. We do not freeze this object, because we allow user to set his own constants. 
 */
const DoorConstants = {
	/** Length of doors in percents */
	LENGTH: 0.1,
	/** Thickness of doors in percents */
	THICKNESS: 0.01,
	/** Maximum number of doors that can be placed in one room */
	MAX_NUMBER: 4
};

/**
 * Main game object that controlls user, gameplay, rooms.
 * 
 * @property {Room}	currentRoom Object of current displayed room.
 * @property {Room} lastRoom For purpose of changing room this holds last doors.
 * @property {Object} canvas Canvas where game is drawn.
 * @since 1.0.0
 */
class Game {
	
	/**
	 * Constructor for Game.
	 * 
	 * @param {Object} container Dom object where canvas should be placed. 
	 */
	constructor(container) {
		//HACK: Firefox min-body height depends on its content
		document.body.style.minHeight = "100vh";
		document.body.style.height = "100vh";

		this.container = container;
		this.canvas = document.createElement("canvas");
		container.appendChild(this.canvas);
		this.context = this.canvas.getContext("2d");

		// Resize canvas to fit inside container
		this.resizeCanvas();

		// If the container is resized, resize canvas accordingly
		this.container.onresize = function() {
			this.resizeCanvas();
		}.bind(this);

		// Add main room
		this.currentRoom = new Room(1);
	}

	/**
	 * Resize canvas to fit inside this.container
	 */
	resizeCanvas() {
		var containerSize = this.container.getBoundingClientRect();
		this.canvas.width = containerSize.width;
		this.canvas.height = containerSize.height;
	}

	/**
	 * Change current room. This function is called when user leaves current room. 
	 *
	 * @param {Room} room New room to be shown.
	 */
	changeCurrentRoom(room) {
		this.lastRoom = this.currentRoom;
		this.currentRoom = room;
	}
	
	/**
	 * Updates current room and all of its objects. 
	 * Function is called on animation frame.
	 */
	update() {
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
		this.currentRoom.draw(this.context, this.canvas.width, this.canvas.height);
		window.requestAnimationFrame(this.update.bind(this));
	}
}/**
 * Enum for moving type. 
 * @enum {number}
 */
const Moving = Object.freeze({
	/** Moving is changed by user request */
	FREE: 0,
	/** Random direction. */
	RANDOM:	1,
	/** Moving in vertical direction */
	VERTICAL: 2,
	/** Moving from in horizontal direction. */
	HORIZONTAL: 3,
	/** Following the user. */
	FOLLOWING: 4,
	/** Hiding from user, to be hard to catch. */
	HIDING: 5,
	/**  Item is not moving. */
	FIXED: 6
});

/**
 * Interface for items that are placed in room. 
 *
 * @property {number} width  Width of item in percents.
 * @property {number} height Height of item in percents.
 * @property {number} x      X coordinate of item in percents.
 * @property {number} y      Y coordinate of item in percents.
 * @property {Moving} moving Moving type of item.
 * @since 1.0.0
 */
class Item {
	
	/**
	 * Constructor of class Item
	 *
	 * @param {number} width  Width of item in percents.
	 * @param {number} height Height of item in percents. 
	 */
	constructor(width, height) {
		this.moving = Moving.RANDOM;
		this.width = width;
		this.height = height;
		this.x = 0;
		this.y = 0;
	}
	
	/**
	 * Places item in room.  It is called when we place
	 * item in room before first update call.
	 *
	 * @param {Room} room Room where item is located.
	 */
	place(room) {
		this.x = Math.random() * (room.size - this.width);
		this.y = Math.random() * (room.size - this.width);
	}
	
	/**
	 * Updates location and other properties of item.
	 * It is called on animation frame.
	 *
	 * @param {Room} room Room where item is located.
	 */
	update(room) {
	}
	
	/**
	 * Draws object on canvas.
	 * 
	 * @param {Object} context	2D context of Canvas
	 * @param {number} size		Size of canvas in pixels
	 */
	draw(context, size) {
		context.beginPath();
		context.fillRect(this.x * size, this.y * size, this.width * size, this.height * size)
		context.fill();
	}
}/**
 * Static object for logging data and errors.
 * It supports multiple levels of error logging.
 *
 * @since 1.0.0
 */
class Logger {

	/**
	 * Logs arguments received to console separated by spaces.
	 *
	 * @param {Array} args	Arguments to log to console
	 */
	static log(...args) {
		console.log("[LOG] " + args.join(": "));
	}

	/**
	 * Logs arguments received to console separated by spaces.
	 *
	 * @param {Array} args	Arguments to log to console
	 */
	static error(...args) {
		console.error("[ERROR] " + args.join(": "));
	}

	/**
	 * Logs arguments received to console separated by spaces.
	 *
	 * @param {Array} args	Arguments to log to console
	 */
	static debug(...args) {
		console.debug("[DEBUG] " + args.join(": "));
	}

	/**
	 * Logs arguments received to console separated by spaces.
	 *
	 * @param {Array} args	Arguments to log to console
	 */
	static info(...args) {
		console.info("[INFO] " + args.join(": "));
	}

	/**
	 * Logs arguments received to console separated by spaces.
	 *
	 * @param {Array} args	Arguments to log to console
	 */
	static warn(...args) {
		console.warn("[WARNING] " + args.join(": "));
	}

}/** 
 * Holds instance of main game.
 * 
 * @global
 * @type {Game}
 */
var mainGame;

/** 
 * Holds instance of first room created
 * @global
 * @type {Room}
 */
var mainRoom;

/**
 * Creates new game in body of document.
 */
document.addEventListener("DOMContentLoaded", startNewGame, false);

function startNewGame () {
	mainPlayer = Items.player();
	mainGame = new Game(document.body);
	mainRoom = mainGame.currentRoom;
	mainRoom.addItem(mainPlayer);
	window.requestAnimationFrame(mainGame.update.bind(mainGame));
	start();
}/**
 * Room class is one of main entities of the game. It contains items 
 * and is place where user can do all of his work (fight monsters, collect items, ...).
 * User can leave room with entering anotherone. 
 * 
 * @property {number} 						size	Size of room in percents of container size.
 * @property {Item[]} 						items	Array of items in room.
 * @property {Object.<Direction, Room[]>}	rooms	Rooms arranged by directions of current room.
 * @since 1.0.0
 */
class Room {
	
	/**
	 * Construction for Room.
	 *
	 * @param {number} [size = 1]	Size of room in percents.
	 */
	constructor(size = 1) {
		this.size = size;
		this.items = [];

		// Create array for each direction
		this.rooms = {};
	}
	
	/**
	 * Adds new item object in room. It places it in this.items array.
	 * 
	 * @param {Item} item Item to be placed in room.
	 */
	addItem(item) {
		this.items.push(item);
		item.place(this);
	}

	/**
	 * Removes item from room.
	 * @param {Item} item Item to be removed. 
	 */
	removeItem(item) {
		this.items.splice(this.items.indexOf(item), 1);
	}

	/**
	 * Connects this room with another room in specified direction.
	 * The room is placed in this.rooms object
	 * @param {Room} room				The room we want to connect to this room.
	 * @param {Direction} direction		The direction where we want to place the room.
	 * @param {function} [checkFunction]	Function that checks if player can move in room.
	 */
	addRoom(room, direction, checkFunction) {
		var inversedDirection = Direction.inverse(direction);
		// Exit if the rooms are already connected.
		if (direction in this.rooms && this.rooms[direction].indexOf(room) != -1) {
			Logger.info("Room already added.", room);
			return;
		}

		// If the direction or inversedDirection is not already in rooms, insert new empty array
		if (!(direction in this.rooms)) {
			this.rooms[direction] = [];
		}
		if (!(inversedDirection in room.rooms)) {
			room.rooms[inversedDirection] = [];
		}

		if (this.rooms[direction].length >= DoorConstants.MAX_NUMBER) {
			Logger.info("Too many doors in direction", direction);
		}
		if (room.rooms[inversedDirection].length >= DoorConstants.MAX_NUMBER) {
			Logger.info("Too many doors in direction", inversedDirection);
		}

		// Add room to array and add link to this room to other room too
		this.rooms[direction].push(room);
		room.rooms[inversedDirection].push(this);
		
	}

	/**
	 * Draws doors to other rooms specified in this.rooms
	 * @param {context} context	Canvas context to draw on
	 * @param {number} size		Size of canvas in pixels
	 */
	drawDoors(context, size) {
		// Draw doors
		var directions = Object.keys(this.rooms);
		directions.forEach(function(direction) {
			
			var doors = this.rooms[direction];
			var segmentLength = size / doors.length;

			var doorLength = DoorConstants.LENGTH * size;
			var doorThickness = DoorConstants.THICKNESS * size;

			for (var i = 0; i < doors.length; i++) {
				var centerOfSegment = (i * segmentLength) + (segmentLength / 2);

				var x, y, doorWidth, doorHeight;
				if (direction == Direction.UP || direction == Direction.DOWN) {
					x = centerOfSegment - doorLength / 2;
					y = (direction == Direction.DOWN) * (size - doorThickness);
					doorWidth = doorLength;
					doorHeight = doorThickness;
				} else {
					x = (direction == Direction.RIGHT) * (size - doorThickness);
					y = centerOfSegment - doorLength / 2;
					doorWidth = doorThickness;
					doorHeight = doorLength;
				}

				context.fillRect(x, y, doorWidth, doorHeight);
			}
		}.bind(this));
	}

	/**
	 * Returns center of the doors in specified direction and doors offset. 
	 * @param {Direction} direction 
	 * @param {Position} position 
	 */
	getDoorsCenter(direction, position) {
		var segmentLength = 1 / this.rooms[direction].length;
		return (position * segmentLength) + (segmentLength / 2)  - DoorConstants.LENGTH / 2
	}

	/**
	 * Draws room and all objects in the room.
	 * @param {context} context	Canvas context to draw on
	 * @param {number} width	Width of the canvas in pixels
	 * @param {number} height	Height of the canvas in pixels
	 */
	draw(context, width, height) {
		// Calculate room width
		var roomSize = Math.min(width, height) * this.size;
		
		var left = (width - roomSize) / 2;
		var top = (height - roomSize) / 2;

		// Draw room border
		context.lineWidth = 1;
		context.strokeRect(left, top, roomSize, roomSize);

		// Translate coordinate system, so that 0.0 in in top left corner of room
		context.translate(left, top);

		// Draw doors to other connected rooms
		this.drawDoors(context, roomSize);

		// Draw all items in room
		this.items.forEach(function(item) {
			item.update(this);
			item.draw(context, width < height ? widht : height);
		}.bind(this));

		// Remove translation
		context.translate(-left, -top);
	}

}/**
 * Class for main character. This type of item is moving by user input (keyboard arrows).
 *
 * @property {number} width  		Width of item in percents.
 * @property {number} height 		Height of item in percents.
 * @property {number} x      		X coordinate of item in percents.
 * @property {number} y      		Y coordinate of item in percents.
 * @property {Moving} moving 		Moving type of item.
 * @property {Direction} direction	Current direction of moving.
 * @extends {Item}
 * @since 1.0.0
 */
class Player extends Item {
	
	/**
	 * Constructor of class Player
	 *
	 * @param {number} width  Width of item in percents.
	 * @param {number} height Height of item in percents. 
	 */
	constructor(width, height) {
		super(width, height);
		this.moving = Moving.FREE;

		// Direction in which the player is moving
		this.direction = Direction.NOWHERE;
		this.lastRoom = null;
		// Event listeners for key 
		window.addEventListener("keydown", this.startUserAction.bind(this));
		window.addEventListener("keyup", this.endUserAction.bind(this));
	}

	/**
	 * User action event. Event is fired on keydown.
	 * @param {Object} event Event.
	 */
	startUserAction(event) {
		switch (event.keyCode) {
			case 37: this.direction = Direction.LEFT; break;
			case 38: this.direction = Direction.UP; break;
			case 39: this.direction = Direction.RIGHT; break;
			case 40: this.direction = Direction.DOWN; break;
		}
	}

	/**
	 * User action event. Event is fired on keyup.
	 * @param {Object} event Event.
	 */
	endUserAction(event) {
		if (event.keyCode == 37 && this.direction == Direction.LEFT ||
			event.keyCode == 38 && this.direction == Direction.UP ||
			event.keyCode == 39 && this.direction == Direction.RIGHT ||
			event.keyCode == 40 && this.direction == Direction.DOWN) {
			this.direction = Direction.NOWHERE;
		}
	}

	/** 
	 * Moves user in specified direction.
	 * @param {Direction} direction Direction to move to.
	 * @param {Room} room Room where item is located.
	 */
	moveUser(direction, room) {
		this.x -= (direction == Direction.LEFT) / 100;
		this.x += (direction == Direction.RIGHT) / 100;
		this.y += (direction == Direction.DOWN) / 100;
		this.y -= (direction == Direction.UP) / 100;

		// Limit with border of item.
		this.x = Math.min(room.size - this.width, Math.max(0, this.x));
		this.y = Math.min(room.size - this.height, Math.max(0, this.y));
	}

	/**
	 * Places item in room.  It is called when we place
	 * item in room before first update call. Item is placed in new room
	 *
	 * @param {Room} room Room where item is located.
	 */
	place(room) {
		if (mainGame.lastRoom == null) {
			super.place(room);
			return;
		}
		// Find doors of last room in new room.
		Object.keys(room.rooms).forEach(function(direction) {
			for (var i = 0; i < room.rooms[direction].length; i++) {
				if (room.rooms[direction][i] == mainGame.lastRoom){
					// Place it at the right position if user changes room
					var doorsCenter = room.getDoorsCenter(direction, i);
					if (direction == Direction.LEFT) {
						this.x = (DoorConstants.THICKNESS) * (room.size) + 0.01;
						this.y = doorsCenter * room.size; 
					} else if (direction == Direction.UP) {
						this.y = (DoorConstants.THICKNESS) * (room.size) + 0.01;
						this.x = doorsCenter * room.size; 
					} else if (direction == Direction.RIGHT) {
						this.x = (1 - DoorConstants.THICKNESS) * (room.size - this.width) - 0.01;
						this.y = doorsCenter * room.size; 
					} else if (direction == Direction.DOWN) {
						this.y = (1 - DoorConstants.THICKNESS) * (room.size - this.height) - 0.01;
						this.x = doorsCenter * room.size; 
					}  
					return;
				}
			}
		}.bind(this));
		
	}
	
	/**
	 * Updates location and other properties of user.
	 * It is called on animation frame.
	 *
	 * @param {Room} room Room where item is located.
	 */
	update(room) {
		this.moveUser(this.direction, room);

		// Check doors. 
		var xCenter = (this.x + this.width / 2);
		var yCenter = (this.y + this.height / 2);
		var directions = Object.keys(room.rooms);
		directions.forEach(function(direction) {
			var doors = room.rooms[direction];
			for (var i = 0; i < doors.length; i++) {
				var center = room.getDoorsCenter(direction, i);

				var xInDoors = center * room.size < xCenter && xCenter < (center + DoorConstants.LENGTH) * room.size;
				var yInDoors =  center * room.size < yCenter && yCenter < (center + DoorConstants.LENGTH) * room.size;

				if (direction == Direction.UP) {
					yInDoors = this.y < DoorConstants.THICKNESS;
				} else if (direction == Direction.DOWN) {
					yInDoors = this.y + this.height > room.size - DoorConstants.THICKNESS;
				} else if (direction == Direction.RIGHT) {
					xInDoors = this.x + this.width > room.size - DoorConstants.THICKNESS;
				} else if (direction == Direction.LEFT) {
					xInDoors = this.x < DoorConstants.THICKNESS;
				}

				if (xInDoors && yInDoors) {
					// Change room
					mainGame.currentRoom.removeItem(this);
					mainGame.changeCurrentRoom(doors[i]);
					
					mainGame.currentRoom.addItem(this);
				}
			}
		}.bind(this));
	}
	
	
	/**
	 * Draws object on canvas.
	 * 
	 * @param {Object} context	2D context of Canvas
	 * @param {number} size		Size of canvas in pixels
	 */
	draw(context, size) {
		super.draw(context, size);
	}
}/**
 * Class for main character. This type of item is moving by user input (keyboard arrows).
 *
 * @property {number} width  		Width of item in percents.
 * @property {number} height 		Height of item in percents.
 * @property {number} x      		X coordinate of item in percents.
 * @property {number} y      		Y coordinate of item in percents.
 * @property {Moving} moving 		Moving type of item.
 * @property {Direction} direction	Current direction of moving.
 * @extends {Item}
 * @since 1.0.0
 */
class RestartGameButton extends Item {

    /**
     * Constructor of class Player
     *
     * @param {number} width  Width of item in percents.
     * @param {number} height Height of item in percents. 
     */
    constructor(width, height) {
        super(width, height);
        this.moving = Moving.FIXED;
    }
    /**
     * Places item in room.  It is called when we place
     * item in room before first update call. Item is placed in new room
     *
     * @param {Room} room Room where item is located.
     */
    place(room) {
        this.x = room.size / 2 - this.width / 2;
        this.y = room.size - this.height;
    }

    /**
     * Updates location and other properties of user.
     * It is called on animation frame.
     *
     * @param {Room} room Room where item is located.
     */
    update(room) {
        if (room.items.indexOf(mainPlayer) != -1) {
            if (this.x < mainPlayer.x + mainPlayer.width / 2 && mainPlayer.x + mainPlayer.width / 2 < this.x + this.width &&
                this.y < mainPlayer.y + mainPlayer.height / 2 && mainPlayer.x + mainPlayer.height / 2 < this.y + this.height) {
                // Remove old game.
                window.removeEventListener("keydown", mainPlayer.startUserAction);
                window.removeEventListener("keyup", mainPlayer.endUserAction);
                document.body.removeChild(document.querySelector("canvas"));
                // Start new game.
                startNewGame();
            }
        }
    }


	/**
	 * Draws button on canvas.
	 * 
	 * @param {Object} context	2D context of Canvas
	 * @param {number} size		Size of canvas in pixels
	 */
	draw(context, size) {
        //Draw button
        context.fillStyle="#080";
        context.beginPath();
		context.fillRect(this.x * size, this.y * size, this.width * size, this.height * size)
        context.fill();
        
        //Draw text
        context.font = "10px Tahoma";
        context.fillStyle="#000";
        context.fillText("Try again!", this.x * size + (this.width * size) / 2, this.y * size + (this.height * size) / 2); 
	}
}/**
 * Game over room or game over screen is type of room without exit and with big title game over and try again door. 
 * 
 * @property {number} size	Size of room in percents of container size.
 * @property {Item[]} items	Array of items in room.
 * @property {Object.<Direction, Room[]>} rooms	Rooms arranged by directions of current room.
 * @extends {Room}
 * @since 1.0.0
 */
class GameOverRoom extends Room {
	
	/**
	 * Construction for Room.
	 *
	 * @param {number} [size = 1]	Size of room in percents.
	 */
	constructor(size = 1) {
		super(size);
		this.addItem(Items.restartGameButton());
	}

	/**
	 * Draws room and all objects in the room.
	 * @param {context} context	Canvas context to draw on
	 * @param {number} width	Width of the canvas in pixels
	 * @param {number} height	Height of the canvas in pixels
	 */
	draw(context, width, height) {
		this.rooms = {}; // There is no escape from this room. 
		// Calculate room width
		var roomSize = Math.min(width, height) * this.size;
		
		var left = (width - roomSize) / 2;
		var top = (height - roomSize) / 2;

		// Draw room border
		context.lineWidth = 1;
		context.strokeRect(left, top, roomSize, roomSize);

		// Translate coordinate system, so that 0.0 in in top left corner of room
		context.translate(left, top);

		// Draw doors to other connected rooms
		this.drawDoors(context, roomSize);

		// Draw all items in room
		this.items.forEach(function(item) {
			item.update(this);
			item.draw(context, width < height ? widht : height);
		}.bind(this));

		context.font = "30px Tahoma";
		context.fillStyle="#800";
		context.textAlign = 'center';
		context.fillText("GAME OVER!", roomSize/2, roomSize/2); 
		context.fillStyle="#000";

		// Remove translation
		context.translate(-left, -top);
	}

}/**
 * Helper and object factory for all kind of items that can be put in rooms.
 *
 * @since 1.0.0
 */
class Items {
	
	/**
	 * Creates instance of type player.
	 * 
	 * @param {number} [width = 10]	Width of player in percents (form 0 % to 100 %).
	 * @param {number} [height = 10]	Height of player in percents (form 0 % to 100 %).
	 * @returns {Player} Instance of player.
	 */
	static player(width = 5, height = 5) {
		return new Player(width / 100, height / 100);
	}

	/**
	 * Creates instance of type AngryRobot.
	 * 
	 * @returns {AngryRobot} Instance of AngryRobot.
	 */
	static angryRobot() {
		return new AngryRobot();
	}
	
	/**
	 * Creates instance of type Helper.
	 *
	 * @returns {Helper} Instance of Helper.
	 */
	static helper() {
		return new Helper();
	}
	
	/**
	 * Creates instance of type Bonus.
	 *
	 * @returns {Bonus} Instance of Bonus.
	 */
	static bonus() {
		return new Bonus();
	}

	/**
	 * Creates instance of RestartGameButton.
	 * @param {number} [width = 10]	Width of button in percents (form 0 % to 100 %).
	 * @param {number} [height = 10] Height of button in percents (form 0 % to 100 %).
	 * @returns {Bonus} Instance of RestartGameButton.
	 */
	static restartGameButton(width = 10, height = 5) {
		return new RestartGameButton(width / 100, height / 100);
	}
}/**
 * Helper and object factory for Rooms.
 *
 * @since 1.0.0
 */
class Rooms {
    
    /**
     * Creates new Room.
     * 
     * @param {number} [size = 100] Size of room in percents. 
     * @returns New instance of Room.
     */
    static room(size = 100){
        return new Room(size/100);
    }
    /**
     * Creates new game over room.
     * 
     * @param {number} [size = 100] Size of game over room in percents. 
     * @returns New instance of GameOverRoom.
     */
    static gameOverRoom(size = 100) {
        return new GameOverRoom(size/100);
    }
}

/** Extention method for end user on class Room **/

/**
* Creates new room and moves it to the up of this room.
* 
* @param {number} [size = 100]	Size of room in percents (from 0% to 100%).
* @returns {Room} New room.
*/
Room.prototype.newUpRoom = function newUpRoom(size = 100) {
    var room = Rooms.room(size);
    this.addRoom(room, Direction.UP);
    return room;
 }

 /**
 * Creates new room and moves it to the right of this room.
 * 
 * @param {number} [size = 100]	Size of room in percents (from 0% to 100%).
 * @returns {Room} New room.
 */
Room.prototype.newRightRoom = function newRightRoom(size = 100) {
    var room = Rooms.room(size);
    this.addRoom(room, Direction.RIGHT);
    return room;
 }

 /**
 * Creates new room and moves it to the down of this room.
 * 
 * @param {number} [size = 100]	Size of room in percents (from 0% to 100%).
 * @returns {Room} New room.
 */
Room.prototype.newDownRoom = function newDownRoom(size = 100) {
    var room = Rooms.room(size);
    this.addRoom(room, Direction.DOWN);
    return room;
 }

/**
* Creates new room and moves it to the left of this room.  
* 
* @param {number} [size = 100]	Size of room in percents (from 0% to 100%).
* @returns {Room} New room.
*/
Room.prototype.newLeftRoom = function newLeftRoom(size = 100) {
    var room = Rooms.room(size);
    this.addRoom(room, Direction.LEFT);
    return room;
}   
