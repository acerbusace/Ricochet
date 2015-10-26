//CODE WRITTEN BY IBRAHIM HELMY AND ALEX PATEL 
var up, down, left, right;
var mouseDown;
var person;
var bullet;
var blocks;

var str;

$(document).ready(function () {
    io = io();

    

    canvas = document.getElementById("myCanvas");                 //  Gets te canvas by its ID
 
    canvas.addEventListener("mousedown", mouseDown, false);       // Listens for mouse clicks
    canvas.addEventListener("mousemove", mouseMove, false);       // Listens for mouse movment
    //canvas.addEventListener("click", mouseClick, false);
 
    document.body.addEventListener("mouseup", mouseUp, false);    // Listens when mouse buttons are unclicked
    document.body.addEventListener("keydown", keyDown, false);    // Listens for when keyboard keys are clicked
    document.body.addEventListener("keyup", keyUp, false);        // Listens for when the keyboard keys are unclicked

    fontSize = 20;                                                // intilizes variable that sets size of font to be 24pt

    io.on("syncData", function(data){
        var dataObj = JSON.parse(data);
        person = dataObj.arr;
        bullet = dataObj.arrTwo;
        blocks = dataObj.arrThree;
    });

    bulletSpeed = 3;
    bulletS = 1;
    bulletSS = 1;
    str = "nothing";

    up = false;
    down = false;
    left = false;
    right = false;
    mouseDown = false;

    io.on("updateControl", function(data){
        var dataObj = JSON.parse(data);
        person = dataObj.arr;
    });

    io.on("updatePosition", function(data){
        var dataObj = JSON.parse(data);
        person = dataObj.arr;
    });

    io.on("updateBulletPosition", function(data){
        var dataObj = JSON.parse(data);
        bullet = dataObj.arr;
    });

    setInterval(function (){

        for (var i in person){
            if (io.id == person[i].id && !mouseDown){
                if (up || down || left || right){
                    io.emit("requestPositionUpdate", JSON.stringify({up: this.up, down: this.down, left: this.left, right: this.right}));
                } 
            }
        }
        
        if (mouseDown){
            bulletS += 0.02;
            bulletSS += 0.005;
        }
        

        draw();
    }, 17);

});

function mouseDown(e){                                            // when mouse is clicked down
    mouseDown = true;
    e.stopPropagation();                                          
    e.preventDefault();                                           // Stop chrome from taking control of your mouse 
}

function mouseClick(e){
    e.stopPropagation();                                          
    e.preventDefault();                                           // Stop chrome from taking control of your mouse 
}
 
function mouseMove(e){
    mouseX = e.pageX - canvas.offsetLeft;                         // stores mouse's x position
    mouseY = e.pageY - canvas.offsetTop;                          // stores mouse's y position

    e.stopPropagation();

}

function mouseUp(e){                                              // stops myWord to being set to what was previously clicked
    for (var i in person){
        if (io.id == person[i].id){
            bullet.push({x: person[i].x, y: person[i].y, speedX: bulletSS*bulletSpeed*(mouseX - person[i].x)/(Math.sqrt(Math.pow(mouseX - person[i].x, 2) + Math.pow(mouseY - person[i].y, 2))), speedY: bulletSS*bulletSpeed*(mouseY - person[i].y)/(Math.sqrt(Math.pow(mouseX - person[i].x, 2) + Math.pow(mouseY - person[i].y, 2))), size: bulletS*5});
            bullet[bullet.length-1].x += bullet[bullet.length-1].speedX*person[i].size/(Math.sqrt(Math.pow(bullet[bullet.length-1].speedX, 2) + Math.pow(bullet[bullet.length-1].speedY, 2)));
            bullet[bullet.length-1].y += bullet[bullet.length-1].speedY*person[i].size/(Math.sqrt(Math.pow(bullet[bullet.length-1].speedX, 2) + Math.pow(bullet[bullet.length-1].speedY, 2)));
            io.emit("requestBulletPositionUpdate", JSON.stringify({arr: bullet}));
        }
    }
    mouseDown = false;
    bulletS = 1;
    bulletSS = 1;

    e.stopPropagation();

}

function keyDown(e){
    if (e.keyCode == 38){
        up = true;
    } 
    if (e.keyCode == 40){
        down = true;
    } 
    if (e.keyCode == 37){
        left = true;
    }
    if (e.keyCode == 39){
        right = true;
    }

}

function keyUp(e){                                               // as long as no keys are clicked, draw same frame again and again 
    if (e.keyCode == 38){
        up = false;
    } 
    if (e.keyCode == 40){
        down = false;
    } 
    if (e.keyCode == 37){
        left = false;
    }
    if (e.keyCode == 39){
        right = false;
    }
}


function handleAssignButton(){                                     // gets the text from the text field
    str = "Assign Button Clicked";
    var info = {
        name: $("#name").val(),
        controlName: $("#controlName").val()
    }

    io.emit("requestControl", JSON.stringify(info));
}




function draw(){                                                     // the function that draws the frames and canvas and words, and practically everything on screen 
    var context = canvas.getContext('2d');
    context.font = '20pt Arial';
    context.fillStyle = 'rgb(255,0,0)';
    context.clearRect(0, 0, canvas.width, canvas.height);

    

    context.fillText(mouseX + ", " + mouseY, 0, fontSize);
    context.fillText(str, 0, fontSize*2);

    for (var i in person){
        context.beginPath();
        context.arc(person[i].x, person[i].y, person[i].size, 0, Math.PI*2, true); 
        context.closePath();
        if (i == 0){
            context.fillStyle = 'rgb(255,0,0)';
        } else if (i == 1){
            context.fillStyle = 'rgb(0,255,0)';
        } else if (i == 2){
            context.fillStyle = 'rgb(0,0,255)';
        }
        context.fill();
        context.lineWidth = 3;
        context.strokeStyle = 'rgb(0,0,0)';
        context.stroke();
        context.fillText(person[i].name, person[i].x - context.measureText(person[i].name).width/2, person[i].y - person[i].size - fontSize);  
    }

    for (var i in blocks){
        context.rect(blocks[i].x, blocks[i].y, blocks[i].width, blocks[i].height);
        context.fillStyle = 'rgb(96,96,96)';
        context.fill();
        context.lineWidth = 3;
        context.strokeStyle = 'rgb(0,0,0)';
        context.stroke(); 
    }

    for (var i in bullet){
        context.fillText(bullet[i].x, ", " + bullet[i].y, 0, fontSize*3);
        context.beginPath();
        context.arc(bullet[i].x, bullet[i].y, bullet[i].size, 0, Math.PI*2, true); 
        context.closePath();
        context.fillStyle = 'rgb(0,0,0)';
        context.fill();
    }
}
