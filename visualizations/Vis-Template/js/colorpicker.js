/////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * Colorpicker
 *
 * */


$.fn.colorpicker = function( options ){

    if(typeof options == 'object')
        createColorPicker( this, options );
    else
        destroyColorPicker( this );
};



function createColorPicker( sender, options ){

    //// DRAW ELEMENTS
    sender.addClass("colorpicked");

    // Append colorpciker div
    var colorpicker = d3.select('body').append('div')
        .attr('class', 'colorpicker')
        .style("top", $(sender).offset().top + 25 + "px" )
        .style("left", $(sender).offset().left - 295 + "px")
        .style('display', 'none')
        .on('click', function(){ d3.event.stopPropagation(); });

    // Append canvas container
    var pickerContainer = colorpicker.append('div').attr('id',  'picker-container');

    //Append canvas
    pickerContainer.append('canvas').attr('id', 'picker')
        .attr('width', options.width)
        .attr('height', options.height);

    //Append controls
    var controlsContainer = colorpicker.append('div').attr('class', 'colorpicker-controls');

    controlsArray = [{'id': 'rVal', 'label': 'R'},
                     {'id': 'gVal', 'label': 'G'},
                     {'id': 'bVal', 'label': 'B'},
                     {'id': 'rgbVal', 'label': 'RGB'},
                     {'id': 'hexVal', 'label': 'HEX'}];

    // Data binding
    var controlsData = controlsContainer.selectAll('div').data(controlsArray);

    // Append wrapping div
    var controls = controlsData.enter().append('div');

    // Append label and input elements for controls
    controls.append('label').text(function(d){ return d.label; });
    controls.append('input')
        .attr('type', 'text')
        .attr('id', function(d){ return d.id; });

    // Append color preview
    controlsContainer.append('div').attr('id', 'preview');


    //// FUNCTIONALITY
    var canPreviewFlag = true;

    // Create canvas and retrieve context
    var canvas = $('#picker');
    var ctx = canvas.get(0).getContext('2d');

    //
    var image = new Image();
    image.src = options['img'];


    image.onload = function(){
        // Draw image on canvas
        canvas.width = options.width;
        canvas.height = options.height;
        ctx.drawImage(image, 0, 0, image.width, image.height, 0, 0, canvas.width, canvas.height);
    }

    sender.click(function(e){
        $('.colorpicker').fadeToggle('slow', 'linear');
    });


    var hexColor = '#000';    // updated on mousemove

    $('#picker').mousemove(function(e){
        //if(canPreviewFlag){
            // Get coordinates of current position
            var canvasOffset = $(canvas).offset();
            var canvasX = Math.floor(e.pageX - canvasOffset.left);
            var canvasY = Math.floor(e.pageY - canvasOffset.top);

            // Get current pixel
            var imageData = ctx.getImageData(canvasX, canvasY, 1, 1);
            var pixel = imageData.data;

            // Update controls
            $('#rVal').val(pixel[0]);
            $('#gVal').val(pixel[1]);
            $('#bVal').val(pixel[2]);
            $('#rgbVal').val(pixel[0] + ', ' + pixel[1] + ', ' + pixel[2]);

            var dColor = pixel[2] + 256 * pixel[1] + 65536 * pixel[0];
            hexColor = '#' + ('00000' + dColor.toString(16)).substr(-6);
            $('#hexVal').val(hexColor);

            // Update preview color
            //pixelColor = 'rgb(' + pixel[0] + ', ' + pixel[1] + ', ' + pixel[2] + ')';
            $('#preview').css('backgroundColor', hexColor);
        //}
    });


    var picker = $('#picker');
    var preview = $('#preview');

    $('#picker, #preview').click(function(e){
        $('.colorpicked').css('backgroundColor', hexColor);
        $('.colorpicker').fadeToggle('slow', 'linear');
    });

}



function destroyColorPicker( sender ){
    $(sender).removeClass('colorpicked');
    $('.colorpicker').remove();
}
