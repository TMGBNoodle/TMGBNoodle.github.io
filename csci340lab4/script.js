$(document).ready(function(){
    var Objects;
    $ajax({
        dataType: "json",
        url: "https://rps101.pythonanywhere.com/api/v1/objects/all",
        success: function(results){
            console.log(results[url]);
            Objects = results[url];
        },
        error: function(xhr,status,error) {
            console.log(error);
        }
    });
    $("#showCases").click(function() {
        var display = $("#Display")
        var displayVal = [];
        while(display.length < 10){
            var random = math.floor(math.random()*101);
            if(!Objects[random] in display){
                displayVal.push(Objects[random])
            }
        }
        for (let index = 0; index < array.length; index++) {
            display.text(display.text + ", " +displayVal[i]);
        }
    })
})