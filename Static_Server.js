//CODE WRITTEN BY IBRAHIM HELMY AND ALEX PATEL 


// These are like import statements in java (equal to var in order to import)
var http = require('http'); // http library: module related to servers
var url = require('url');   // URL library: for parces the URL
var fs = require('fs');     // fs Library: that Opens and reads files
var io = require("socket.io")();

var ROOT_DIR = 'data';// addresses to the folders where the data is contained

var canvasWidth = 1600;
var canvasHeight = 800;

var person = [];
person.push({id: "", name: "Unused", x: canvasWidth/4, y: canvasHeight/4, size: 25, speed: 3});
person.push({id: "", name: "Unused", x: canvasWidth - canvasWidth/4, y: canvasHeight/4, size: 25, speed: 3});
person.push({id: "", name: "Unused", x: canvasWidth - canvasWidth/4, y: canvasHeight - canvasHeight/4, size: 25, speed: 3});

var bullet = [];

var blocks = [];
blocks.push({x: canvasWidth/2 - 50, y: 200, width: 100, height: canvasHeight - 400});
blocks.push({x: 200, y: canvasHeight/2 - 50, width: canvasWidth - 400, height: 100});
blocks.push({x: canvasWidth/2 - 400, y: 0, width: 800, height: 100});
blocks.push({x: 100, y: canvasHeight - 200, width: 250, height: 100});
blocks.push({x: canvasWidth/2 + 200, y: canvasHeight/2 + 150, width: 50, height: 225});
blocks.push({x: canvasWidth - 200, y: 150, width: 50, height: 50});
blocks.push({x: canvasWidth - 200, y: canvasHeight - 200, width: 50, height: 50});
//blocks.push({x: canvasWidth - 400, y: canvasHeight - 100, width: 50, height: 50});
//blocks.push({x: canvasWidth - 200, y: canvasHeight - 100, width: 50, height: 50});



var EXT_TYPES = { // small array containing the many extension types we use.
    'css': 'text/css',
    'gif': 'image/gif',
    'htm': 'text/html',
    'html': 'text/html',
    'ico': 'image/x-icon',
    'jpeg': 'image/jpeg',
    'jpg': 'image/jpeg',
    'js': 'application/javascript', 
    'json': 'application/json',
    'png': 'image/png',
    'txt': 'text/text'
}

var get_ext = function(filename){  // gets the extensions from above
    for (var ext in EXT_TYPES){    // For every extension in the array 
        var type = EXT_TYPES[ext]; // it sets the return type to the type specified to the extension at that spesific index
        if (filename.indexOf(ext, filename.length - ext.length) !== -1) return type; // if it finds the extension in the filename it will return that extension
    } // find ext in, filename - extention and check to see if the extension of the file matches the extension type of the index in the array
    return EXT_TYPE['txt'];       // returns txt if it did not find it
}

var server = http.createServer(function(request, response){ // Craetes the server

    var path = url.parse(request.url).pathname; // it gives it useful properties such as:

    console.log('Path: ' + path);      // The pathname of the file the user is looking for
    console.log('Method: ' + request.method);      // Which method the request came from (get, post, etc.)

    if(request.method == 'GET'){                            // If the request type was of type GET

        fs.readFile(ROOT_DIR + path, function(err, data){          // it reads the file if found 
            if (err){                                       // otherwise an error is produced
                console.log('Get Error: ' + err);

                response.writeHead(404);
                response.end(JSON.stringify(err));
            } else {
                response.writeHead(200, {'Content-Type': get_ext(path)});
                response.end(data);
            }
        });
    }

});                                            // listens for user requests at port 3000
server.listen(3000);

//io.serveClient(true);
io.attach(server);

