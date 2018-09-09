widget = {
  //runs when we receive data from the job
  onData: function (el, data) {

    //The parameters our job passed through are in the data object
    //el is our widget element, so our actions should all be relative to that
    if (data.title) {
      $('h2', el).text(data.title);
    }
    let allData = data.data;
    console.log(allData);
    $('#data_sala', el).html(`${allData.sala_data ? allData.sala_data.val : "?"}&deg`);
    $('#data_batcave', el).html(`${allData.batcave_data ? allData.batcave_data.val : "?"}&deg`);
    $('#data_bedroom', el).html(`${allData.bedroom_data ? allData.bedroom_data.val : "?"}&deg`);
  }
};