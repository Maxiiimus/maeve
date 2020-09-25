//let socket = io();
//let ac = new AudioContext();
//let audioOn = false;
//let songtime = 100;

// This is used to hear audio playing on the client. Useful for testing, but doesn't sound great
//let piano = null;
//Soundfont.instrument(ac, 'acoustic_grand_piano').then(function (p) {
//    piano = p;
//});

// =======================================================
// Resize to get the footer to stick to the bottom
// =======================================================
$(document).on( "pagecontainershow", function(){
    ScaleContentToDevice();

    $(window).on("resize orientationchange", function(){
        ScaleContentToDevice();
    })
});

function ScaleContentToDevice(){
    scroll(0, 0);
    let content = $.mobile.getScreenHeight() - $(".ui-header").outerHeight() - $(".ui-footer").outerHeight() - $(".ui-content").outerHeight() + $(".ui-content").height();
    $(".ui-content").height(content);
    $("#songlist").height(content - $("#closeSearchPanel").outerHeight());
    $("#playlist").height(content - $("#closeSearchPanel").outerHeight());
}
// =======================================================

$("#songlist").listview({
    autodividers: true,

    // the selector function is passed a <li> element from the listview;
    // it should return the appropriate divider text for that <li>
    // element as a string
    autodividersSelector: function ( li ) {
        //console.log("li: " + li.find("p:nth-child(2)").text());

        // look for the text in the given element
        let text = $.trim( li.find("p:nth-child(2)").text() ) || null;

        if ( !text ) {
            return null;
        }

        return text;
    }
});

let toast=function(msg){
    $("<div class='ui-loader ui-overlay-shadow ui-body-e ui-corner-all'><h3>"+msg+"</h3></div>")
        .css({ display: "block",
            opacity: 0.90,
            position: "fixed",
            padding: "7px",
            "text-align": "center",
            width: "270px",
            left: ($(window).width() - 284)/2,
            top: $(window).height()/2 })
        .appendTo( $.mobile.pageContainer ).delay( 1500 )
        .fadeOut( 400, function(){
            $(this).remove();
        });
}

$(function () {
    $('#openplaylist').click(function () {
        $('#box').animate({'bottom': '0'}, 300);
    });

    $('#close').click(function () {
        $('#box').animate({'bottom': '-100%'}, 300)
    });
});