io.on("connection", function(socket){
    console.log("User " + socket.id + " connected");
    socket.emit("syncData", JSON.stringify({arr: person, arrTwo: bullet, arrThree: blocks}));

    socket.on("requestControl", function(data){
        var dataObj = JSON.parse(data);
        console.log("User " + socket.id + ", requestControl: " + dataObj.controlName);
        if (dataObj.controlName == "red"){
            if (person[0].id == ""){
                for (var i in person){
                    if (socket.id == person[i].id){
                        person[i].id = "";
                        person[i].name = "Unused";
                    }
                }
                person[0].id = socket.id;
                person[0].name = dataObj.name;
            }
        } else if (dataObj.controlName == "green"){
            if (person[1].id == ""){
                for (var i in person){
                    if (socket.id == person[i].id){
                        person[i].id = "";
                        person[i].name = "Unused";
                    }
                }
                person[1].id = socket.id;
                person[1].name = dataObj.name;
            }
        } else if (dataObj.controlName == "blue"){
            if (person[2].id == ""){
                for (var i in person){
                    if (socket.id == person[i].id){
                        person[i].id = "";
                        person[i].name = "Unused";
                    }
                }
                person[2].id = socket.id;
                person[2].name = dataObj.name;
            }
        }
        io.emit("updateControl", JSON.stringify({arr: person}));
    });

    socket.on("requestPositionUpdate", function(data){
        var dataObj = JSON.parse(data);
        for (var i in person){
            if (socket.id == person[i].id){
                person[i] = dataObj.arr[i];

                io.emit("updatePosition", JSON.stringify({arr: person}));
            }
        }
    });

    socket.on("requestBulletPositionUpdate", function(data){
        var dataObj = JSON.parse(data);
        bullet = dataObj.arr;
    });


    socket.on("disconnect", function(){
        for (var i in person){
            if (socket.id == person[i].id){
                person[i].id = "";
                person[i].name = "Unused";
            }
        }
        io.emit("updateControl", JSON.stringify({arr: person}));
        console.log("User " + socket.id + " disconnected");
    });
});

setInterval(function (){

    for (var i in bullet){
        bullet[i].x += bullet[i].speedX;
        bullet[i].y += bullet[i].speedY;

        if (bullet[i].x < 0 || bullet[i].x > canvasWidth){
            bullet[i].speedX = -(bullet[i].speedX);
        }
        if (bullet[i].y < 0 || bullet[i].y > canvasHeight){
            bullet[i].speedY = -(bullet[i].speedY);
        }

        for (var j in blocks){
            if (bullet[i].x > blocks[j].x && bullet[i].x < blocks[j].x + blocks[j].width && bullet[i].y > blocks[j].y && bullet[i].y < blocks[j].y + blocks[j].height){
                if (Math.abs(bullet[i].x - blocks[j].x) <= Math.abs(bullet[i].speedX) || Math.abs(bullet[i].x - (blocks[j].x + blocks[j].width)) <= Math.abs(bullet[i].speedX)){
                    bullet[i].speedX = -(bullet[i].speedX);
                }
                if (Math.abs(bullet[i].y - blocks[j].y) < bullet[i].speedY || Math.abs(bullet[i].y - (blocks[j].y + blocks[j].height)) < Math.abs(bullet[i].speedY)){
                    bullet[i].speedY = -(bullet[i].speedY);
                }
            }
        }
    }

    for (var i in person){
        for (var j in bullet){
            if (Math.sqrt(Math.pow(bullet[j].x - person[i].x, 2) + Math.pow(bullet[j].y - person[i].y, 2)) < person[i].size){
                console.log("Person Hit");

                bullet.splice(j, 1);

                person[i].id = "";
                person[i].name = "Unused";
                person[i].x = canvasWidth/4;
                person[i].y = canvasHeight - canvasHeight/4;
                person[i].size = 25;
                person[i].speed = 3;            

                io.emit("updatePosition", JSON.stringify({arr: person}));
            }
        }
    }

    io.emit("updateBulletPosition", JSON.stringify({arr: bullet}));

}, 17);

console.log('Sever has been created at Port 3000. Press CRL-C to exit.');
