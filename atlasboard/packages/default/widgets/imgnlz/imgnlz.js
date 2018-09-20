widget = {
  //runs when we receive data from the job
  onData: function (el, data) {

    //The parameters our job passed through are in the data object
    //el is our widget element, so our actions should all be relative to that
    if (data.title) {
      $('h2', el).text(data.title);
    }
    $('#base', el).attr('src', 'images/sg.png');
    //Reload image
    $('#overlay1', el).removeAttr('src');
    $('#overlay1', el).attr('src', data.overlay1 ? `data:image/png;base64, ${data.overlay1}` : 'images/latest.png');
  }
};

function imgLoadError(){
  console.error("Error loading image.");
}