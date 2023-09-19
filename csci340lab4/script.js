$(document).ready(function(){
    var Money = 
    $("#showCat").click(function() {
        $.ajax({
            dataType: "json",
            url: "https://api.thecatapi.com/v1/images/search",
            success: function(results) {
                console.log(results[0].url);
                $('#cat').attr("src", results[0].url);
            },
            error: function(xhr,status,error) {
              console.log(error);
            }
          });
    });
    $("#showDog").click(function() {
        $.ajax({
            dataType: "json",
            url: "https://random.dog/woof.json",
            success: function(results) {
              console.log(results["url"]);
              if (!results["url"].endsWith(".mp4")) {
                $('#dog').attr("src", results["url"]);
              }
            },
            error: function(xhr,status,error) {
              console.log(error);
            }
          });
    });
    $("#doRPS").click(function() {
        var choice1 = Math.floor(Math.random() * 100);
        console.log(choice1);
        if(choice1 <= 33){
            choice1 = 1;
            console.log("Cat Rock");
            $("#catChoice").text("Cats chose Rock!");
        }else if (choice1 <= 66){
            choice1 = 2;
            $("#catChoice").text("Cats chose Paper!");
        } else {
            choice1 = 3;
            $("#catChoice").text("Cats chose Scissors!");
        }
        var choice2 = Math.floor(Math.random() * 100);
        if(choice2 <= 33){
            choice2 = 1;
            $("#dogChoice").text("Dogs chose Rock!");
        }else if (choice2 <= 66){
            choice2 = 2;
            $("#dogChoice").text("Dogs chose Paper!");
        } else {
            choice2 = 3;
            $("#dogChoice").text("Dogs chose Scissors!");
        }
        console.log(choice2-choice1);
        if(choice2 - choice1 == 1 || choice2 - choice1 == -2){
            $("#winner").text("Dogs Win!");

        } else if (choice2 == choice1){
            $("#winner").text("Draw");
        } else{
            $("#winner").text("Cats Win!");
        }
    });
});