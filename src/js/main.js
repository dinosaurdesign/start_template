$(document).ready(function(){
    function classFunction(){
        if ($('body').width()<992){
            $("#helo").toggleClass("red");
        }
        else {
            $("#helo").toggleClass("green");
        }
    }
    classFunction();
    $(window).resize(classFunction);
})

